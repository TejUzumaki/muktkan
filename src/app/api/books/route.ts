import { NextRequest, NextResponse } from "next/server";
import type { BookMedia } from "@/lib/types";
import { CURATED_BOOKS, curatedBookToMedia } from "@/lib/book-catalog";

// NO-DISH Books shelf. Backbone: curated classic works from
// Project Gutenberg. Enriched at request time with a live Gutendex call
// (short timeout) when the host is reachable.

export const dynamic = "force-dynamic";

const TOPIC_TO_CATEGORY: Record<string, CuratedBook["category"] | undefined> = {
  popular: undefined,
  fiction: "fiction",
  mystery: "mystery",
  adventure: "adventure",
  history: "history",
  philosophy: "philosophy",
  poetry: "poetry",
  children: "children",
  science: "scifi",
};

interface CuratedBook {
  category: "fiction" | "mystery" | "adventure" | "history" | "philosophy" | "poetry" | "children" | "scifi";
}

async function fetchGutendex(topic: string, search: string, timeoutMs = 5000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const url = new URL("https://gutendex.com/books/");
    if (search && search.length > 1) {
      url.searchParams.set("search", search);
    } else if (topic) {
      url.searchParams.set("topic", topic);
    } else {
      url.searchParams.set("sort", "popular");
    }
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function firstYear(s: string): string | undefined {
  const m = s.match(/\b(1[6-9]\d{2}|20\d{2})\b/);
  return m ? m[1] : undefined;
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const category = sp.get("category") ?? "popular";
  const q = sp.get("q")?.trim();

  const cat = TOPIC_TO_CATEGORY[category];
  let curated = CURATED_BOOKS;
  if (cat) curated = CURATED_BOOKS.filter((b) => b.category === cat);
  let items: BookMedia[] = curated.map(curatedBookToMedia);

  try {
    const data = await fetchGutendex(
      cat === "scifi" ? "science" : category === "popular" ? "" : category,
      q ?? ""
    );
    if (data?.results?.length) {
      const existing = new Set(items.map((i) => i.gutenbergId));
      for (const b of data.results) {
        if (!b?.id || existing.has(b.id)) continue;
        existing.add(b.id);
        const author = b.authors?.[0]?.name ?? "Unknown";
        const cover =
          b.formats?.["image/jpeg"] ||
          `https://www.gutenberg.org/cache/epub/${b.id}/pg${b.id}.cover.medium.jpg`;
        items.unshift({
          id: `bk-${b.id}`,
          kind: "book",
          gutenbergId: b.id,
          title: b.title.replace(/\s+/g, " ").trim(),
          description: b.subjects?.slice(0, 4).join(" · ") || `A work by ${author}, available through Project Gutenberg.`,
          poster: cover,
          backdrop: cover,
          year: firstYear(b.subjects?.join(" ") ?? "") ?? undefined,
          creator: author,
          author,
          downloads: b.download_count,
          subjects: b.subjects?.slice(0, 6) ?? [],
          meta: [author, b.download_count ? `${b.download_count.toLocaleString()} reads` : "", "Gutenberg"].filter(Boolean),
          htmlUrl: b.formats?.["text/html; charset=utf-8"] || b.formats?.["text/html"] || `https://www.gutenberg.org/cache/epub/${b.id}/pg${b.id}.images.html`,
          textUrl: b.formats?.["text/plain; charset=utf-8"] || b.formats?.["text/plain"],
          epubUrl: b.formats?.["application/epub+zip"],
        });
      }
    }
  } catch {
    /* curated is the reliable source */
  }

  if (q && q.length > 1) {
    const query = q.toLowerCase();
    items = items.filter(
      (i) => i.title.toLowerCase().includes(query) || (i.author ?? "").toLowerCase().includes(query)
    );
  }

  return NextResponse.json({ items, total: items.length, source: "curated+live" });
}
