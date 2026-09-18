import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Hls from 'hls.js';

export default function PlayerModal({ isOpen, onClose, media }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!media || media.type !== 'live') return;
    const video = videoRef.current;
    if (!video) return;
    let hls;
    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(media.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = media.url;
      video.play().catch(() => {});
    }
    return () => { if (hls) hls.destroy(); };
  }, [media]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-8"
      >
        <motion.div
          initial={{ scale: 0.95, y: 30, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 30, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#1c1c1e]/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden w-full max-w-5xl shadow-2xl"
        >
          <div className="p-6 flex justify-between items-center border-b border-white/5">
            <h3 className="text-xl font-semibold text-white truncate pr-4">{media?.title}</h3>
            <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition text-white">
              <X size={24} />
            </button>
          </div>
          <div className="p-6">
            {media?.type === 'movie' && (
              <iframe src={media.url} className="w-full aspect-video rounded-2xl bg-black" frameBorder="0" allowFullScreen title={media.title}></iframe>
            )}
            {media?.type === 'book' && (
              <iframe src={media.url} className="w-full h-[70vh] rounded-2xl bg-white" frameBorder="0" title={media.title}></iframe>
            )}
            {media?.type === 'live' && (
              <video ref={videoRef} controls className="w-full aspect-video rounded-2xl bg-black" />
            )}
            <p className="text-gray-500 text-xs mt-4 text-center tracking-wide">{media?.footer}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
