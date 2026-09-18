import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';

// 12 Preset Colors + Custom
const COLORS = ['#0A84FF', '#BF5AF2', '#FF375F', '#FFD60A', '#30D158', '#FF9F0A', '#64D2FF', '#5E5CE6', '#FF453A', '#AC8E68', '#8E8E93', '#D4D4D2'];

// Randomized SVG Avatars
const SvgAvatar = ({ id, color }) => {
  const shapes = [
    <circle key="0" cx="32" cy="32" r="24" fill={color} />,
    <rect key="1" x="10" y="10" width="44" height="44" rx="12" fill={color} />,
    <polygon key="2" points="32,6 58,54 6,54" fill={color} />,
    <path key="3" d="M16 16 L48 16 L48 48 L16 48 Z M24 24 L40 24 L40 40 L24 40 Z" fillRule="evenodd" fill={color} />,
    <g key="4"><circle cx="20" cy="20" r="12" fill={color} /><circle cx="44" cy="44" r="12" fill={color} opacity="0.6" /></g>,
    <path key="6" d="M10 10 H54 V54 H10 Z M20 20 H44 V44 H20 Z" fill={color} stroke={color} strokeWidth="2"/>
  ];
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full">
      {shapes[id % shapes.length]}
    </svg>
  );
};

// Reading Mode SVGs
const ReadModeSvg = ({ type, active, accent }) => (
  <svg viewBox="0 0 48 48" className={`w-full h-full transition ${active ? 'text-white' : 'text-gray-600'}`} stroke={active ? accent : "currentColor"} fill="none" strokeWidth="2">
    {type === 'vertical' ? (
      <>
        <rect x="14" y="4" width="20" height="40" rx="2" />
        <line x1="18" y1="12" x2="30" y2="12" />
        <line x1="18" y1="18" x2="30" y2="18" />
      </>
    ) : (
      <>
        <rect x="4" y="14" width="40" height="20" rx="2" />
        <line x1="10" y1="20" x2="38" y2="20" />
        <line x1="10" y1="26" x2="38" y2="26" />
      </>
    )}
  </svg>
);

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [avatarId, setAvatarId] = useState(Math.floor(Math.random() * 7));
  const [color, setColor] = useState(COLORS[0]);
  const [customColor, setCustomColor] = useState('#FFFFFF');
  const [readMode, setReadMode] = useState('vertical');

  const finish = () => {
    onComplete({ name: name || 'User', avatarId, color, readMode });
  };

  return (
    <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        {step === 0 && (
          <div className="text-center">
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-24 h-24 mx-auto mb-8 rounded-xl overflow-hidden bg-[#1c1c1e] p-4">
              <SvgAvatar id={avatarId} color={color} />
            </motion.div>
            <h1 className="text-4xl font-extrabold text-white mb-4">Welcome to Muktkan</h1>
            <p className="text-gray-500 mb-8">The Hall of Liberated Media. Let's tailor your experience.</p>
            <button onClick={() => setStep(1)} className="text-black px-8 py-3 rounded-xl font-bold inline-flex items-center gap-2 transition" style={{ backgroundColor: color }}>
              Begin <ArrowRight size={20} />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="bg-[#1c1c1e] p-8 rounded-2xl border border-white/5">
            <h2 className="text-2xl font-bold mb-6 text-white">Identity</h2>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter username..." className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white mb-8 outline-none focus:border-white/30" />
            
            <h3 className="text-sm text-gray-400 mb-3">Choose your avatar</h3>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {[0, 1, 2, 3, 4, 5, 6].map(id => (
                <button key={id} onClick={() => setAvatarId(id)} className={`aspect-square p-3 rounded-xl bg-black/50 transition ${avatarId === id ? 'ring-2' : 'hover:bg-white/5'}`} style={avatarId === id ? { boxShadow: `0 0 0 2px ${color}` } : {}}>
                  <SvgAvatar id={id} color={avatarId === id ? color : '#8E8E93'} />
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="bg-white text-black px-8 py-3 rounded-xl font-bold w-full hover:bg-gray-200 transition">Next</button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-[#1c1c1e] p-8 rounded-2xl border border-white/5">
            <h2 className="text-2xl font-bold mb-6 text-white">Aesthetics</h2>
            <p className="text-gray-500 mb-4">Select your accent color.</p>
            <div className="grid grid-cols-6 gap-3 mb-6">
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} className={`w-12 h-12 rounded-xl transition flex items-center justify-center ${color === c ? 'scale-110' : 'opacity-80'}`} style={{ backgroundColor: c, outline: color === c ? `2px solid white` : 'none' }}>
                  {color === c && <Check size={20} className="text-white" />}
                </button>
              ))}
            </div>
            
            <p className="text-gray-500 mb-2">Or pick a custom color:</p>
            <div className="flex items-center gap-4 mb-8">
              <input type="color" value={customColor} onChange={(e) => { setCustomColor(e.target.value); setColor(e.target.value); }} className="w-12 h-12 bg-transparent cursor-pointer" />
              <span className="text-gray-400 text-sm">{customColor}</span>
            </div>

            <button onClick={() => setStep(3)} className="text-black px-8 py-3 rounded-xl font-bold w-full transition" style={{ backgroundColor: color }}>Next</button>
          </div>
        )}

        {step === 3 && (
          <div className="bg-[#1c1c1e] p-8 rounded-2xl border border-white/5">
            <h2 className="text-2xl font-bold mb-6 text-white">Reading Mode</h2>
            <p className="text-gray-500 mb-4">How do you prefer to read?</p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button onClick={() => setReadMode('vertical')} className={`p-6 rounded-xl bg-black/50 transition ${readMode === 'vertical' ? 'ring-2' : 'hover:bg-white/5'}`} style={readMode === 'vertical' ? { boxShadow: `0 0 0 2px ${color}` } : {}}>
                <div className="w-16 h-16 mx-auto mb-2"><ReadModeSvg type="vertical" active={readMode === 'vertical'} accent={color} /></div>
                <p className="text-white font-medium">Vertical</p>
              </button>
              <button onClick={() => setReadMode('horizontal')} className={`p-6 rounded-xl bg-black/50 transition ${readMode === 'horizontal' ? 'ring-2' : 'hover:bg-white/5'}`} style={readMode === 'horizontal' ? { boxShadow: `0 0 0 2px ${color}` } : {}}>
                <div className="w-16 h-16 mx-auto mb-2"><ReadModeSvg type="horizontal" active={readMode === 'horizontal'} accent={color} /></div>
                <p className="text-white font-medium">Horizontal</p>
              </button>
            </div>
            <button onClick={finish} className="text-black px-8 py-3 rounded-xl font-bold w-full transition" style={{ backgroundColor: color }}>Enter the Vault</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
