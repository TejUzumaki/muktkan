import { NextRequest, NextResponse } from "next/server";
import type { TvChannel } from "@/lib/types";

// IPTV — open m3u playlists from iptv-org, parsed server-side.

export const revalidate = 0;
export const dynamic = "force-dynamic";

const SOURCES: { url: string; label: string }[] = [
  { url: "https://iptv-org.github.io/iptv/countries/in.m3u", label: "India" },
  { url: "https://iptv-org.github.io/iptv/countries/us.m3u", label: "United States" },
  { url: "https://iptv-org.github.io/iptv/countries/uk.m3u", label: "United Kingdom" },
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
        meta: [ext.group || "Live", source],
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
  const limit = Math.min(Number(sp.get("limit") ?? 36), 500);

  try {
    let channels = await fetchAll();
    if (category !== "all" && CATEGORY_FILTERS[category]) {
      channels = channels.filter(CATEGORY_FILTERS[category]);
    }
    channels.sort((a, b) => (b.logo ? 1 : 0) - (a.logo ? 1 : 0));
    channels = channels.slice(0, limit);

    return NextResponse.json({ items: channels, total: channels.length });
  } catch (e) {
    return NextResponse.json(
      { items: [], error: (e as Error).message },
      { status: 502 }
    );
  }
}
