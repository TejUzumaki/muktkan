import { NextRequest, NextResponse } from "next/server";
import type { MovieMedia } from "@/lib/types";
import { CURATED_MOVIES, curatedToMedia } from "@/lib/movie-catalog";

// NO-DISH Movies shelf. Backbone: a curated catalog of source-provided
// films on the Internet Archive. Enriched at request time with a live
// archive.org advancedsearch call (short timeout) when the host is reachable.

export const dynamic = "force-dynamic";

const COLLECTIONS: Record<string, string> = {
  featured: "collection:feature_films AND mediatype:movies",
  scifi: "collection:SciFi_Horror AND mediatype:movies",
  animation: "collection:animation AND mediatype:movies",
  comedy: "collection:comedy AND mediatype:movies",
  noir: "collection:filmnoir AND mediatype:movies",
  silent: "collection:silent_films AND mediatype:movies",
  documentary: "collection:documentaries AND mediatype:movies",
  classics: "collection:feature_films AND mediatype:movies",
};

async function searchArchive(query: string, rows: number, timeoutMs = 5000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const url = new URL("https://archive.org/advancedsearch.php");
    url.searchParams.set("q", query);
    ["identifier", "title", "year", "description", "downloads", "creator"]
      .forEach((f) => url.searchParams.append("fl[]", f));
    url.searchParams.append("sort[]", "downloads desc");
    url.searchParams.append("rows", String(rows));
    url.searchParams.append("page", "1");
    url.searchParams.set("output", "json");
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "NO-DISH/1.0 (media discovery browser)",
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.response?.docs ?? []) as any[];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

function cleanDescription(d: unknown): string {
  if (typeof d !== "string") return "";
  return d.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 520);
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const category = sp.get("category") ?? "featured";
  const query = sp.get("q")?.trim();

  // Curated backbone filtered by category.
  let curated = CURATED_MOVIES;
  if (category && category !== "featured" && COLLECTIONS[category]) {
    curated = CURATED_MOVIES.filter((m) => m.category === category);
  }
  let items: MovieMedia[] = curated.map(curatedToMedia);

  try {
    // Attempt live archive.org enrichment (best-effort).
    const liveQuery =
      query && query.length > 1
        ? `mediatype:movies AND (${query})`
        : COLLECTIONS[category] ?? COLLECTIONS.featured;
    const docs = await searchArchive(liveQuery, 24);
    if (docs.length) {
      const existing = new Set(items.map((i) => i.identifier));
      for (const d of docs) {
        if (!d?.identifier || !d?.title) continue;
        const id = String(d.identifier);
        if (existing.has(id)) continue;
        existing.add(id);
        const poster = `https://archive.org/services/img/${id}`;
        items.unshift({
          id: `mv-${id}`,
          kind: "movie",
          identifier: id,
          title: String(d.title),
          description: cleanDescription(d.description) || "A film preserved and made available through the Internet Archive.",
          poster,
          backdrop: poster,
          year: d.year ? String(d.year) : undefined,
          creator: d.creator ? String(d.creator) : undefined,
          meta: [d.year ? String(d.year) : "", d.creator ? String(d.creator).slice(0, 40) : "", "Archive.org"].filter(Boolean),
          embedUrl: `https://archive.org/embed/${id}`,
          streamUrl: `https://archive.org/download/${id}`,
        });
      }
    }
  } catch {
    /* fall through — curated catalog is the reliable source */
  }

  if (query && query.length > 1) {
    const q = query.toLowerCase();
    items = items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        (i.creator ?? "").toLowerCase().includes(q)
    );
  }

  return NextResponse.json({ items, total: items.length, source: "curated+live" });
}
