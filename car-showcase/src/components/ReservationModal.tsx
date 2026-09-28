import { useState } from 'react';
import { X, ShieldCheck, Sparkles } from 'lucide-react';
import { CAR_COLORS } from '../types';
import type { CarColorOption } from '../types';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentColor: CarColorOption;
  onColorSelect: (color: CarColorOption) => void;
}

export default function ReservationModal({
  isOpen,
  onClose,
  currentColor,
  onColorSelect,
}: ReservationModalProps) {
  const [wheelPackage, setWheelPackage] = useState('20" Forged Dual-Tone Alloy');
  const [interiorTrim, setInteriorTrim] = useState('Chateau Saddle Semi-Aniline Leather');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const resetForm = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#080b14] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-amber-400/20 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-400/40">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <span className="text-xs font-mono text-amber-400 tracking-widest uppercase font-bold">
              COMMISSION CONFIRMED
            </span>
            <h3 className="text-3xl font-serif font-black text-white mt-2">
              Allocation Reserved
            </h3>
            <p className="text-gray-300 text-sm mt-3 max-w-md mx-auto leading-relaxed">
              Thank you, <span className="text-white font-bold">{fullName || 'Esteemed Patron'}</span>.
              Your bespoke Land Cruiser 300 VX-R build sheet has been dispatched to our VIP Concierge team.
            </p>

            <div className="my-6 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-left max-w-md mx-auto text-xs font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">CHASSIS SPEC:</span>
                <span className="text-white font-bold">2022 LC300 VX-R 3.5L TT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">EXTERIOR PAINT:</span>
                <span className="text-amber-400 font-bold">{currentColor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">WHEEL FINISH:</span>
                <span className="text-white">{wheelPackage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">INTERIOR TRIM:</span>
                <span className="text-white">{interiorTrim}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10">
                <span className="text-gray-400">RESERVATION TOKEN:</span>
                <span className="text-emerald-400 font-bold">LC300-VX-99482X</span>
              </div>
            </div>

            <button
              onClick={resetForm}
              className="px-8 py-3 rounded-full bg-amber-400 text-black font-bold text-xs uppercase tracking-wider hover:bg-amber-300 transition-colors"
            >
              Return To Showcase
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-mono tracking-widest uppercase mb-1">
              <Sparkles className="w-4 h-4" />
              <span>CUSTOM SPECIFICATION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">
              Commission Your VX-R
            </h2>
            <p className="text-gray-400 text-xs font-mono mt-1">
              Tailor exterior finishes, wheels, and cabin architecture.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {/* Paint selection */}
              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">
                  1. Exterior Bespoke Paint ({currentColor.name})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CAR_COLORS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onColorSelect(c)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-mono transition-all ${
                        currentColor.id === c.id
                          ? 'border-amber-400 bg-amber-400/10 text-white'
                          : 'border-white/10 bg-white/[0.02] text-gray-400 hover:text-white'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full ring-1 ring-white/30"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Wheel Package */}
              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">
                  2. Wheel & Tire Package
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    '20" Forged Dual-Tone Alloy',
                    '18" Off-Road Multi-Terrain Beadlock',
                    '21" Executive Diamond Cut Wheel',
                  ].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setWheelPackage(w)}
                      className={`p-3 rounded-xl border text-xs font-mono text-left transition-all ${
                        wheelPackage === w
                          ? 'border-amber-400 bg-amber-400/10 text-white font-bold'
                          : 'border-white/10 bg-white/[0.02] text-gray-400 hover:text-white'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cabin Trim */}
              <div>
                <label className="block text-xs font-mono text-gray-300 uppercase tracking-wider mb-2">
                  3. Executive Cabin Leather Trim
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Chateau Saddle Semi-Aniline Leather',
                    'Onyx Black Nappa with Gold Stitching',
                    'Cream Silk White Bespoke Leather',
                  ].map((trim) => (
                    <button
                      key={trim}
                      type="button"
                      onClick={() => setInteriorTrim(trim)}
                      className={`p-3 rounded-xl border text-xs font-mono text-left transition-all ${
                        interiorTrim === trim
                          ? 'border-amber-400 bg-amber-400/10 text-white font-bold'
                          : 'border-white/10 bg-white/[0.02] text-gray-400 hover:text-white'
                      }`}
                    >
                      {trim}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariq Al-Mansoor"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-gray-400 uppercase mb-1">
                    Contact Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="vip@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                Submit Commission Request
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
