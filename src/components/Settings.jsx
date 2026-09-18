import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

const AVATARS = ['🥔', '🦊', '👾', '🎃', '🤖', '👻', '🦄', '🐲'];
const COLORS = ['#0A84FF', '#BF5AF2', '#FF375F', '#FFD60A', '#30D158', '#FF9F0A'];

export default function Settings({ isOpen, onClose, user, setUser }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
      >
        <motion.div 
          initial={{scale: 0.95, y: 20}} animate={{scale: 1, y: 0}} exit={{scale: 0.95, y: 20}}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#1c1c1e] rounded-3xl w-full max-w-md p-8 border border-white/10"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">Settings</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-full bg-white/10"><X size={24} /></button>
          </div>

          {/* Profile Section */}
          <div className="mb-8">
            <label className="text-sm text-gray-400 mb-2 block">Username</label>
            <input 
              type="text" 
              value={user.name} 
              onChange={(e) => setUser({...user, name: e.target.value})}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/30"
            />
          </div>

          {/* Avatar Section */}
          <div className="mb-8">
            <label className="text-sm text-gray-400 mb-2 block">Avatar</label>
            <div className="grid grid-cols-8 gap-2">
              {AVATARS.map(emoji => (
                <button 
                  key={emoji} 
                  onClick={() => setUser({...user, avatar: emoji})}
                  className={`text-2xl p-2 rounded-xl flex items-center justify-center transition ${user.avatar === emoji ? 'bg-white/20 scale-110' : 'bg-black/50 hover:bg-white/10'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Accent Color Section */}
          <div className="mb-8">
            <label className="text-sm text-gray-400 mb-2 block">Accent Color</label>
            <div className="flex gap-3">
              {COLORS.map(color => (
                <button 
                  key={color} 
                  onClick={() => setUser({...user, color: color})}
                  className={`w-10 h-10 rounded-full transition flex items-center justify-center ${user.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1c1c1e] scale-110' : ''}`}
                  style={{ backgroundColor: color }}
                >
                  {user.color === color && <Check size={16} className="text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Reading Preference */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Reading Orientation</label>
            <div className="flex gap-2 bg-black/50 p-1 rounded-xl">
              <button 
                onClick={() => setUser({...user, readMode: 'vertical'})}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${user.readMode === 'vertical' ? 'bg-white/20 text-white' : 'text-gray-500'}`}
              >Vertical</button>
              <button 
                onClick={() => setUser({...user, readMode: 'horizontal'})}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${user.readMode === 'horizontal' ? 'bg-white/20 text-white' : 'text-gray-500'}`}
              >Horizontal</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
