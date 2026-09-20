import { NextRequest, NextResponse } from "next/server";

// Fetches a Project Gutenberg book's plain text server-side (no CORS) and
// strips the standard Project Gutenberg header/footer so the native reader
// only shows the actual book body.

export const dynamic = "force-dynamic";
export const maxDuration = 25;

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const MAX_BYTES = 2_400_000; // ~2.4MB safety cap

async function fetchText(id: number, timeoutMs = 12000): Promise<string | null> {
  const candidates = [
    `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,
    `https://www.gutenberg.org/files/${id}/${id}-0.txt`,
    `https://www.gutenberg.org/files/${id}/${id}.txt`,
    `https://www.gutenberg.org/ebooks/${id}.txt.utf-8`,
  ];
  for (const url of candidates) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { "User-Agent": UA, Accept: "text/plain, text/html;q=0.1, */*;q=0.1" },
      });
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();
      const text = new TextDecoder("utf-8", { fatal: false }).decode(buf.slice(0, MAX_BYTES));
      if (text && text.length > 200) return text;
    } catch {
      /* try next candidate */
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

function cleanGutenberg(raw: string): string {
  let s = raw.replace(/\r\n/g, "\n");
  // Strip the PG header (everything up to and including *** START ... ***)
  const startRe = /\*\*\*\s*START OF (?:THE|THIS)\s+PROJECT GUTENBERG EBOOK[^\n]*\*\*\*/;
  const startM = s.match(startRe);
  if (startM && startM.index !== undefined) {
    s = s.slice(startM.index + startM[0].length);
  } else {
    // Some texts use "Project Gutenberg eBook" without the *** markers.
    const alt = /\*\*\*\s*START OF[^\n]*\*\*\*/;
    const altM = s.match(alt);
    if (altM && altM.index !== undefined) s = s.slice(altM.index + altM[0].length);
  }
  // Strip the PG footer (*** END ... *** and everything after)
  const endRe = /\*\*\*\s*END OF (?:THE|THIS)\s+PROJECT GUTENBERG EBOOK[^\n]*\*\*\*/;
  const endM = s.match(endRe);
  if (endM && endM.index !== undefined) s = s.slice(0, endM.index);
  s = s.replace(/^\s+/, "");
  // Collapse runs of 3+ blank lines into a chapter break marker.
  s = s.replace(/\n{4,}/g, "\n\n\n");
  return s.trim();
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const id = Number(sp.get("gutenbergId"));
  if (!id || id <= 0) {
    return NextResponse.json({ error: "missing or invalid gutenbergId" }, { status: 400 });
  }
  try {
    const raw = await fetchText(id);
    if (!raw) {
      return NextResponse.json(
        { error: "book text unavailable — try another title" },
        { status: 502 }
      );
    }
    const text = cleanGutenberg(raw);
    return NextResponse.json({
      gutenbergId: id,
      text,
      length: text.length,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
