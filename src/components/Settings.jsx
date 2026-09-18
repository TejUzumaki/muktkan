import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

const COLORS = ['#0A84FF', '#BF5AF2', '#FF375F', '#FFD60A', '#30D158', '#FF9F0A', '#64D2FF', '#5E5CE6', '#FF453A', '#AC8E68', '#8E8E93', '#D4D4D2'];
const SvgAvatar = ({ id, color }) => {
  const shapes = [<circle key="0" cx="32" cy="32" r="24" fill={color} />, <rect key="1" x="10" y="10" width="44" height="44" rx="12" fill={color} />, <polygon key="2" points="32,6 58,54 6,54" fill={color} />, <path key="3" d="M16 16 L48 16 L48 48 L16 48 Z M24 24 L40 24 L40 40 L24 40 Z" fillRule="evenodd" fill={color} />, <circle key="4" cx="20" cy="20" r="12" fill={color} />, <circle key="5" cx="44" cy="44" r="12" fill={color} opacity="0.6" />, <path key="6" d="M10 10 H54 V54 H10 Z M20 20 H44 V44 H20 Z" fill={color} />];
  return <svg viewBox="0 0 64 64" className="w-full h-full">{shapes[id % shapes.length]}</svg>;
};

export default function Settings({ isOpen, onClose, user, setUser }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
        <motion.div initial={{scale: 0.95, y: 20}} animate={{scale: 1, y: 0}} exit={{scale: 0.95, y: 20}} onClick={(e) => e.stopPropagation()} className="bg-[#1c1c1e] rounded-2xl w-full max-w-md p-8 border border-white/10 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-8"><h2 className="text-2xl font-bold text-white">Settings</h2><button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-full bg-white/10"><X size={24} /></button></div>
          
          <div className="mb-8">
            <label className="text-sm text-gray-400 mb-2 block">Username</label>
            <input type="text" value={user.name} onChange={(e) => setUser({...user, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-white/30" />
          </div>

          <div className="mb-8">
            <label className="text-sm text-gray-400 mb-2 block">Avatar</label>
            <div className="grid grid-cols-4 gap-4">
              {[0, 1, 2, 3, 4, 5, 6].map(id => (
                <button key={id} onClick={() => setUser({...user, avatarId: id})} className={`aspect-square p-3 rounded-xl bg-black/50 transition ${user.avatarId === id ? 'ring-2' : 'hover:bg-white/5'}`} style={user.avatarId === id ? { boxShadow: `0 0 0 2px ${user.color}` } : {}}>
                  <SvgAvatar id={id} color={user.avatarId === id ? user.color : '#8E8E93'} />
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="text-sm text-gray-400 mb-2 block">Accent Color</label>
            <div className="grid grid-cols-6 gap-3 mb-4">
              {COLORS.map(c => (
                <button key={c} onClick={() => setUser({...user, color: c})} className={`w-12 h-12 rounded-xl transition flex items-center justify-center ${user.color === c ? 'scale-110' : 'opacity-80'}`} style={{ backgroundColor: c, outline: user.color === c ? `2px solid white` : 'none' }}>
                  {user.color === c && <Check size={20} className="text-white" />}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <input type="color" onChange={(e) => setUser({...user, color: e.target.value})} className="w-12 h-12 bg-transparent cursor-pointer" />
              <span className="text-gray-400 text-sm">Custom Color</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-2 block">Reading Orientation</label>
            <div className="flex gap-2 bg-black/50 p-1 rounded-xl">
              <button onClick={() => setUser({...user, readMode: 'vertical'})} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${user.readMode === 'vertical' ? 'bg-white/20 text-white' : 'text-gray-500'}`}>Vertical</button>
              <button onClick={() => setUser({...user, readMode: 'horizontal'})} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${user.readMode === 'horizontal' ? 'bg-white/20 text-white' : 'text-gray-500'}`}>Horizontal</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
