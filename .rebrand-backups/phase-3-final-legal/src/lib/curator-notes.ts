// Rotating editorial "Curator's notes" — short essays that give the Hall a
// voice and explain why selected media deserves a premium presentation.
// Deterministically selected by day-of-year so each day has a stable note.

export interface CuratorNote {
  id: string;
  title: string;
  body: string;
  signoff: string;
}

export const CURATOR_NOTES: CuratorNote[] = [
  {
    id: "liberated",
    title: "What we mean by 'liberated'",
    body:
      "Every film on this shelf has slipped free of its copyright. Every book here was written by someone who has been dead long enough that the law no longer owns their words. The result is not a discount bin — it is the opposite. These are the works that survived the filtering of a century, and they are yours, completely, to keep.",
    signoff: "The Hall",
  },
  {
    id: "archive",
    title: "A note on the Internet Archive",
    body:
      "The Internet Archive is a library in the most literal sense: it lends, preserves, and refuses to forget. The films you'll watch here are hosted by them, not us. We've simply built a room where they can be respected rather than skimmed — a Hall rather than a search result.",
    signoff: "The Hall",
  },
  {
    id: "gutenberg",
    title: "Why Gutenberg still matters",
    body:
      "Project Gutenberg began in 1971, before the web, before the personal computer was a household object. It exists because one man believed that a book entering the public domain should enter it for everyone, instantly, for free. Fifty years on, that conviction still holds. The shelf you're reading from is the proof.",
    signoff: "The Hall",
  },
  {
    id: "iptv",
    title: "On live, open television",
    body:
      "Most of the world's television is broadcast free over the air. The playlists you'll find here gather those open signals from dozens of countries and hand them to you, no subscription, no set-top box, no regional lock. It is the strangest, most international channel-surf you'll ever do — and entirely legal.",
    signoff: "The Hall",
  },
  {
    id: "value",
    title: "On valuing free things",
    body:
      "There is a peculiar modern instinct to treat freely accessible media as disposable. NO-DISH pushes back against that instinct by giving selected works a considered, premium presentation and making discovery feel intentional.",
    signoff: "The Hall",
  },
  {
    id: "preservation",
    title: "The quiet work of preservation",
    body:
      "A film that survives a century does so because someone, somewhere, kept a print in a cool basement, then a vault, then a server. The Internet Archive and Project Gutenberg are that someone, at scale. When you press play here, you're benefiting from a chain of stubbornness that began before you were born. The least we can do is make the play button beautiful.",
    signoff: "The Hall",
  },
  {
    id: "legality",
    title: "Rights-aware, by design",
    body:
      "NO-DISH does not make a blanket rights determination for every item it presents. Media is discovered from external sources, and rights status can depend on the source record, the applicable licence, and the jurisdiction in which the media is accessed. Check the source information and rights details for the item you choose.",
    signoff: "The Hall",
  },
];

/** Deterministically pick today's note (stable per day). */
export function noteForDay(dayOfYear: number): CuratorNote {
  return CURATOR_NOTES[dayOfYear % CURATOR_NOTES.length];
}
