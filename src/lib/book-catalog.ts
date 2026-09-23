import type { BookMedia } from "./types";

// Curated backbone of classic works available through external sources hosted by Project Gutenberg.
// IDs are stable gutenberg.org ebook numbers; covers & the HTML reader are
// loaded by the user's browser from gutenberg.org (reachable). A live
// Gutendex call is attempted at request time and merged on top when reachable.

export interface CuratedBook {
  gutenbergId: number;
  title: string;
  author: string;
  year: string;
  category: "fiction" | "mystery" | "adventure" | "history" | "philosophy" | "poetry" | "children" | "science" | "scifi";
  subjects: string[];
  blurb: string;
}

export const CURATED_BOOKS: CuratedBook[] = [
  { gutenbergId: 1342, title: "Pride and Prejudice", author: "Jane Austen", year: "1813", category: "fiction", subjects: ["Courtship", "Social satire", "England"], blurb: "Elizabeth Bennet's wit meets Mr Darcy's pride across the drawing rooms of Regency England. The novel that taught English fiction how to be sharp and tender at once." },
  { gutenbergId: 84, title: "Frankenstein; or, The Modern Prometheus", author: "Mary Wollstonecraft Shelley", year: "1818", category: "scifi", subjects: ["Gothic", "Science", "Responsibility"], blurb: "A student's stitched-together creation wakes, learns language, and is rejected by the world — and by its maker. The founding myth of modern science fiction." },
  { gutenbergId: 345, title: "Dracula", author: "Bram Stoker", year: "1897", category: "mystery", subjects: ["Gothic", "Epistolary", "Transylvania"], blurb: "Jonathan Harker's letters, diaries and phonograph cylinders chase the Count from a Carpathian castle to a Whitby shipwreck to a London bedroom." },
  { gutenbergId: 2701, title: "Moby-Dick; or, The Whale", author: "Herman Melville", year: "1851", category: "adventure", subjects: ["Whaling", "Obsession", "Sea"], blurb: "Ishmael ships aboard the Pequod under Captain Ahab, who hunts the white whale that took his leg across every ocean of the world." },
  { gutenbergId: 11, title: "Alice's Adventures in Wonderland", author: "Lewis Carroll", year: "1865", category: "children", subjects: ["Fantasy", "Nonsense", "Children"], blurb: "A curious girl tumbles down a rabbit-hole into a tea party of logic, riddles and a very late rabbit. Wonderland has never stopped being modern." },
  { gutenbergId: 1661, title: "The Adventures of Sherlock Holmes", author: "Arthur Conan Doyle", year: "1892", category: "mystery", subjects: ["Detective", "Victorian", "London"], blurb: "Twelve cases that founded the modern detective story — A Scandal in Bohemia, The Red-Headed League, The Speckled Band and more, narrated by Dr Watson." },
  { gutenbergId: 76, title: "Adventures of Huckleberry Finn", author: "Mark Twain", year: "1884", category: "adventure", subjects: ["Mississippi", "Friendship", "Freedom"], blurb: "Huck and the runaway Jim raft down the Mississippi, meeting grifters, feuds and thunderstorms. The great American voice of the river." },
  { gutenbergId: 1952, title: "The Yellow Wallpaper", author: "Charlotte Perkins Gilman", year: "1892", category: "fiction", subjects: ["Gothic", "Feminism", "Madness"], blurb: "A woman prescribed a 'rest cure' in a nursery with barred windows slowly reads a woman moving inside the wallpaper. A founding feminist horror." },
  { gutenbergId: 174, title: "The Picture of Dorian Gray", author: "Oscar Wilde", year: "1890", category: "fiction", subjects: ["Decadence", "Aestheticism", "Morality"], blurb: "A beautiful young man wishes his portrait would age in his stead — and it does, recording every sin while he stays unmarked. Wilde's only novel." },
  { gutenbergId: 46, title: "A Christmas Carol. In Prose. Being a Ghost Story of Christmas", author: "Charles Dickens", year: "1843", category: "fiction", subjects: ["Christmas", "Redemption", "Ghosts"], blurb: "Ebenezer Scrooge is walked through his past, present and yet-to-come by three spirits on a single frozen Christmas Eve." },
  { gutenbergId: 98, title: "A Tale of Two Cities", author: "Charles Dickens", year: "1859", category: "history", subjects: ["French Revolution", "Sacrifice", "Resurrection"], blurb: "It was the best of times, it was the worst — Sydney Carton and Doctor Manette cross between London and Paris as the Terror rises." },
  { gutenbergId: 35, title: "The Time Machine", author: "H. G. Wells", year: "1895", category: "scifi", subjects: ["Time travel", "Dystopia", "Evolution"], blurb: "A Victorian inventor builds a brass saddle-on-sled and rides to the year 802,701, where the Eloi play above and the Morlocks farm below." },
  { gutenbergId: 36, title: "The War of the Worlds", author: "H. G. Wells", year: "1898", category: "scifi", subjects: ["Invasion", "Mars", "Apocalypse"], blurb: "Cylinders fall on Surrey and three-legged fighting machines stride across a burning Home Counties. The original alien-invasion novel." },
  { gutenbergId: 55, title: "The Wonderful Wizard of Oz", author: "L. Frank Baum", year: "1900", category: "children", subjects: ["Fantasy", "Quest", "Kansas"], blurb: "A Kansas cyclone drops Dorothy and Toto in a land of munchkins and witches; she walks the yellow brick road with a scarecrow, a tin man and a cowardly lion." },
  { gutenbergId: 120, title: "Treasure Island", author: "Robert Louis Stevenson", year: "1883", category: "adventure", subjects: ["Pirates", "Buried gold", "Coming of age"], blurb: "Jim Hawkins finds a map, ships on the Hispaniola, and learns that the charming cook Long John Silver is the most dangerous man afloat." },
  { gutenbergId: 1184, title: "The Count of Monte Cristo", author: "Alexandre Dumas", year: "1844", category: "adventure", subjects: ["Revenge", "Escape", "France"], blurb: "Edmond Dantès is framed on his wedding day, escapes the Château d'If after fourteen years, and remakes himself as an avenging count." },
  { gutenbergId: 135, title: "Les Misérables", author: "Victor Hugo", year: "1862", category: "history", subjects: ["France", "Justice", "Redemption"], blurb: "Jean Valjean runs from Inspector Javert for nineteen years, through Waterloo, a Paris barricade, and a sewer, carrying Cosette toward love." },
  { gutenbergId: 844, title: "The Importance of Being Earnest", author: "Oscar Wilde", year: "1895", category: "poetry", subjects: ["Comedy", "Manners", "Identity"], blurb: "Two gentlemen invent alter egos named Ernest to escape town and country obligations — and propose to women who will only marry an Ernest." },
  { gutenbergId: 1399, title: "Anna Karenina", author: "Leo Tolstoy", year: "1877", category: "fiction", subjects: ["Russia", "Adultery", "Society"], blurb: "Anna leaves her husband and son for the officer Vronsky while, beside her, Levin courts Kitty and works his fields. The novel of marriage." },
  { gutenbergId: 2554, title: "Crime and Punishment", author: "Fyodor Dostoevsky", year: "1866", category: "philosophy", subjects: ["Guilt", "Petersburg", "Conscience"], blurb: "Raskolnikov murders a pawnbroker to prove his theory of the extraordinary man — then spends the novel being undone by his own conscience." },
  { gutenbergId: 2600, title: "War and Peace", author: "Leo Tolstoy", year: "1869", category: "history", subjects: ["Napoleonic wars", "Russia", "Family"], blurb: "The Rostovs, Bolkonskys and Bezukhovs love, grieve and march through Austerlitz and Borodino as Napoleon burns Moscow." },
  { gutenbergId: 158, title: "Emma", author: "Jane Austen", year: "1815", category: "fiction", subjects: ["Matchmaking", "Comedy", "England"], blurb: "Emma Woodhouse, 'handsome, clever, and rich', amuses herself by arranging her friends' hearts — and is wrong about nearly all of it." },
  { gutenbergId: 1260, title: "Jane Eyre", author: "Charlotte Brontë", year: "1847", category: "fiction", subjects: ["Gothic", "Independence", "Love"], blurb: "An orphaned governess takes a post at Thornfield Hall, where the brooding Mr Rochester keeps a secret behind a locked third-floor door." },
  { gutenbergId: 768, title: "Wuthering Heights", author: "Emily Brontë", year: "1847", category: "fiction", subjects: ["Moors", "Revenge", "Obsession"], blurb: "Heathcliff and Catherine love across the Yorkshire moors and beyond the grave, destroying two generations of Earnshaws and Lintons." },
  { gutenbergId: 1400, title: "Great Expectations", author: "Charles Dickens", year: "1861", category: "fiction", subjects: ["Coming of age", "Gentility", "London"], blurb: "Pip helps a chained convict in the marshes, then receives a secret fortune, then learns exactly whose money it is." },
  { gutenbergId: 730, title: "Oliver Twist", author: "Charles Dickens", year: "1838", category: "fiction", subjects: ["Workhouse", "Crime", "London"], blurb: "An orphan asks for more and is sold to an undertaker, then falls in with Fagin's gang of boy pickpockets and the brutal Bill Sikes." },
  { gutenbergId: 514, title: "Little Women", author: "Louisa May Alcott", year: "1868", category: "children", subjects: ["Family", "Civil War", "Coming of age"], blurb: "Meg, Jo, Beth and Amy March grow up poor, warm and ambitious in Concord while their father is away at the war." },
  { gutenbergId: 45, title: "Anne of Green Gables", author: "L. M. Montgomery", year: "1908", category: "children", subjects: ["Orphan", "Prince Edward Island", "Friendship"], blurb: "The Cuthberts meant to adopt a boy to help on the farm; they get an eleven-year-old red-haired talker instead, and keep her." },
  { gutenbergId: 2591, title: "Grimms' Fairy Tales", author: "Jacob & Wilhelm Grimm", year: "1812", category: "children", subjects: ["Folk tales", "Magic", "Germany"], blurb: "Two hundred and eleven German household tales — from Snow White to Hansel and Gretel to the Brave Little Tailor." },
  { gutenbergId: 132, title: "The Art of War", author: "Sun Tzu", year: "−500", category: "philosophy", subjects: ["Strategy", "Warfare", "China"], blurb: "Thirteen chapters on manoeuvre, terrain, espionage and the art of winning without fighting — Lionel Giles' classic 1910 translation." },
  { gutenbergId: 1232, title: "The Prince", author: "Niccolò Machiavelli", year: "1532", category: "philosophy", subjects: ["Politics", "Power", "Renaissance"], blurb: "A Florentine diplomat's cold, candid manual for a new ruler: it is better to be feared than loved, and fortune favours the bold." },
  { gutenbergId: 6130, title: "The Iliad", author: "Homer", year: "−750", category: "poetry", subjects: ["Epic", "Troy", "Achilles"], blurb: "In the tenth year of the Trojan War, Achilles withdraws from the fighting and the Greeks nearly lose everything. Samuel Butler's prose translation." },
  { gutenbergId: 1727, title: "The Odyssey", author: "Homer", year: "−700", category: "adventure", subjects: ["Epic", "Voyage", "Homecoming"], blurb: "Odysseus spends ten years fighting monsters, witches and his own crew to get home to Ithaca and Penelope. Butler's prose translation." },
  { gutenbergId: 2680, title: "Meditations", author: "Marcus Aurelius", year: "180", category: "philosophy", subjects: ["Stoicism", "Self-mastery", "Rome"], blurb: "The private notebooks of a Roman emperor reminding himself, at war on the Danube, to be a man, to be useful, and to mind his own soul." },
  { gutenbergId: 4363, title: "Beyond Good and Evil", author: "Friedrich Nietzsche", year: "1886", category: "philosophy", subjects: ["Ethics", "Will to power", "Germany"], blurb: "Nietzsche dismantles the moral inheritance of two thousand years and drafts the philosophy of the philosophers of the future." },
  { gutenbergId: 996, title: "Don Quixote", author: "Miguel de Cervantes Saavedra", year: "1605", category: "fiction", subjects: ["Satire", "Chivalry", "Spain"], blurb: "A thin gentleman of La Mancha reads too many romances and rides out as a knight-errant, charging windmills and inns with his squire Sancho." },
  { gutenbergId: 215, title: "The Call of the Wild", author: "Jack London", year: "1903", category: "adventure", subjects: ["Yukon", "Dogs", "Survival"], blurb: "Buck, a stolen ranch dog, is shipped to the Klondike and learns to pull sled, to fight, and finally to answer the ancient wolf-call." },
  { gutenbergId: 2034, title: "The Turn of the Screw", author: "Henry James", year: "1898", category: "mystery", subjects: ["Ghosts", "Governess", "Ambiguity"], blurb: "A young governess at Bly comes to believe her two charges are being visited by the ghosts of a former governess and a valet. Or are they?" },
  { gutenbergId: 2852, title: "The Hound of the Baskervilles", author: "Arthur Conan Doyle", year: "1902", category: "mystery", subjects: ["Detective", "Dartmoor", "Legend"], blurb: "Holmes and Watson leave 221B for the Devon mists to learn whether a spectral hound is killing the Baskerville heirs, or something more human." },
  { gutenbergId: 219, title: "Heart of Darkness", author: "Joseph Conrad", year: "1899", category: "adventure", subjects: ["Colonialism", "Congo", "Madness"], blurb: "Marlow pilots a steamboat up the Congo to find the ivory agent Kurtz, who has become a god to the people he came to exploit." },
  { gutenbergId: 5200, title: "Metamorphosis", author: "Franz Kafka", year: "1915", category: "fiction", subjects: ["Absurd", "Alienation", "Family"], blurb: "Gregor Samsa wakes one morning from uneasy dreams to find himself transformed into a monstrous insect — and his family's attitudes change fastest of all." },
  { gutenbergId: 67979, title: "The Great Gatsby", author: "F. Scott Fitzgerald", year: "1925", category: "fiction", subjects: ["Jazz Age", "Long Island", "Longing"], blurb: "Nick Carraway rents next door to Jay Gatsby, who throws lavish parties to win back a woman who never quite existed." },
  { gutenbergId: 203, title: "The Strange Case of Dr. Jekyll and Mr. Hyde", author: "Robert Louis Stevenson", year: "1886", category: "mystery", subjects: ["Gothic", "Duality", "London"], blurb: "A respectable doctor brews a draught that sets his worst self loose after dark on the streets of Soho. The original split-personality thriller." },
];

export function curatedBookToMedia(b: CuratedBook): BookMedia {
  const id = b.gutenbergId;
  return {
    id: `bk-${id}`,
    kind: "book",
    gutenbergId: id,
    title: b.title,
    description: b.blurb,
    poster: `https://www.gutenberg.org/cache/epub/${id}/pg${id}.cover.medium.jpg`,
    backdrop: `https://www.gutenberg.org/cache/epub/${id}/pg${id}.cover.medium.jpg`,
    year: b.year,
    creator: b.author,
    author: b.author,
    downloads: undefined,
    subjects: b.subjects,
    meta: [b.author, b.year, "Gutenberg"].filter(Boolean),
    htmlUrl: `https://www.gutenberg.org/cache/epub/${id}/pg${id}.images.html`,
    textUrl: `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,
    epubUrl: `https://www.gutenberg.org/ebooks/${id}.epub.images`,
  };
}
