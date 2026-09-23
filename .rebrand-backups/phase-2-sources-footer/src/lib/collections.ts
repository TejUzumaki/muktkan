// Themed editorial "Collections" — MUBI-style curated groupings that pull
// titles from the curated catalogs by category + custom hand-picked sets.
// Each collection has a title, subtitle, accent flavor text, and a resolver
// that returns the Media[] for that collection.

import type { Media, MovieMedia, BookMedia } from "./types";
import { CURATED_MOVIES, curatedToMedia } from "./movie-catalog";
import { CURATED_BOOKS, curatedBookToMedia } from "./book-catalog";

export interface Collection {
  id: string;
  title: string;
  subtitle: string;
  /** A short editorial line shown in the viewer. */
  blurb: string;
  /** Emoji-free label for the kind of works. */
  era: string;
  resolve: () => Media[];
}

const movieMedia: MovieMedia[] = CURATED_MOVIES.map(curatedToMedia);
const bookMedia: BookMedia[] = CURATED_BOOKS.map(curatedBookToMedia);

const byId = <T extends { id: string }>(arr: T[], ids: string[]) =>
  ids.map((id) => arr.find((m) => m.id === id)).filter(Boolean) as T[];

export const COLLECTIONS: Collection[] = [
  {
    id: "silent-essentials",
    title: "Silent Era Essentials",
    subtitle: "Cinema before it spoke",
    blurb:
      "Before sync sound, cinema was pure image — gesture, shadow, geometry. These six are the medium's foundational grammar, still unsurpassed as visual storytelling.",
    era: "1920–1929",
    resolve: () =>
      movieMedia.filter((m) => CURATED_MOVIES.find((c) => c.identifier === m.identifier)?.category === "silent"),
  },
  {
    id: "gothic-horrors",
    title: "Gothic Horrors",
    subtitle: "Shadow, monster, dread",
    blurb:
      "Public-domain horror is the genre that travels best across a century — vampires, phantoms, sleepwalkers and the walking dead, freed from colour and CGI.",
    era: "1922–1968",
    resolve: () => [
      ...movieMedia.filter((m) => CURATED_MOVIES.find((c) => c.identifier === m.identifier)?.category === "horror"),
      ...byId(bookMedia, ["bk-345", "bk-174", "bk-2034", "bk-1952"]),
    ],
  },
  {
    id: "noir-nights",
    title: "Noir Nights",
    subtitle: "Fate, fog, fatal women",
    blurb:
      "Postwar American noir: small men crushed by coincidence, the city wet and indifferent. Six poverty-row masterpieces of guilt and inevitability.",
    era: "1945–1954",
    resolve: () =>
      movieMedia.filter((m) => CURATED_MOVIES.find((c) => c.identifier === m.identifier)?.category === "noir"),
  },
  {
    id: "foundational-sf",
    title: "Foundational Science Fiction",
    subtitle: "The futures that made ours",
    blurb:
      "The books and films that taught the twentieth century how to imagine tomorrow — from Mary Shelley's stitched-together creation to Wells's Martian cylinders to Fritz Lang's towered city.",
    era: "1818–1980",
    resolve: () => [
      ...byId(bookMedia, ["bk-84", "bk-35", "bk-36", "bk-5200"]),
      ...movieMedia.filter((m) => CURATED_MOVIES.find((c) => c.identifier === m.identifier)?.category === "scifi"),
    ],
  },
  {
    id: "philosophy-power",
    title: "Philosophy & Power",
    subtitle: "Books that argued with their century",
    blurb:
      "Five works that refuse to stay quiet: a Roman emperor's private notebook, a Florentine's manual for princes, a Chinese strategist's art of winning without fighting, and the moralists who came after.",
    era: "−500 – 1886",
    resolve: () =>
      bookMedia.filter((b) => CURATED_BOOKS.find((c) => c.gutenbergId === b.gutenbergId)?.category === "philosophy"),
  },
  {
    id: "detection-shelf",
    title: "The Detection Shelf",
    subtitle: "Holmes, vampires & unreliable governesses",
    blurb:
      "Public-domain mystery is a strange, overlapping room — Sherlock Holmes shares it with Dracula (an epistolary mystery), Jekyll & Hyde, and Henry James's haunted governess.",
    era: "1886–1902",
    resolve: () =>
      bookMedia.filter((b) => CURATED_BOOKS.find((c) => c.gutenbergId === b.gutenbergId)?.category === "mystery"),
  },
  {
    id: "childrens-classics",
    title: "Children's Classics",
    subtitle: "Books that outlive their reader",
    blurb:
      "Alice down the rabbit-hole, Dorothy on the yellow brick road, Anne of Green Gables, Jo March and her sisters, the Grimm household tales — the shelf a child first calls their own.",
    era: "1812–1908",
    resolve: () =>
      bookMedia.filter((b) => CURATED_BOOKS.find((c) => c.gutenbergId === b.gutenbergId)?.category === "children"),
  },
  {
    id: "great-novels",
    title: "The Great Novels",
    subtitle: "The 19th-century long form",
    blurb:
      "Pride and Prejudice, Jane Eyre, Wuthering Heights, Anna Karenina, Moby-Dick, Crime and Punishment, Les Misérables, Great Expectations — the canon, plainly, as it actually stands.",
    era: "1813–1877",
    resolve: () => byId(bookMedia, [
      "bk-1342", "bk-1260", "bk-768", "bk-1399", "bk-2701", "bk-2554", "bk-135", "bk-1400", "bk-67979", "bk-996", "bk-5200",
    ]),
  },
];
