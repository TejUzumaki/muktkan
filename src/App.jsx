import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Film, Radio, Library, Search, ChevronLeft, ChevronRight, Play, Plus } from 'lucide-react';
import PlayerModal from './components/PlayerModal';

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [hero, setHero] = useState(null);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const init = async () => {
      // 1. Fetch Cinema (Sci-Fi)
      const sciFiRes = await fetch(`https://archive.org/advancedsearch.php?q=collection:opensource_movies+AND+mediatype:movies+AND+subject%3A%22Science+Fiction%22&fl[]=identifier&fl[]=title&fl[]=description&sort[]=downloads+desc&rows=12&output=json`);
      const sciFiData = await sciFiRes.json();
      const sciFiMovies = sciFiData.response.docs.map(d => ({
        title: d.title,
        desc: Array.isArray(d.description) ? d.description[0] : d.description || 'A curated public domain cinematic experience.',
        img: `https://archive.org/services/img/${d.identifier}`,
        url: `https://archive.org/embed/${d.identifier}`,
        type: 'movie',
        footer: "Streaming via The Internet Archive."
      }));
      if (sciFiMovies.length > 0) setHero(sciFiMovies[0]);

      // 2. Fetch Books (Adventure)
      const bookRes = await fetch('https://gutendex.com/books/?topic=adventure&languages=en&mime_types=text/html');
      const bookData = await bookRes.json();
      const books = bookData.results.slice(0, 12).map(b => ({
        title: b.title,
        desc: `by ${b.authors.map(a => a.name.split(',').reverse().join(' ')).join(', ')}`,
        img: b.formats['image/jpeg'] || 'https://via.placeholder.com/300x450/1C1C1E/FFFFFF?text=Muktkan',
        url: b.formats['text/html'] || b.formats['text/plain; charset=utf-8'],
        type: 'book',
        footer: "Reading via Project Gutenberg."
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
                liveChannels.push({ title: name, desc: 'Live public broadcast', img: logo, url, type: 'live', footer: "Streaming live via HLS.js." });
              }
            }
          }
        }
      } catch (e) { console.error("IPTV fetch failed", e); }

      setRows([
        { title: 'Cinematic Visions', items: sciFiMovies },
        { title: 'Live Airwaves', items: liveChannels },
        { title: 'The Reading Room', items: books },
      ]);
    };
    init();
  }, []);

  const openModal = (media) => { setSelectedMedia(media); setModalOpen(true); };

  const Row = ({ title, items }) => {
    const scrollRef = useRef(null);
    const scroll = (dir) => {
      if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * scrollRef.current.clientWidth * 0.8, behavior: 'smooth' });
    };
    return (
      <div className="mb-12 group/row">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 px-6 md:px-12 flex items-center gap-2">
          {title === 'Live Airwaves' ? <Radio size={20} className="text-blue-500" /> : title === 'The Reading Room' ? <Library size={20} className="text-purple-500" /> : <Film size={20} className="text-red-500" />}
          {title}
        </h3>
        <div className="relative">
          <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 p-2 rounded-full opacity-0 group-hover/row:opacity-100 transition hidden md:block">
            <ChevronLeft size={24} />
          </button>
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto scroll-smooth px-6 md:px-12 pb-4 scrollbar-hide">
            {items.length === 0 ? (
              [1,2,3,4].map(i => <div key={i} className="w-64 h-36 md:w-72 md:h-40 bg-[#1c1c1e] rounded-xl animate-pulse flex-shrink-0"></div>)
            ) : (
              items.map((item, i) => (
                <motion.div 
                  key={i} 
                  onClick={() => openModal(item)}
                  whileHover={{ scale: 1.05 }}
                  className="flex-shrink-0 w-64 h-36 md:w-72 md:h-40 rounded-xl cursor-pointer relative group/card overflow-hidden bg-[#1c1c1e] shadow-lg"
                >
                  <img src={item.img} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover/card:opacity-100 transition-opacity" alt={item.title} />
                  
                  {/* Glass Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4 opacity-0 group-hover/card:opacity-100 transition-opacity backdrop-blur-[2px]">
                    {item.type === 'live' && (
                      <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                        <span className="w-2 h-2 bg-white rounded-full"></span> LIVE
                      </div>
                    )}
                    <p className="text-sm font-bold text-white truncate drop-shadow-lg">{item.title}</p>
                    <p className="text-xs text-gray-300 truncate drop-shadow-lg mb-2">{item.desc}</p>
                    <div className="flex gap-2">
                      <button className="bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/40 transition">
                        <Play size={16} className="text-white fill-white" />
                      </button>
                      <button className="bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white/40 transition">
                        <Plus size={16} className="text-white" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 p-2 rounded-full opacity-0 group-hover/row:opacity-100 transition hidden md:block">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black overflow-x-hidden text-white">
      {/* Glassmorphism Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Muktkan</h1>
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-300 font-medium">
              <span className="flex items-center gap-1 text-white cursor-pointer"><Film size={16} className="text-red-500"/> Cinema</span>
              <span className="flex items-center gap-1 hover:text-white cursor-pointer transition"><Radio size={16} className="text-blue-500" /> Live</span>
              <span className="flex items-center gap-1 hover:text-white cursor-pointer transition"><Library size={16} className="text-purple-500" /> Books</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
              <Search size={16} className="text-gray-400 mr-2" />
              <input type="text" placeholder="Search titles..." className="bg-transparent outline-none text-sm text-white placeholder-gray-400 w-40" />
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white cursor-pointer shadow-lg">U</div>
          </div>
        </div>
      </nav>

      {/* Premium Hero Section */}
      <section className="relative h-[90vh] w-full flex items-end pb-20 md:pb-32">
        <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000" style={{ backgroundImage: `url('${hero?.img || 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2672&auto=format&fit=crop'}')` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent" />
        
        <div className="container mx-auto px-6 md:px-12 relative z-10">
          {hero ? (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut" }} className="max-w-2xl">
              <p className="text-blue-500 text-sm tracking-[0.3em] uppercase mb-4 font-semibold">Featured Cinematic Vision</p>
              <h2 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 drop-shadow-2xl">{hero.title}</h2>
              <p className="text-gray-300 text-lg font-medium max-w-xl mb-8 leading-relaxed line-clamp-3 drop-shadow-lg">{hero.desc}</p>
              <div className="flex gap-4">
                <button onClick={() => openModal(hero)} className="bg-white text-black px-8 py-3 rounded-full hover:bg-gray-200 transition-colors duration-300 font-bold tracking-wide flex items-center gap-2 shadow-xl">
                  <Play size={20} className="fill-black" /> Play
                </button>
                <button className="bg-white/20 backdrop-blur-md text-white px-8 py-3 rounded-full hover:bg-white/30 transition-colors duration-300 font-bold tracking-wide flex items-center gap-2 border border-white/20 shadow-xl">
                  <Plus size={20} /> My List
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="h-40 w-96 bg-[#1c1c1e] rounded-xl animate-pulse"></div>
          )}
        </div>
      </section>

      {/* Content Rows */}
      <section className="relative z-10 -mt-40 pb-20">
        {rows.map((row, i) => <Row key={i} title={row.title} items={row.items} />)}
      </section>

      <footer className="border-t border-white/10 py-10 text-center text-gray-600 text-sm">
        <p>Muktkan &copy; 2026. Built for the open internet. 100% Legal Public Domain.</p>
      </footer>

      <PlayerModal isOpen={modalOpen} onClose={() => setModalOpen(false)} media={selectedMedia} />
    </div>
  );
}
