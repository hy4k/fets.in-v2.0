import { useState } from 'react';
import { X, MapPin, Phone, Mail, Clock, Train, Bus, Plane, Navigation, ArrowRight } from 'lucide-react';
import { centers } from '../../data/siteData';

const modeIcons = { Train, Bus, Air: Plane, Metro: Train };

export default function ContactPanel({ onClose }) {
  const [active, setActive] = useState('calicut');
  const center = centers.find((c) => c.id === active);

  return (
    <>
      <div className="panel-overlay" onClick={onClose} />
      <div className="panel-slide">
        <div className="panel-header">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-rose-400" />
            <h3 className="text-white font-semibold">Our Locations</h3>
          </div>
          <button className="panel-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="panel-body">
          {/* Phone banner */}
          <a href="tel:+919605686000" className="flex items-center justify-center gap-2 py-3 rounded-xl bg-rose-400/10 border border-rose-400/20 mb-5 hover:bg-rose-400/15 transition-colors">
            <Phone size={16} className="text-rose-400" />
            <span className="text-rose-300 font-bold">+91 9605686000</span>
          </a>

          {/* Centre tabs */}
          <div className="flex gap-2 mb-5">
            {centers.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 transition-all ${
                  active === c.id
                    ? 'bg-rose-400/15 text-rose-300 border border-rose-400/30'
                    : 'bg-zinc-800/50 text-zinc-500 border border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <MapPin size={14} />{c.name.replace(' Centre', '')}
              </button>
            ))}
          </div>

          {/* Center image */}
          {center.images?.[0] && (
            <img src={center.images[0]} alt={center.name} className="panel-image mb-5" />
          )}

          {/* Details */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-rose-400 mt-0.5 flex-shrink-0" />
              <p className="text-zinc-300 text-sm">{center.address}</p>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-rose-400 flex-shrink-0" />
              <div className="text-sm">
                <a href={`tel:${center.phone.replace(/\s/g, '')}`} className="text-zinc-300 hover:text-rose-400 transition-colors">{center.phone}</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-rose-400 flex-shrink-0" />
              <a href={`mailto:${center.email}`} className="text-zinc-300 text-sm hover:text-rose-400 transition-colors">{center.email}</a>
            </div>
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-rose-400 flex-shrink-0" />
              <p className="text-zinc-300 text-sm">{center.hours}</p>
            </div>
          </div>

          {/* Directions */}
          <h4 className="text-white font-medium text-sm mb-3">How to Reach</h4>
          <div className="space-y-2 mb-6">
            {center.directions.map((d, i) => {
              const Icon = modeIcons[d.mode] || Navigation;
              return (
                <div key={i} className="flex items-start gap-2.5">
                  <Icon size={14} className="mt-0.5 flex-shrink-0 text-orange-400" />
                  <span className="text-zinc-400 text-sm">
                    <span className="text-zinc-300 font-medium">{d.mode}:</span> {d.detail}
                  </span>
                </div>
              );
            })}
          </div>

          <a
            href={center.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full justify-center rounded-xl"
          >
            <Navigation size={16} />
            Open in Google Maps
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </>
  );
}
