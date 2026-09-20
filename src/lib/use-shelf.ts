"use client";

import { useEffect, useState } from "react";
import type { Media, MediaKind } from "./types";

interface ShelfResult {
  items: Media[];
  total: number;
}

const cache = new Map<string, { t: number; data: ShelfResult }>();
const TTL = 1000 * 60 * 5;

export function useShelf(kind: MediaKind, category: string, limit = 24) {
  const key = `${kind}:${category}:${limit}`;
  const [data, setData] = useState<Media[]>(() => cache.get(key)?.data.items ?? []);
  const [loading, setLoading] = useState<boolean>(() => !cache.has(key));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const path = kind === "movie" ? "movies" : kind === "book" ? "books" : "tv";

    async function load() {
      const cached = cache.get(key);
      if (cached && Date.now() - cached.t < TTL) {
        setData(cached.data.items);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const url = `/api/${path}?category=${encodeURIComponent(category)}&limit=${limit}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${path} ${res.status}`);
        const json: ShelfResult = await res.json();
        if (cancelled) return;
        cache.set(key, { t: Date.now(), data: json });
        setData(json.items ?? []);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [key, kind, category, limit]);

  return { items: data, loading, error };
}

/** Cross-source search — used by the topbar search dropdown. */
export async function searchAll(query: string): Promise<Media[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const [m, b] = await Promise.all([
    fetch(`/api/movies?q=${encodeURIComponent(q)}&limit=8`).then((r) => r.json()).catch(() => ({ items: [] })),
    fetch(`/api/books?q=${encodeURIComponent(q)}&limit=8`).then((r) => r.json()).catch(() => ({ items: [] })),
  ]);
  return [...(b.items ?? []), ...(m.items ?? [])];
}
