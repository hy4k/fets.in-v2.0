import { useState } from 'react';
import { X, MapPin, Phone, Mail, Clock, Train, Bus, Plane, Navigation, ArrowRight, Share2, Compass } from 'lucide-react';
import { centers } from '../../data/siteData';

const modeIcons = { Train, Bus, Air: Plane, Metro: Train };

export default function ContactPanel({ onClose }) {
  const [active, setActive] = useState('calicut');
  const center = centers.find((c) => c.id === active);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content !max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-[#FFD000]/10 flex items-center justify-center text-[#FFD000] border border-[#FFD000]/20">
               <Compass size={20} />
             </div>
             <div>
               <h3 className="modal-title">Our Network</h3>
               <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Authorized Test Centres</p>
             </div>
          </div>
          <button className="skeuo-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar / Tabs */}
            <div className="md:w-56 shrink-0 space-y-6">
               <div>
                  <label className="label-premium">Select Location</label>
                  <div className="flex flex-col gap-2">
                    {centers.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setActive(c.id)}
                        className={`w-full p-4 rounded-2xl flex flex-col gap-1 transition-all ${
                          active === c.id
                            ? 'bg-[#FFD000] text-dark-950 shadow-lg scale-[1.02]'
                            : 'bg-white/5 border border-white/5 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-[11px] font-black uppercase tracking-widest leading-none">Centre</span>
                        <span className="text-sm font-black tracking-tight">{c.name.replace(' Centre', '')}</span>
                      </button>
                    ))}
                  </div>
               </div>

               <div className="p-5 rounded-2xl bg-[#FFD000]/5 border border-[#FFD000]/10">
                  <p className="text-[10px] font-bold text-[#FFD000]/60 uppercase tracking-[0.2em] mb-2">Central Support</p>
                  <a href="tel:+919605686000" className="text-white font-black text-sm hover:text-[#FFD000] transition-colors flex items-center gap-2">
                    <Phone size={14} /> +91 9605686000
                  </a>
               </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 space-y-6">
              {/* Centre Display */}
              <div className="relative rounded-3xl overflow-hidden border border-white/5 group shadow-2xl">
                 <img src={center.images?.[0] || '/images/facility/calicut-reception.jpg'} alt={center.name} className="w-full h-40 object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/40 to-transparent" />
                 <div className="absolute bottom-4 left-5">
                    <div className="flex items-center gap-2 mb-1">
                       <MapPin size={12} className="text-[#FFD000]" />
                       <span className="text-[9px] font-black text-[#FFD000] uppercase tracking-widest">KERALA, INDIA</span>
                    </div>
                    <h4 className="text-xl font-black text-white tracking-tight">{center.name}</h4>
                 </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 gap-4">
                 <div className="card-premium flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                       <MapPin size={16} className="text-[#FFD000]" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Postal Address</p>
                       <p className="text-xs font-bold text-white/80 leading-relaxed tracking-tight">{center.address}</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="card-premium flex items-start gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                          <Clock size={16} className="text-[#FFD000]" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Timing</p>
                          <p className="text-xs font-bold text-white/80 tracking-tight">{center.hours}</p>
                       </div>
                    </div>
                    <div className="card-premium flex items-start gap-4">
                       <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
                          <Mail size={16} className="text-[#FFD000]" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Email</p>
                          <a href={`mailto:${center.email}`} className="text-xs font-bold text-white/80 hover:text-[#FFD000] transition-colors truncate block max-w-[120px] tracking-tight">{center.email}</a>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Transit */}
              <div>
                 <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                   <Share2 size={12} /> Connectivity & Access
                 </h4>
                 <div className="grid grid-cols-2 gap-3">
                   {center.directions.map((d, i) => {
                     const Icon = modeIcons[d.mode] || Navigation;
                     return (
                       <div key={i} className="px-4 py-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
                         <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                           <Icon size={12} />
                         </div>
                         <div className="min-w-0">
                           <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-0.5">{d.mode}</p>
                           <p className="text-[11px] font-bold text-white/70 truncate tracking-tight">{d.detail}</p>
                         </div>
                       </div>
                     );
                   })}
                 </div>
              </div>

              {/* CTA */}
              <a
                href={center.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-[11px] hover:bg-[#FFD000] hover:text-dark-950 transition-all flex items-center justify-center gap-3 group shadow-md"
              >
                <Navigation size={18} />
                Map Directions
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
