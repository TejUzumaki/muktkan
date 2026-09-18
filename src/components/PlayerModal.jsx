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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-8"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-vault-dark border border-vault-gray rounded-lg w-full max-w-5xl overflow-hidden shadow-2xl"
        >
          <div className="p-4 border-b border-vault-gray flex justify-between items-center">
            <h3 className="font-serif text-xl text-white truncate">{media?.title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition p-1 rounded-full hover:bg-vault-gray">
              <X size={24} />
            </button>
          </div>
          <div className="p-4">
            {media?.type === 'movie' && (
              <iframe src={media.url} className="w-full aspect-video rounded" frameBorder="0" allowFullScreen title={media.title}></iframe>
            )}
            {media?.type === 'book' && (
              <iframe src={media.url} className="w-full h-[70vh] rounded bg-white" frameBorder="0" title={media.title}></iframe>
            )}
            {media?.type === 'live' && (
              <video ref={videoRef} controls className="w-full aspect-video rounded bg-black" />
            )}
            <p className="text-gray-500 text-xs mt-3 text-center tracking-wider">{media?.footer}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
