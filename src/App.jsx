import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Film, Radio, Library, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import PlayerModal from './components/PlayerModal';

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [hero, setHero] = useState(null);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const init = async () => {
      // 1. Fetch Cinema (Internet Archive)
      const sciFiQuery = 'subject:"Science Fiction"';
      const sciFiRes = await fetch(`https://archive.org/advancedsearch.php?q=collection:opensource_movies+AND+mediatype:movies+AND+${encodeURIComponent(sciFiQuery)}&fl[]=identifier&fl[]=title&fl[]=description&sort[]=downloads+desc&rows=12&output=json`);
      const sciFiData = await sciFiRes.json();
      const sciFiMovies = sciFiData.response.docs.map(d => ({
        title: d.title,
        desc: Array.isArray(d.description) ? d.description[0] : d.description || 'A curated public domain cinematic experience.',
        img: `https://archive.org/services/img/${d.identifier}`,
        url: `https://archive.org/embed/${d.identifier}`,
        type: 'movie',
        footer: "Streaming via The Internet Archive's public domain servers."
      }));

      if (sciFiMovies.length > 0) setHero(sciFiMovies[0]);

      // 2. Fetch Books (Project Gutenberg)
      const bookRes = await fetch('https://gutendex.com/books/?topic=adventure&languages=en&mime_types=text/html');
      const bookData = await bookRes.json();
      const books = bookData.results.slice(0, 12).map(b => ({
        title: b.title,
        desc: `by ${b.authors.map(a => a.name.split(',').reverse().join(' ')).join(', ')}`,
        img: b.formats['image/jpeg'] || 'https://via.placeholder.com/300x450/1A1A1A/C5A572?text=Muktkan',
        url: b.formats['text/html'] || b.formats['text/plain; charset=utf-8'],
        type: 'book',
        footer: "Reading via Project Gutenberg's open servers."
      }));

      // 3. Fetch Live IPTV
      let liveChannels = [];
      try {
        const iptvRes = await fetch('https://iptv-org.github.io/iptv/index.m3u');
        const iptvText = await iptvRes.text();
        const lines = iptvText.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('#EXTINF:')) {
            const name = lines[i].match(/,(.+)$/)?.[1] || 'Live Channel';
            const logo = lines[i].match(/tvg-logo="([^"]+)"/)?.[1] || '';
            const url = lines[i+1];
            if (url && url.startsWith('http')) {
              if (name.includes('NASA') || name.includes('Red Bull') || name.includes('Classic Arts')) {
                liveChannels.push({ title: name, desc: 'Live public broadcast', img: logo, url, type: 'live', footer: "Streaming live via HLS.js. Free public IPTV." });
              }
            }
          }
        }
      } catch (e) { console.error("IPTV fetch failed", e); }

      setRows([
        { title: 'Cinematic Visions (Sci-Fi)', items: sciFiMovies },
        { title: 'Live Airwaves', items: liveChannels },
        { title: 'The Reading Room', items: books },
      ]);
    };
    init();
  }, []);

  const openModal = (media) => {
    setSelectedMedia(media);
    setModalOpen(true);
  };

  const Row = ({ title, items }) => {
    const scrollRef = useRef(null);
    const scroll = (dir) => {
      if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * scrollRef.current.clientWidth * 0.8, behavior: 'smooth' });
    };
    return (
      <div className="mb-12 group/row">
        <h3 className="font-serif text-2xl text-white mb-4 px-6 md:px-12 flex items-center gap-2">
          {title === 'Live Airwaves' ? <Radio size={20} className="text-accent-gold" /> : title === 'The Reading Room' ? <Library size={20} className="text-accent-gold" /> : <Film size={20} className="text-accent-gold" />}
          {title}
        </h3>
        <div className="relative">
          <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-vault-black/50 hover:bg-vault-black p-2 rounded-r-md opacity-0 group-hover/row:opacity-100 transition hidden md:block">
            <ChevronLeft size={24} />
          </button>
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto scroll-smooth px-6 md:px-12 pb-4 scrollbar-hide">
            {items.length === 0 ? (
              [1,2,3,4].map(i => <div key={i} className="w-56 h-32 md:w-64 md:h-36 bg-vault-gray rounded animate-pulse flex-shrink-0"></div>)
            ) : (
              items.map((item, i) => (
                <motion.div 
                  key={i} 
                  onClick={() => openModal(item)}
                  whileHover={{ scale: 1.05 }}
                  className="flex-shrink-0 w-56 h-32 md:w-64 md:h-36 rounded overflow-hidden cursor-pointer relative group/card border border-transparent hover:border-accent-gold/50 transition"
                >
                  <img src={item.img} className="w-full h-full object-cover" alt={item.title} />
                  {item.type === 'live' && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 animate-pulse">
                      <span className="w-2 h-2 bg-white rounded-full"></span> LIVE
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition flex items-end p-3">
                    <div>
                      <p className="text-sm font-medium text-white truncate">{item.title}</p>
                      <p className="text-xs text-gray-400 truncate">{item.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-vault-black/50 hover:bg-vault-black p-2 rounded-l-md opacity-0 group-hover/row:opacity-100 transition hidden md:block">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-vault-black overflow-x-hidden text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-vault-black via-vault-black/90 to-transparent backdrop-blur-sm">
        <div className="container mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl md:text-3xl text-accent-gold tracking-wider">मुक्त 館</h1>
            <span className="hidden md:block text-xs uppercase tracking-[0.3em] text-gray-500 border-l border-gray-700 pl-3 ml-1">Muktkan</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-sm text-gray-400 font-light tracking-wide">
            <span className="flex items-center gap-2 text-white cursor-pointer"><Film size={16} className="text-accent-gold"/> Cinema</span>
            <span className="flex items-center gap-2 hover:text-white cursor-pointer transition"><Radio size={16} /> Live Airwaves</span>
            <span className="flex items-center gap-2 hover:text-white cursor-pointer transition"><Library size={16} /> Reading Room</span>
          </div>
          <div className="flex items-center gap-4">
            <Search size={20} className="text-gray-400 hover:text-white cursor-pointer transition" />
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-gold to-yellow-800 flex items-center justify-center text-xs font-bold text-vault-black cursor-pointer">U</div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-[90vh] w-full flex items-end pb-20 md:pb-32">
        <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000" style={{ backgroundImage: `url('${hero?.img || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2672&auto=format&fit=crop'}')` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-vault-black via-vault-black/70 to-vault-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-vault-black via-transparent to-transparent" />
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          {hero ? (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: "easeOut" }} className="max-w-2xl">
              <p className="text-accent-gold text-sm tracking-[0.3em] uppercase mb-4">Featured Cinematic Vision</p>
              <h2 className="font-serif text-5xl md:text-7xl font-light text-white leading-tight mb-6">{hero.title}</h2>
              <p className="text-gray-400 text-lg font-light max-w-xl mb-8 leading-relaxed line-clamp-3">{hero.desc}</p>
              <button onClick={() => openModal(hero)} className="bg-white text-vault-black px-8 py-3 rounded-sm hover:bg-accent-gold transition-colors duration-300 font-medium tracking-wide flex items-center gap-2">
                <Film size={20} /> Play Feature
              </button>
            </motion.div>
          ) : (
            <div className="h-40 w-96 bg-vault-gray rounded animate-pulse"></div>
          )}
        </div>
      </section>

      {/* Rows */}
      <section className="relative z-10 -mt-32 pb-20">
        {rows.map((row, i) => <Row key={i} title={row.title} items={row.items} />)}
      </section>

      <footer className="border-t border-vault-gray py-10 text-center text-gray-600 text-sm">
        <p>Muktkan &copy; 2026. Built for the open internet. 100% Legal Public Domain.</p>
      </footer>

      <PlayerModal isOpen={modalOpen} onClose={() => setModalOpen(false)} media={selectedMedia} />
    </div>
  );
}
