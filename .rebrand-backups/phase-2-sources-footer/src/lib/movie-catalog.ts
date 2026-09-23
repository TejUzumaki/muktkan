import type { MovieMedia } from "./types";

// A curated catalog of genuine public-domain feature films preserved on the
// Internet Archive. These identifiers are stable, well-known archive.org
// items. Used as the reliable backbone of the Movies shelf (live archive.org
// search is attempted at request time and merged on top when reachable).

export interface CuratedMovie {
  identifier: string;
  title: string;
  year: string;
  director: string;
  blurb: string;
  category: "featured" | "noir" | "silent" | "scifi" | "horror" | "comedy" | "documentary" | "classics";
}

export const CURATED_MOVIES: CuratedMovie[] = [
  { identifier: "NightOfTheLivingDead", title: "Night of the Living Dead", year: "1968", director: "George A. Romero", category: "horror", blurb: "The foundational modern zombie horror — seven strangers barricade themselves inside a farmhouse as the dead walk the Pennsylvania night." },
  { identifier: "Nosferatu", title: "Nosferatu, A Symphony of Horror", year: "1922", director: "F.W. Murnau", category: "silent", blurb: "Expressionist shadow-vampire Count Orlok creeps through a Expressionist Bremen in this unofficial Dracula adaptation." },
  { identifier: "TheStranger", title: "The Stranger", year: "1946", director: "Orson Welles", category: "noir", blurb: "A Nazi war criminal hides as a small-town Connecticut professor while a federal investigator closes in. Welles directs and stars." },
  { identifier: "HisGirlFriday", title: "His Girl Friday", year: "1940", director: "Howard Hawks", category: "comedy", blurb: "A fast-talking newspaper editor sabotages his ex-wife's remarriage with one last scoophunt. The screwball benchmark." },
  { identifier: "Charade1963", title: "Charade", year: "1963", director: "Stanley Donen", category: "featured", blurb: "Cary Grant and Audrey Hepburn chase stolen gold across a Hitchcock-cool Paris in the best suspense romance nobody made." },
  { identifier: "CarnivalOfSouls", title: "Carnival of Souls", year: "1962", director: "Herk Harvey", blurb: "A church organist survives a car crash only to be drawn toward an abandoned Salt Lake pavilion and its pale, dancing ghouls.", category: "horror" },
  { identifier: "Plan9FromOuterSpace", title: "Plan 9 from Outer Space", year: "1959", director: "Ed Wood", blurb: "Aliens resurrect the dead to stop humanity's doomsday weapons. Ed Wood's beloved, berserk sci-fi touchstone.", category: "scifi" },
  { identifier: "HouseOnHauntedHill1959", title: "House on Haunted Hill", year: "1959", director: "William Castle", blurb: "Vincent Price pays five strangers $10,000 each to survive a night in a locked haunted house. Party favors included.", category: "horror" },
  { identifier: "TheLastManOnEarth1964", title: "The Last Man on Earth", year: "1964", director: "Ubaldo Ragona", blurb: "Vincent Price is the lone survivor of a vampire plague, hunting the undead by day and barricading by night.", category: "scifi" },
  { identifier: "TheGeneral1926", title: "The General", year: "1926", director: "Buster Keaton", blurb: "A Confederate engineer chases his stolen locomotive and his girl across Civil War lines. The pinnacle of silent physical comedy.", category: "silent" },
  { identifier: "PhantomOfTheOpera1925", title: "The Phantom of the Opera", year: "1925", director: "Rupert Julian", blurb: "Lon Chaney's unmasking still shocks — the disfigured Phantom haunts the Paris Opéra for the love of Christine.", category: "silent" },
  { identifier: "Metropolis1925", title: "Metropolis", year: "1927", director: "Fritz Lang", blurb: "In a towering future city, the son of a tycoon and a worker prophetess try to bridge the gulf between elite and enslaved.", category: "scifi" },
  { identifier: "Detour_1945", title: "Detour", year: "1945", director: "Edgar G. Ulmer", blurb: "A broke pianist hitchhikes into a nightmare of guilt and fatal coincidence. Poverty-row noir at its most feral.", category: "noir" },
  { identifier: "DOA_1949", title: "D.O.A.", year: "1949", director: "Rudolph Maté", blurb: "A small-town accountant is slipped luminous poison and has one day to find his own murderer before the lights go out.", category: "noir" },
  { identifier: "BeatTheDevil", title: "Beat the Devil", year: "1953", director: "John Huston", blurb: "Bogart leads a crew of grifters stranded in an Italian port, waiting on a ship to East African uranium. Tongue firmly in cheek.", category: "featured" },
  { identifier: "Suddenly", title: "Suddenly", year: "1954", director: "Lewis Allen", blurb: "Frank Sinatra is the cold-eyed hitman holding a small-town family's house so he can shoot the President's train.", category: "noir" },
  { identifier: "MyManGodfrey", title: "My Man Godfrey", year: "1936", director: "Gregory La Cava", blurb: "A Park Avenue socialite hires a forgotten man from the city dump as her butler — and the family's chaos reorganizes him.", category: "comedy" },
  { identifier: "RoyalWedding1951", title: "Royal Wedding", year: "1951", director: "Stanley Donen", blurb: "Fred Astaire dances on the ceiling and courts Jane Powell while a song-and-dance act tours London during a royal wedding.", category: "comedy" },
  { identifier: "McLintock1963", title: "McLintock!", year: "1963", director: "Andrew V. McLaglen", blurb: "John Wayne is a cattle baron brawling with homesteaders, his estranged wife, and his daughter's beau out west.", category: "comedy" },
  { identifier: "PandorasBox", title: "Pandora's Box", year: "1929", director: "G.W. Pabst", blurb: "Louise Brooks' Lulu — the luminous, destructive showgirl whose lovers tumble to ruin around her. Silent cinema's most modern heroine.", category: "silent" },
  { identifier: "TheCabinetOfDrCaligari1920", title: "The Cabinet of Dr. Caligari", year: "1920", director: "Robert Wiene", blurb: "A sleepwalker murders through a jagged, painted nightmare of a town. The definitive German Expressionist film.", category: "silent" },
  { identifier: "TheHitch-Hiker", title: "The Hitch-Hiker", year: "1953", director: "Ida Lupino", blurb: "Two vacationers pick up a serial killer who keeps them at gunpoint across the Mexican desert. Directed by Hollywood's only woman noir auteur.", category: "noir" },
  { identifier: "TooLateForTears1949", title: "Too Late for Tears", year: "1949", director: "Byron Haskin", blurb: "Lizabeth Scott finds a bag of stolen cash in her car and decides to keep it, sliding into blackmail and murder.", category: "noir" },
  { identifier: "TheLittleShopOfHorrors1960", title: "The Little Shop of Horrors", year: "1960", director: "Roger Corman", blurb: "A clumsy skid-row florist cultivates a talking, bloodthirsty plant named Audrey Junior. Jack Nicholson cameos.", category: "horror" },
  { identifier: "AWalkInTheSun", title: "A Walk in the Sun", year: "1945", director: "Lewis Milestone", blurb: "A WWII platoon lands at Salerno and grinds toward a fortified farmhouse, talking themselves through every step.", category: "documentary" },
  { identifier: "TheSoutherner", title: "The Southerner", year: "1945", director: "Jean Renoir", blurb: "A Texas sharecropper family bets everything on a single cotton harvest. Renoir's loving American pastoral.", category: "classics" },
  { identifier: "GulliversTravels1939", title: "Gulliver's Travels", year: "1939", director: "Dave Fleischer", blurb: "Fleischer Studios' lush animated voyage to Lilliput and Brobdingnag, with Gabby the town crier stealing every scene.", category: "classics" },
  { identifier: "Superman1941", title: "Superman (Fleischer Shorts)", year: "1941", director: "Dave Fleischer", blurb: "The groundbreaking animated shorts that defined how the Man of Steel would fly, bend steel, and outrun bullets.", category: "classics" },
  { identifier: "PhantomFromSpace", title: "Phantom from Space", year: "1953", director: "W. Lee Wilder", blurb: "An invisible, helmeted survivor of a saucer crash is hunted across the California coast. Low-budget sci-fi paranoia.", category: "scifi" },
  { identifier: "TheOutlaw", title: "The Outlaw", year: "1943", director: "Howard Hughes", blurb: "Billy the Kid, Pat Garrett and Doc Holliday square off over a stolen horse — and Jane Russell's Rio McDonald.", category: "featured" },
  { identifier: "TheKid1921", title: "The Kid", year: "1921", director: "Charlie Chaplin", blurb: "The Tramp raises an abandoned newsboy found in an alley, until welfare officers tear them apart. Chaplin's first feature.", category: "silent" },
  { identifier: "TheAnimalWorld", title: "The Animal World", year: "1956", director: "Irwin Allen", blurb: "A theatrical nature documentary climaxing in a Ray Harryhausen stop-motion dinosaur sequence across prehistory.", category: "documentary" },
  { identifier: "Impact1949", title: "Impact", year: "1949", director: "Arthur Lubin", blurb: "A businessman survives his wife's murder attempt in San Francisco only to be presumed dead — and watches her scheme unravel.", category: "noir" },
  { identifier: "KillerShrews1959", title: "The Killer Shrews", year: "1959", director: "Ray Kellogg", blurb: "Scientists on an island breed giant venomous shrews; a supply boat crew is trapped in a hurricane with them.", category: "horror" },
  { identifier: "VirusFukkatsuNoHi", title: "Virus", year: "1980", director: "Kinji Fukasaku", blurb: "A plague wipes out nearly all of humanity; an Antarctic outpost holds the last scientists searching for a cure.", category: "scifi" },
];

export function curatedToMedia(c: CuratedMovie): MovieMedia {
  const id = c.identifier;
  return {
    id: `mv-${id}`,
    kind: "movie",
    identifier: id,
    title: c.title,
    description: c.blurb,
    poster: `https://archive.org/services/img/${id}`,
    backdrop: `https://archive.org/services/img/${id}`,
    year: c.year,
    creator: c.director,
    runtime: undefined,
    meta: [c.year, c.director, "Archive.org"].filter(Boolean),
    embedUrl: `https://archive.org/embed/${id}`,
    streamUrl: `https://archive.org/download/${id}`,
  };
}
