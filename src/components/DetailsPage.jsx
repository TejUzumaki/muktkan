import { motion } from 'framer-motion';
import { ArrowLeft, Play, Plus, User, Maximize } from 'lucide-react';

export default function DetailsPage({ media, accentColor, onBack, similarItems, onSelect }) {
  if (!media) return null;

  const handleReaderFullscreen = async () => {
    const elem = document.getElementById("reader-frame");
    if (elem) {
      if (media.type === 'book') {
        try {
          await elem.requestFullscreen();
        } catch (e) {
          console.log("Fullscreen not supported");
        }
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen bg-black pt-20 pb-20"
    >
      <div className="container mx-auto px-6 md:px-12 max-w-6xl">
        <button onClick={onBack} className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition">
          <ArrowLeft size={24} /> Back
        </button>

        {/* Video / Book Player Area */}
        <div className="rounded-2xl overflow-hidden bg-[#1c1c1e] shadow-2xl mb-8 border border-white/5 relative">
          {media.type === 'book' ? (
            <iframe id="reader-frame" src={media.url} className="w-full h-[80vh] bg-white" frameBorder="0" title={media.title}></iframe>
          ) : (
            <iframe src={media.url} className="w-full aspect-video bg-black" frameBorder="0" allowFullScreen title={media.title}></iframe>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-2/3">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white">{media.title}</h1>
            <p className="text-gray-400 text-lg mb-6 leading-relaxed">{media.desc}</p>
            <div className="flex gap-4">
              <button className="bg-white text-black px-8 py-3 rounded-full hover:bg-gray-200 transition font-bold flex items-center gap-2">
                <Play size={20} className="fill-black" /> Play
              </button>
              <button className="bg-white/10 border border-white/10 text-white px-8 py-3 rounded-full hover:bg-white/20 transition font-bold flex items-center gap-2">
                <Plus size={20} /> Add to List
              </button>
              {media.type === 'book' && (
                <button onClick={handleReaderFullscreen} className="bg-white/10 border border-white/10 text-white px-8 py-3 rounded-full hover:bg-white/20 transition font-bold flex items-center gap-2">
                  <Maximize size={20} /> Fullscreen
                </button>
              )}
            </div>
          </div>
          
          {/* Credits / Info */}
          <div className="md:w-1/3 bg-[#1c1c1e] p-6 rounded-2xl border border-white/5">
            <h3 className="text-xl font-bold mb-4" style={{ color: accentColor }}>The Creators</h3>
            <div className="space-y-4 text-gray-400">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center"><User size={20} /></div>
                <div><p className="text-white text-sm">Director / Author</p><p className="text-xs">Public Domain Archive</p></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center"><User size={20} /></div>
                <div><p className="text-white text-sm">Cast / Characters</p><p className="text-xs">Various Contributors</p></div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Projects */}
        {similarItems && similarItems.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold mb-6 text-white">Similar Projects</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarItems.slice(0, 4).map((item, i) => (
                <div key={i} onClick={() => onSelect(item)} className="cursor-pointer group">
                  <div className="aspect-video rounded-xl overflow-hidden bg-[#1c1c1e] mb-2 relative">
                    <img src={item.img} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" alt={item.title} />
                  </div>
                  <p className="text-sm text-white truncate">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
