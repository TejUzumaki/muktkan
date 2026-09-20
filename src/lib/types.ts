// Core media types for Muktkan — normalized across all three sources.

export type MediaKind = "movie" | "book" | "tv";

export interface BaseMedia {
  id: string;
  kind: MediaKind;
  title: string;
  description: string;
  poster: string;
  year?: string;
  creator?: string;
  meta?: string[];
  /** Best-effort backdrop for hero tinting. */
  backdrop?: string;
}

export interface MovieMedia extends BaseMedia {
  kind: "movie";
  identifier: string;
  /** Archive.org embed URL. */
  embedUrl: string;
  /** Direct stream file (may be mp4/ogv). */
  streamUrl?: string;
  runtime?: string;
}

export interface BookMedia extends BaseMedia {
  kind: "book";
  gutenbergId: number;
  /** HTML reader URL on gutenberg.org. */
  htmlUrl: string;
  /** Plain text URL. */
  textUrl?: string;
  epubUrl?: string;
  author?: string;
  downloads?: number;
  subjects?: string[];
}

export interface TvChannel extends BaseMedia {
  kind: "tv";
  streamUrl: string;
  logo: string;
  country?: string;
  group?: string;
}

export type Media = MovieMedia | BookMedia | TvChannel;

export type ReadingOrientation = "scroll" | "paginated" | "sepia";

export interface UserProfile {
  name: string;
  avatarSeed: number;
  avatarKind: number;
}

export interface AccentPreset {
  id: string;
  name: string;
  /** OKLCH string used directly as --brand. */
  brand: string;
  swatch: string;
}
