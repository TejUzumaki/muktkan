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

export type TvStreamQuality =
  | "2160p"
  | "1440p"
  | "1080p"
  | "1080i"
  | "720p"
  | "576p"
  | "504p"
  | "480p"
  | "400p"
  | "396p"
  | "360p"
  | "240p"
  | "unknown";

export interface TvStreamVariant {
  url: string;
  quality: TvStreamQuality;
  labels: string[];
  title?: string;
  feed?: string;
}

export interface TvChannel extends BaseMedia {
  kind: "tv";
  streamUrl: string;
  logo: string;
  country?: string;
  group?: string;
  region?: string;

  /**
   * Known source-level stream variants from iptv-org.
   * The player may additionally discover multiple HLS levels
   * inside a master playlist.
   */
  streamVariants?: TvStreamVariant[];

  /** Best known source quality. */
  quality?: TvStreamQuality;

  /** True when every known source variant is geo-blocked. */
  geoBlocked?: boolean;

  /** True when the preferred source is marked Not 24/7. */
  not24x7?: boolean;
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
