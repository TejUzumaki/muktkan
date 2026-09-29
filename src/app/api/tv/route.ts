import { NextRequest, NextResponse } from "next/server";
import type {
  TvChannel,
  TvStreamQuality,
  TvStreamVariant,
} from "@/lib/types";

// IPTV — open M3U playlists from iptv-org, parsed server-side.
//
// Important:
// - Do not fetch logos.json here. It is several MB and is unnecessary
//   for the catalogue.
// - Quality and availability labels come directly from the public M3U.
// - Multiple entries for the same tvg-id are preserved as stream variants.

export const revalidate = 300;
export const dynamic = "force-dynamic";

const SOURCES: {
  url: string;
  label: string;
  region: string;
}[] = [
  {
    url: "https://iptv-org.github.io/iptv/subdivisions/in-mh.m3u",
    label: "Maharashtra",
    region: "Maharashtra",
  },
  {
    url: "https://iptv-org.github.io/iptv/countries/in.m3u",
    label: "India",
    region: "India",
  },
  {
    url: "https://iptv-org.github.io/iptv/countries/uk.m3u",
    label: "United Kingdom",
    region: "United Kingdom",
  },
  {
    url: "https://iptv-org.github.io/iptv/countries/us.m3u",
    label: "United States",
    region: "United States",
  },
];

const CATEGORY_FILTERS: Record<string, (c: TvChannel) => boolean> = {
  news: (c) => /news/i.test(c.group ?? ""),
  movies: (c) => /movie|cinema|film/i.test(c.group ?? ""),
  entertainment: (c) =>
    /entertainment|general/i.test(c.group ?? ""),
  sports: (c) => /sport/i.test(c.group ?? ""),
  music: (c) => /music/i.test(c.group ?? ""),
  kids: (c) => /kids|children|family/i.test(c.group ?? ""),
};

interface ExtInf {
  id?: string;
  name?: string;
  logo?: string;
  group?: string;
  country?: string;
  language?: string;
}

interface ParsedEntry {
  ext: ExtInf;
  url: string;
  source: string;
  region: string;
}

const QUALITY_VALUES: TvStreamQuality[] = [
  "2160p",
  "1440p",
  "1080p",
  "1080i",
  "720p",
  "576p",
  "504p",
  "480p",
  "400p",
  "396p",
  "360p",
  "240p",
  "unknown",
];

function parseAttr(
  line: string,
  key: string
): string | undefined {
  const match = line.match(
    new RegExp(`${key}="([^"]*)"`),
  );

  return match?.[1] || undefined;
}

function parseQuality(value: string): TvStreamQuality {
  const match = value.match(
    /\b(2160p|1440p|1080p|1080i|720p|576p|504p|480p|400p|396p|360p|240p)\b/i
  );

  if (!match) return "unknown";

  const normalized = match[1].toLowerCase() as TvStreamQuality;

  return QUALITY_VALUES.includes(normalized)
    ? normalized
    : "unknown";
}

function qualityRank(
  quality: TvStreamQuality
): number {
  switch (quality) {
    case "2160p":
      return 2160;
    case "1440p":
      return 1440;
    case "1080p":
      return 1080;
    case "1080i":
      return 1079;
    case "720p":
      return 720;
    case "576p":
      return 576;
    case "504p":
      return 504;
    case "480p":
      return 480;
    case "400p":
      return 400;
    case "396p":
      return 396;
    case "360p":
      return 360;
    case "240p":
      return 240;
    default:
      return 0;
  }
}

function parseM3u(
  text: string,
  source: string,
  region: string
): ParsedEntry[] {
  const lines = text.split(/\r?\n/);
  const output: ParsedEntry[] = [];

  let current: ExtInf | null = null;

  for (const raw of lines) {
    const line = raw.trim();

    if (!line) continue;

    if (line.startsWith("#EXTINF")) {
      const commaIndex = line.lastIndexOf(",");

      const rawName =
        commaIndex >= 0
          ? line.slice(commaIndex + 1).trim()
          : "";

      current = {
        id: parseAttr(line, "tvg-id"),
        name: rawName || undefined,
        logo: parseAttr(line, "tvg-logo"),
        group: parseAttr(line, "group-title"),
        country: parseAttr(line, "tvg-country"),
        language:
          parseAttr(line, "tvg-language") ||
          parseAttr(line, "tvg-language-code"),
      };
    } else if (
      !line.startsWith("#") &&
      current
    ) {
      output.push({
        ext: current,
        url: line,
        source,
        region,
      });

      current = null;
    }
  }

  return output;
}

function cleanTitle(title: string): string {
  return title
    .replace(
      /\s+\((?:2160p|1440p|1080p|1080i|720p|576p|504p|480p|400p|396p|360p|240p)\)\s*/gi,
      " "
    )
    .replace(
      /\s+\[(?:Geo-blocked|Not 24\/7)\]\s*/gi,
      " "
    )
    .replace(/\s{2,}/g, " ")
    .trim();
}

function parseLabels(title: string): string[] {
  const labels: string[] = [];

  if (/\[Geo-blocked\]/i.test(title)) {
    labels.push("Geo-blocked");
  }

  if (/\[Not 24\/7\]/i.test(title)) {
    labels.push("Not 24/7");
  }

  return labels;
}

function makeChannelKey(
  ext: ExtInf,
  source: string
): string {
  if (ext.id) {
    return ext.id.toLowerCase();
  }

  return `${cleanTitle(ext.name ?? "")}|${ext.country ?? ""}|${source}`
    .toLowerCase();
}

async function fetchSource(
  source: (typeof SOURCES)[number]
): Promise<ParsedEntry[]> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 12000);

  try {
    const response = await fetch(source.url, {
      headers: {
        Accept: "audio/x-mpegurl, text/plain",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `${source.label} ${response.status}`
      );
    }

    const text = await response.text();

    return parseM3u(
      text,
      source.label,
      source.region
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchAll(): Promise<TvChannel[]> {
  const settled = await Promise.allSettled(
    SOURCES.map(fetchSource)
  );

  const grouped = new Map<
    string,
    {
      title: string;
      logo: string;
      group: string;
      country: string;
      language?: string;
      source: string;
      region: string;
      variants: TvStreamVariant[];
    }
  >();

  for (const result of settled) {
    if (result.status !== "fulfilled") continue;

    for (const entry of result.value) {
      const ext = entry.ext;

      if (!entry.url || !ext.name) continue;

      const key = makeChannelKey(
        ext,
        entry.source
      );

      const title = cleanTitle(ext.name);
      const labels = parseLabels(ext.name);
      const quality = parseQuality(ext.name);

      const variant: TvStreamVariant = {
        url: entry.url,
        quality,
        labels,
        title,
      };

      const existing = grouped.get(key);

      if (!existing) {
        grouped.set(key, {
          title,
          logo: ext.logo || "",
          group: ext.group || "General",
          country: ext.country || entry.source,
          language: ext.language,
          source: entry.source,
          region: entry.region,
          variants: [variant],
        });

        continue;
      }

      const duplicate = existing.variants.some(
        (item) => item.url === variant.url
      );

      if (!duplicate) {
        existing.variants.push(variant);
      }

      if (!existing.logo && ext.logo) {
        existing.logo = ext.logo;
      }

      // Maharashtra is the most useful regional identity
      // when the same channel also exists in the India list.
      if (entry.region === "Maharashtra") {
        existing.region = "Maharashtra";
      }

      if (
        !existing.language &&
        ext.language
      ) {
        existing.language = ext.language;
      }
    }
  }

  const channels: TvChannel[] = [];

  for (const [
    key,
    value,
  ] of grouped.entries()) {
    const variants = value.variants
      .slice()
      .sort((a, b) => {
        const aGeo = a.labels.includes("Geo-blocked");
        const bGeo = b.labels.includes("Geo-blocked");

        if (aGeo !== bGeo) {
          return aGeo ? 1 : -1;
        }

        const a24 = a.labels.includes("Not 24/7");
        const b24 = b.labels.includes("Not 24/7");

        if (a24 !== b24) {
          return a24 ? 1 : -1;
        }

        return (
          qualityRank(b.quality) -
          qualityRank(a.quality)
        );
      });

    const preferred =
      variants.find(
        (variant) =>
          !variant.labels.includes("Geo-blocked")
      ) ??
      variants[0];

    if (!preferred) continue;

    const nonGeoVariants = variants.filter(
      (variant) =>
        !variant.labels.includes("Geo-blocked")
    );

    const allGeo =
      variants.length > 0 &&
      nonGeoVariants.length === 0;

    const bestQuality =
      variants
        .slice()
        .sort(
          (a, b) =>
            qualityRank(b.quality) -
            qualityRank(a.quality)
        )[0]?.quality ?? "unknown";

    const isNot24x7 =
      preferred.labels.includes("Not 24/7");

    channels.push({
      id: `tv-${Math.abs(hash(key))}`,
      kind: "tv",
      title: value.title,
      description: value.group
        ? `${value.group} · ${value.source}`
        : `Live channel from ${value.source}`,
      poster: value.logo,
      backdrop: value.logo,
      logo: value.logo,
      streamUrl: preferred.url,
      country: value.country,
      group: value.group,
      region: value.region,
      quality: bestQuality,
      geoBlocked: allGeo,
      not24x7: isNot24x7,
      streamVariants: variants,
      meta: [
        value.group || "Live",
        value.language || "Unknown language",
        value.source,
        value.region,
      ],
    });
  }

  return channels;
}

function hash(value: string): number {
  let hashValue = 0;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    hashValue =
      (Math.imul(31, hashValue) +
        value.charCodeAt(index)) |
      0;
  }

  return hashValue;
}

export async function GET(
  req: NextRequest
) {
  const searchParams =
    req.nextUrl.searchParams;

  const category =
    searchParams.get("category") ?? "all";

  const requestedLimit = Number(
    searchParams.get("limit") ?? 500
  );

  const limit = Math.min(
    Number.isFinite(requestedLimit)
      ? requestedLimit
      : 500,
    500
  );

  try {
    let channels = await fetchAll();

    if (
      category !== "all" &&
      CATEGORY_FILTERS[category]
    ) {
      channels = channels.filter(
        CATEGORY_FILTERS[category]
      );
    }

    const titleOf = (channel: TvChannel) =>
      channel.title.toLowerCase();

    const groupOf = (channel: TvChannel) =>
      (channel.group ?? "").toLowerCase();

    const languageOf = (channel: TvChannel) =>
      String(
        channel.meta?.[1] ?? ""
      ).toLowerCase();

    const isSports = (
      channel: TvChannel
    ) =>
      /sport|football|cricket|tennis|formula|f1/i.test(
        `${groupOf(channel)} ${titleOf(channel)}`
      );

    const isMaharashtra = (
      channel: TvChannel
    ) =>
      channel.region === "Maharashtra" ||
      /marathi|maharashtra/i.test(
        `${titleOf(channel)} ${languageOf(channel)}`
      );

    const isIndia = (
      channel: TvChannel
    ) =>
      channel.region === "India" ||
      channel.region === "Maharashtra" ||
      /india|bharat/i.test(
        `${channel.country ?? ""} ${channel.description}`
      );

    const score = (
      channel: TvChannel
    ) => {
      let value = 0;

      if (isMaharashtra(channel)) {
        value += 1200;
      } else if (isIndia(channel)) {
        value += 850;
      }

      if (isSports(channel)) {
        value += 180;
      }

      if (channel.logo) {
        value += 40;
      }

      if (!channel.geoBlocked) {
        value += 25;
      }

      if (!channel.not24x7) {
        value += 10;
      }

      value -=
        titleOf(channel).charCodeAt(0) /
        10000;

      return value;
    };

    channels.sort(
      (a, b) => score(b) - score(a)
    );

    channels = channels.slice(
      0,
      Math.min(limit, 500)
    );

    return NextResponse.json({
      items: channels,
      total: channels.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        items: [],
        error:
          error instanceof Error
            ? error.message
            : "TV catalogue unavailable",
      },
      { status: 502 }
    );
  }
}
