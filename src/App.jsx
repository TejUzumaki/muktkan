import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Radio, Library, Search, ChevronLeft, ChevronRight, Play, Plus, Settings as SettingsIcon, Clock, X } from 'lucide-react';
import Onboarding from './components/Onboarding';
import Settings from './components/Settings';
import DetailsPage from './components/DetailsPage';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('home'); // home, details
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hero, setHero] = useState(null);
  const [rows, setRows] = useState([]);
  const [centerIndex, setCenterIndex] = useState(0);
  const [continueWatching, setContinueWatching] = useState([]);
  const [idle, setIdle] = useState(false);

  // Load user from LocalStorage or trigger Onboarding
  useEffect(() => {
    const savedUser = localStorage.getItem('muktkan-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('muktkan-user', JSON.stringify(user));
    }
  }, [user]);

  // Fetch Data
  useEffect(() => {
    if (!user) return;
    const init = async () => {
      const sciFiRes = await fetch(`https://archive.org/advancedsearch.php?q=collection:opensource_movies+AND+mediatype:movies+AND+subject%3A%22Science+Fiction%22&fl[]=identifier&fl[]=title&fl[]=description&sort[]=downloads+desc&rows=12&output=json`);
      const sciFiData = await sciFiRes.json();
      const sciFiMovies = sciFiData.response.docs.map(d => ({
        title: d.title, desc: Array.isArray(d.description) ? d.description[0] : d.description || 'A curated public domain cinematic experience.',
        img: `https://archive.org/services/img/${d.identifier}`, url: `https://archive.org/embed/${d.identifier}`, type: 'movie', footer: "Internet Archive"
      }));

      const bookRes = await fetch('https://gutendex.com/books/?topic=adventure&languages=en&mime_types=text/html');
      const bookData = await bookRes.json();
      const books = bookData.results.slice(0, 12).map(b => ({
        title: b.title, desc: `by ${b.authors.map(a => a.name.split(',').reverse().join(' ')).join(', ')}`,
        img: b.formats['image/jpeg'] || 'https://via.placeholder.com/300x450/1C1C1E/FFFFFF?text=Muktkan', url: b.formats['text/html'], type: 'book', footer: "Project Gutenberg"
      }));

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
              if (name.includes('NASA') || name.includes('Red Bull')) {
                liveChannels.push({ title: name, desc: 'Live public broadcast', img: logo, url, type: 'live', footer: "HLS.js Stream" });
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
      
      // Load continue watching
      const savedWatch = localStorage.getItem('muktkan-continue');
      if (savedWatch) setContinueWatching(JSON.parse(savedWatch));
    };
    init();
  }, [user]);

  // Idle Timer for UI Hide
  useEffect(() => {
    let timer;
    const resetTimer = () => {
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), 3000);
    };
    window.addEventListener('mousemove', resetTimer);
    return () => window.removeEventListener('mousemove', resetTimer);
  }, []);

  // Keyboard shortcut for Search
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const openDetails = (media) => {
    setSelectedMedia(media);
    setView('details');
    window.scrollTo(0, 0);
    
    // Add to continue watching
    const newWatch = [media, ...continueWatching.filter(m => m.title !== media.title)].slice(0, 6);
    setContinueWatching(newWatch);
    localStorage.setItem('muktkan-continue', JSON.stringify(newWatch));
  };

  // Dynamic Center Carousel Component
  const CenterCarousel = ({ items, title }) => {
    const scrollRef = useRef(null);

    const handleScroll = () => {
      if (!scrollRef.current) return;
      const center = scrollRef.current.scrollLeft + scrollRef.current.clientWidth / 2;
      let closestIdx = 0;
      let minDist = Infinity;
      
      Array.from(scrollRef.current.children).forEach((child, idx) => {
        const childCenter = child.offsetLeft + child.offsetWidth / 2;
        const dist = Math.abs(center - childCenter);
        if (dist < minDist) {
          minDist = dist;
          closestIdx = idx;
        }
      });
      
      setCenterIndex(closestIdx);
    };

    const scroll = (dir) => {
      if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * scrollRef.current.clientWidth * 0.8, behavior: 'smooth' });
    };

    return (
      <div className="mb-16 group/row">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-4 px-6 md:px-12 flex items-center gap-2">
          {title === 'Live Airwaves' ? <Radio size={20} style={{ color: user.color }} /> : title === 'The Reading Room' ? <Library size={20} style={{ color: user.color }} /> : <Film size={20} style={{ color: user.color }} />}
          {title}
        </h3>
        <div className="relative">
          <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 p-2 rounded-full opacity-0 group-hover/row:opacity-100 transition hidden md:block">
            <ChevronLeft size={24} />
          </button>
          <div ref={scrollRef} onScroll={handleScroll} className="flex gap-8 overflow-x-auto scroll-smooth px-6 md:px-12 pb-8 scrollbar-hide snap-x snap-center">
            {items.map((item, i) => (
              <motion.div 
                key={i} 
                onClick={() => openDetails(item)}
                animate={{ scale: i === centerIndex ? 1.1 : 1, y: i === centerIndex ? -20 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex-shrink-0 w-64 h-36 md:w-72 md:h-40 rounded-xl cursor-pointer relative group/card overflow-hidden bg-[#1c1c1e] shadow-lg snap-center"
                style={{ boxShadow: i === centerIndex ? `0px 10px 30px ${user.color}40` : 'none' }}
              >
                <img src={item.img} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover/card:opacity-100 transition-opacity" alt={item.title} />
                <div className={`absolute inset-0 ${i === centerIndex ? 'bg-black/20' : 'bg-black/60'} flex flex-col justify-end p-4 transition`}>
                  {item.type === 'live' && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
                      <span className="w-2 h-2 bg-white rounded-full"></span> LIVE
                    </div>
                  )}
                  <p className="text-sm font-bold text-white truncate drop-shadow-lg">{item.title}</p>
                  <p className="text-xs text-gray-300 truncate drop-shadow-lg">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/80 p-2 rounded-full opacity-0 group-hover/row:opacity-100 transition hidden md:block">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    );
  };

  if (!user) return <Onboarding onComplete={setUser} />;

  if (view === 'details' && selectedMedia) {
    return <DetailsPage media={selectedMedia} accentColor={user.color} onBack={() => setView('home')} similarItems={rows[0]?.items} onSelect={openDetails} />;
  }

  return (
    <div className="min-h-screen bg-black overflow-x-hidden text-white">
      {/* Glassmorphism Navbar with Idle Hide */}
      <motion.nav 
        animate={{ opacity: idle && view === 'home' ? 0 : 1, y: idle && view === 'home' ? -100 : 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/10"
      >
        <div className="container mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Muktkan</h1>
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-300 font-medium">
              <span className="flex items-center gap-1 text-white cursor-pointer"><Film size={16} style={{ color: user.color }}/> Cinema</span>
              <span className="flex items-center gap-1 hover:text-white cursor-pointer transition"><Radio size={16} style={{ color: user.color }} /> Live</span>
              <span className="flex items-center gap-1 hover:text-white cursor-pointer transition"><Library size={16} style={{ color: user.color }} /> Books</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setSearchOpen(true)} className="flex items-center bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 hover:bg-white/20 transition">
              <Search size={16} className="text-gray-400 mr-2" />
              <span className="text-sm text-gray-400 hidden md:block">Search</span>
              <span className="text-xs text-gray-500 ml-2 hidden md:block border border-white/10 px-1.5 py-0.5 rounded">⌘K</span>
            </button>
            <button onClick={() => setSettingsOpen(true)} className="text-2xl w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition border border-white/10">
              {user.avatar}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Premium Hero Section - Dynamic based on Center Carousel */}
      {rows[0] && (
        <section className="relative h-[90vh] w-full flex items-end pb-20 md:pb-32 transition-all duration-700">
          <div className="absolute inset-0 bg-cover bg-center transition-all duration-700" style={{ backgroundImage: `url('${rows[0].items[centerIndex]?.img || ''}')` }} />
          <div className="absolute inset-0 bg-black opacity-60" />
          <div className="absolute inset-0 bg-black opacity-40" />
          
          <div className="container mx-auto px-6 md:px-12 relative z-10">
            {rows[0].items[centerIndex] && (
              <motion.div 
                key={centerIndex}
                initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                className="max-w-2xl"
              >
                <p className="text-sm tracking-[0.3em] uppercase mb-4 font-semibold" style={{ color: user.color }}>Featured Cinematic Vision</p>
                <h2 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 drop-shadow-2xl">{rows[0].items[centerIndex].title}</h2>
                <p className="text-gray-300 text-lg font-medium max-w-xl mb-8 leading-relaxed line-clamp-3 drop-shadow-lg">{rows[0].items[centerIndex].desc}</p>
                <div className="flex gap-4">
                  <button onClick={() => openDetails(rows[0].items[centerIndex])} className="bg-white text-black px-8 py-3 rounded-full hover:bg-gray-200 transition-colors duration-300 font-bold tracking-wide flex items-center gap-2 shadow-xl">
                    <Play size={20} className="fill-black" /> Play
                  </button>
                  <button className="bg-white/20 border border-white/10 text-white px-8 py-3 rounded-full hover:bg-white/30 transition-colors duration-300 font-bold tracking-wide flex items-center gap-2 shadow-xl">
                    <Plus size={20} /> My List
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      )}

      {/* Content Rows */}
      <section className="relative z-10 -mt-40 pb-20">
        {continueWatching.length > 0 && (
          <div className="mb-16 group/row">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4 px-6 md:px-12 flex items-center gap-2">
              <Clock size={20} style={{ color: user.color }} /> Continue Watching
            </h3>
            <div className="flex gap-4 overflow-x-auto scroll-smooth px-6 md:px-12 pb-4 scrollbar-hide">
              {continueWatching.map((item, i) => (
                <div key={i} onClick={() => openDetails(item)} className="flex-shrink-0 w-64 h-36 rounded-xl cursor-pointer relative group/card overflow-hidden bg-[#1c1c1e] shadow-lg">
                  <img src={item.img} className="w-full h-full object-cover opacity-80 group-hover/card:opacity-100 transition" alt={item.title} />
                  <div className="absolute inset-0 bg-black/50 p-4 flex flex-col justify-end">
                    <p className="text-sm font-bold text-white truncate">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {rows.map((row, i) => <CenterCarousel key={i} items={row.items} title={row.title} />)}
      </section>

      <footer className="border-t border-white/10 py-10 text-center text-gray-600 text-sm">
        <p>Muktkan &copy; 2026. Built for the open internet. 100% Legal Public Domain.</p>
      </footer>

      <Settings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} user={user} setUser={setUser} />

      {/* Spotlight Search */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div 
            initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
            onClick={() => setSearchOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-start justify-center pt-[20vh] p-4"
          >
            <motion.div 
              initial={{scale: 0.95, y: 20}} animate={{scale: 1, y: 0}} exit={{scale: 0.95, y: 20}}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1c1c1e] rounded-2xl w-full max-w-xl border border-white/10 overflow-hidden"
            >
              <div className="flex items-center p-4 border-b border-white/10">
                <Search size={20} className="text-gray-500 mr-3" />
                <input autoFocus type="text" placeholder="Search Muktkan..." className="bg-transparent outline-none text-white text-lg w-full" />
                <button onClick={() => setSearchOpen(false)} className="text-gray-500 hover:text-white"><X size={20} /></button>
              </div>
              <div className="p-4 max-h-96 overflow-y-auto">
                <p className="text-gray-500 text-sm">Start typing to search across all public domain media.</p>
                {/* Search results would inject here in a full backend */}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
