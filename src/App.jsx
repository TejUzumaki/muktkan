import { motion } from 'framer-motion';
import { Library, Film, Radio, Search, Menu } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-vault-black overflow-x-hidden">
      
      {/* Premium Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-vault-black via-vault-black/90 to-transparent backdrop-blur-sm">
        <div className="container mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl md:text-3xl text-accent-gold tracking-wider">मुक्त 館</h1>
            <span className="hidden md:block text-xs uppercase tracking-[0.3em] text-gray-500 border-l border-gray-700 pl-3 ml-1">Muktkan</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-sm text-gray-400 font-light tracking-wide">
            <span className="flex items-center gap-2 text-white cursor-pointer"><Film size={16} className="text-accent-gold"/> Cinema</span>
            <span className="flex items-center gap-2 hover:text-white cursor-pointer transition"><Radio size={16} /> Live Airwaves</span>
            <span className="flex items-center gap-2 hover:text-white cursor-pointer transition"><Library size={16} /> The Reading Room</span>
          </div>

          <div className="flex items-center gap-4">
            <Search size={20} className="text-gray-400 hover:text-white cursor-pointer transition" />
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-gold to-yellow-800 flex items-center justify-center text-xs font-bold text-vault-black cursor-pointer">U</div>
          </div>
        </div>
      </nav>

      {/* Cinematic Hero Section */}
      <section className="relative h-[90vh] w-full flex items-end pb-20 md:pb-32">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2672&auto=format&fit=crop')" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-vault-black via-vault-black/70 to-vault-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-vault-black via-transparent to-transparent" />

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <p className="text-accent-gold text-sm tracking-[0.3em] uppercase mb-4">Curated Public Domain</p>
            <h2 className="font-serif text-5xl md:text-7xl font-light text-white leading-tight mb-6">
              The Hall of <span className="italic text-accent-gold">Liberated</span> Media
            </h2>
            <p className="text-gray-400 text-lg font-light max-w-xl mb-8 leading-relaxed">
              Step into a sanctuary of free, legal, and open-source cinema, literature, and live broadcasts. Crafted for those who value the preservation of art.
            </p>
            <div className="flex gap-4">
              <button className="bg-white text-vault-black px-8 py-3 rounded-sm hover:bg-accent-gold transition-colors duration-300 font-medium tracking-wide">
                Enter the Vault
              </button>
              <button className="border border-gray-500 text-white px-8 py-3 rounded-sm hover:bg-white/10 transition-colors duration-300 font-light tracking-wide">
                Explore Collections
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Rows Shell */}
      <section className="relative z-10 -mt-32 pb-20">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-2xl text-white">Handpicked Cinematic Gems</h3>
            <span className="text-xs text-gray-500 tracking-wider">COMING SOON</span>
          </div>
          <div className="flex gap-4 overflow-hidden">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="w-64 h-40 bg-vault-gray rounded animate-pulse flex-shrink-0"></div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-vault-gray py-10 text-center text-gray-600 text-sm">
        <p>Muktkan &copy; 2026. Built for the open internet.</p>
      </footer>
    </div>
  )
}
