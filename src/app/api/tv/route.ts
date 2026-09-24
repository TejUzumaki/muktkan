import { NextRequest, NextResponse } from "next/server";
import type { TvChannel } from "@/lib/types";

// IPTV — open m3u playlists from iptv-org, parsed server-side.

export const revalidate = 0;
export const dynamic = "force-dynamic";

const SOURCES: { url: string; label: string; region?: string }[] = [
  { url: "https://iptv-org.github.io/iptv/subdivisions/in-mh.m3u", label: "Maharashtra", region: "Maharashtra" },
  { url: "https://iptv-org.github.io/iptv/countries/in.m3u", label: "India", region: "India" },
  { url: "https://iptv-org.github.io/iptv/countries/uk.m3u", label: "United Kingdom", region: "United Kingdom" },
  { url: "https://iptv-org.github.io/iptv/countries/us.m3u", label: "United States", region: "United States" },
];

const CATEGORY_FILTERS: Record<string, (c: TvChannel) => boolean> = {
  news: (c) => /news/i.test(c.group ?? ""),
  movies: (c) => /movie|cinema|film/i.test(c.group ?? ""),
  entertainment: (c) => /entertainment|general/i.test(c.group ?? ""),
  sports: (c) => /sport/i.test(c.group ?? ""),
  music: (c) => /music/i.test(c.group ?? ""),
  kids: (c) => /kids|children|family/i.test(c.group ?? ""),
};

interface ExtInf {
  name?: string;
  logo?: string;
  group?: string;
  country?: string;
  language?: string;
}

function parseAttr(line: string, key: string): string | undefined {
  const m = line.match(new RegExp(`${key}="([^"]*)"`));
  return m ? m[1] : undefined;
}

function parseM3u(text: string): { ext: ExtInf; url: string }[] {
  const lines = text.split(/\r?\n/);
  const out: { ext: ExtInf; url: string }[] = [];
  let current: ExtInf | null = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#EXTINF")) {
      const commaIdx = line.lastIndexOf(",");
      const name = commaIdx >= 0 ? line.slice(commaIdx + 1).trim() : undefined;
      current = {
        name,
        logo: parseAttr(line, "tvg-logo"),
        group: parseAttr(line, "group-title"),
        country: parseAttr(line, "tvg-country"),
      };
    } else if (!line.startsWith("#") && current) {
      out.push({ ext: current, url: line });
      current = null;
    }
  }
  return out;
}

async function fetchAll(): Promise<TvChannel[]> {
  const settled = await Promise.allSettled(
    SOURCES.map(async (s) => {
      const res = await fetch(s.url, { headers: { Accept: "audio/x-mpegurl, text/plain" } });
      if (!res.ok) throw new Error(`${s.label} ${res.status}`);
      const text = await res.text();
      return parseM3u(text).map((p) => ({ ...p, source: s.label }));
    })
  );

  const seen = new Set<string>();
  const channels: TvChannel[] = [];
  for (const r of settled) {
    if (r.status !== "fulfilled") continue;
    for (const { ext, url, source } of r.value) {
      if (!url || !ext.name) continue;
      if (seen.has(url)) continue;
      seen.add(url);
      const logo = ext.logo || "";
      channels.push({
        id: `tv-${channels.length}-${Math.abs(hash(url))}`,
        kind: "tv",
        title: ext.name,
        description: ext.group
          ? `${ext.group} · ${source}`
          : `Live channel from ${source}`,
        poster: logo,
        backdrop: logo,
        logo,
        streamUrl: url,
        country: ext.country || source,
        group: ext.group || "General",
        meta: [
          ext.group || "Live",
          ext.language || "Unknown language",
          source,
        ],

      });
    }
  }
  return channels;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h;
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const category = sp.get("category") ?? "all";
  const limit = Math.min(Number(sp.get("limit") ?? 500), 500);

  try {
    let channels = await fetchAll();
    if (category !== "all" && CATEGORY_FILTERS[category]) {
      channels = channels.filter(CATEGORY_FILTERS[category]);
    }
    const languageOf = (c: TvChannel) =>
      String(c.meta?.[1] || "").toLowerCase();

    const groupOf = (c: TvChannel) =>
      String(c.group || "").toLowerCase();

    const titleOf = (c: TvChannel) =>
      String(c.title || "").toLowerCase();

    const isSports = (c: TvChannel) =>
      /sport|sports|football|cricket|tennis|f1|formula/i.test(
        `${groupOf(c)} ${titleOf(c)}`
      );

    const isMaharashtra = (c: TvChannel) =>
      /maharashtra|marathi|mh/i.test(
        `${String(c.country || "")} ${String(c.description || "")} ${titleOf(c)} ${languageOf(c)}`
      );

    const isIndia = (c: TvChannel) =>
      /india|in$/i.test(String(c.country || "")) ||
      /india|bharat/i.test(String(c.description || ""));

    const score = (c: TvChannel) => {
      let value = 0;

      // Regional Indian discovery comes first.
      if (isMaharashtra(c)) value += 1000;
      else if (isIndia(c)) value += 700;

      // Sports is intentionally surfaced prominently.
      if (isSports(c)) value += 180;

      // Real logos are preferable to empty entries.
      if (c.logo) value += 40;

      // Stable alphabetical fallback.
      value -= titleOf(c).charCodeAt(0) / 10000;

      return value;
    };

    channels.sort((a, b) => score(b) - score(a));
    channels = channels.slice(0, Math.min(limit, 500));

    return NextResponse.json({ items: channels, total: channels.length });
  } catch (e) {
    return NextResponse.json(
      { items: [], error: (e as Error).message },
      { status: 502 }
    );
  }
}
