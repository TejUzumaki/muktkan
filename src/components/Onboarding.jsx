import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const AVATARS = ['🥔', '🦊', '👾', '🎃', '🤖', '👻', '🦄', '🐲'];
const COLORS = ['#0A84FF', '#BF5AF2', '#FF375F', '#FFD60A', '#30D158', '#FF9F0A'];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🥔');
  const [color, setColor] = useState('#0A84FF');
  const [readMode, setReadMode] = useState('vertical');

  const finish = () => {
    onComplete({ name: name || 'User', avatar, color, readMode });
  };

  return (
    <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        {step === 0 && (
          <>
            <h1 className="text-4xl font-extrabold text-white mb-4">Welcome to Muktkan</h1>
            <p className="text-gray-500 mb-8">The Hall of Liberated Media. Let's set up your experience.</p>
            <button onClick={() => setStep(1)} className="bg-white text-black px-8 py-3 rounded-full font-bold inline-flex items-center gap-2 hover:bg-gray-200 transition">
              Begin <ArrowRight size={20} />
            </button>
          </>
        )}

        {step === 1 && (
          <div className="bg-[#1c1c1e] p-8 rounded-3xl border border-white/10">
            <h2 className="text-2xl font-bold mb-6 text-white">What should we call you?</h2>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter username..."
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-lg outline-none mb-8 focus:border-white/30"
            />
            <h3 className="text-sm text-gray-400 mb-3">Choose your avatar</h3>
            <div className="grid grid-cols-8 gap-2 mb-8">
              {AVATARS.map(emoji => (
                <button key={emoji} onClick={() => setAvatar(emoji)} className={`text-2xl p-2 rounded-xl flex items-center justify-center transition ${avatar === emoji ? 'bg-white/20 scale-110' : 'bg-black/50 hover:bg-white/10'}`}>{emoji}</button>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="bg-white text-black px-8 py-3 rounded-full font-bold w-full hover:bg-gray-200 transition">Next</button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-[#1c1c1e] p-8 rounded-3xl border border-white/10">
            <h2 className="text-2xl font-bold mb-6 text-white">Pick your vibe</h2>
            <p className="text-gray-500 mb-4">This will be your accent color across the app.</p>
            <div className="flex justify-center gap-3 mb-8">
              {COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)} className={`w-10 h-10 rounded-full transition flex items-center justify-center ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1c1c1e] scale-110' : ''}`} style={{ backgroundColor: c }}>
                  {color === c && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>}
                </button>
              ))}
            </div>

            <h3 className="text-sm text-gray-400 mb-3">Reading Preference</h3>
            <div className="flex gap-2 bg-black/50 p-1 rounded-xl mb-8">
              <button onClick={() => setReadMode('vertical')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${readMode === 'vertical' ? 'bg-white/20 text-white' : 'text-gray-500'}`}>Vertical</button>
              <button onClick={() => setReadMode('horizontal')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${readMode === 'horizontal' ? 'bg-white/20 text-white' : 'text-gray-500'}`}>Horizontal</button>
            </div>

            <button onClick={finish} className="text-black px-8 py-3 rounded-full font-bold w-full transition" style={{ backgroundColor: color }}>
              Enter the Vault
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
