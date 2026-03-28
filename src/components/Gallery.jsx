import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Monitor, Shield, Users, Coffee, Lock, Camera, Maximize } from 'lucide-react';

const galleryImages = [
  {
    src: '/images/facility/calicut-reception.jpg',
    title: 'Calicut Centre - Reception & Waiting Area',
    desc: 'Professional reception desk with comfortable seating for candidates',
    center: 'Calicut',
  },
  {
    src: '/images/facility/kochi-reception.jpg',
    title: 'Kochi Centre - Reception & Support Desk',
    desc: 'Welcoming reception area with branded environment and waiting seats',
    center: 'Kochi',
  },
  {
    src: '/images/facility/calicut-testing-stations.jpg',
    title: 'Calicut Centre - Private Testing Stations',
    desc: 'Individual partitioned workstations ensuring complete privacy during exams',
    center: 'Calicut',
  },
  {
    src: '/images/facility/kochi-testing-hall.jpg',
    title: 'Kochi Centre - Testing Hall & Admin Area',
    desc: 'Spacious testing hall with individual cubicles, monitors, and admin oversight area',
    center: 'Kochi',
  },
  {
    src: '/images/facility/corridor-lockers.jpg',
    title: 'Secure Corridor & Locker Facility',
    desc: 'Modern corridor with bright yellow secure lockers for personal belongings',
    center: 'Calicut',
  },
  {
    src: '/images/facility/lockers-closeup.jpg',
    title: 'Secure Storage Lockers',
    desc: 'Individual secure lockers with CCTV surveillance for safe storage during exams',
    center: 'Calicut',
  },
];

const features = [
  {
    icon: Monitor,
    title: 'Individual Testing Stations',
    desc: 'Private workstations with modern hardware, noise-cancelling partitions, and ergonomic seating for maximum focus.',
    image: '/images/facility/calicut-testing-stations.jpg',
  },
  {
    icon: Shield,
    title: 'Secure Environment',
    desc: 'Biometric verification, CCTV surveillance, and secure locker facilities meeting global testing standards.',
    image: '/images/facility/lockers-closeup.jpg',
  },
  {
    icon: Users,
    title: 'Professional Reception',
    desc: 'Friendly staff to guide you through check-in, help with any queries, and ensure a smooth testing experience.',
    image: '/images/facility/calicut-reception.jpg',
  },
  {
    icon: Lock,
    title: 'Personal Locker Storage',
    desc: 'Secure, numbered lockers for your phones, bags, and belongings. Items stored safely while you take your exam.',
    image: '/images/facility/corridor-lockers.jpg',
  },
];

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null);
  const [activeCenter, setActiveCenter] = useState('All');

  const filteredImages = activeCenter === 'All'
    ? galleryImages
    : galleryImages.filter((img) => img.center === activeCenter);

  const openLightbox = (index) => setLightbox(index);
  const closeLightbox = () => setLightbox(null);
  const prevImage = () => setLightbox((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
  const nextImage = () => setLightbox((prev) => (prev + 1) % filteredImages.length);

  return (
    <section id="gallery" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-navy-400 text-sm font-semibold tracking-[0.15em] uppercase">Our Facilities</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 mb-5">
            World-Class <span className="gradient-text font-serif">Testing Centers</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Two state-of-the-art centers in Calicut and Kochi, designed for comfort, security, and the best exam experience.
          </p>
        </div>

        {/* Feature cards with images */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {features.map((f, i) => (
            <div key={i} className="glass-card rounded-2xl overflow-hidden hover:border-gold-500/30 transition-all duration-300 group">
              <div className="relative h-40 overflow-hidden">
                <img
                  src={f.image}
                  alt={f.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/30 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <div className="w-10 h-10 rounded-xl bg-gold-500/20 backdrop-blur-sm flex items-center justify-center">
                    <f.icon size={22} className="text-gold-400" />
                  </div>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-white font-semibold text-base mb-2 group-hover:text-gold-400 transition-colors">
                  {f.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Photo Gallery */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-xl flex items-center gap-2">
              <Camera size={22} className="text-gold-400" />
              Photo Gallery
            </h3>
            <div className="flex gap-2">
              {['All', 'Calicut', 'Kochi'].map((center) => (
                <button
                  key={center}
                  onClick={() => setActiveCenter(center)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeCenter === center
                      ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {center}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredImages.map((img, i) => (
              <button
                key={i}
                onClick={() => openLightbox(i)}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] focus:outline-none focus:ring-2 focus:ring-gold-500/50"
              >
                <img
                  src={img.src}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h4 className="text-white text-sm font-semibold mb-1">{img.title}</h4>
                  <p className="text-gray-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300">{img.desc}</p>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <Maximize size={16} className="text-white" />
                  </div>
                </div>
                <span className="absolute top-3 left-3 text-xs px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-gold-400 font-medium">
                  {img.center}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Center info cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="relative h-48">
              <img src="/images/facility/calicut-reception.jpg" alt="Calicut Centre" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/50 to-transparent" />
              <div className="absolute bottom-4 left-5">
                <h4 className="text-white font-bold text-xl">Calicut Centre</h4>
              </div>
            </div>
            <div className="p-5">
              <p className="text-gray-400 text-sm mb-4">
                4th Floor, Kadooli Tower, West Nadakkavu, Vandipetta Junction. Our flagship center with 
                professional reception, modern testing stations, and spacious corridors.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Prometric', 'Pearson VUE', 'IELTS', 'ETS', 'CMA US', 'CELPIP'].map((tag) => (
                  <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="relative h-48">
              <img src="/images/facility/kochi-reception.jpg" alt="Kochi Centre" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/50 to-transparent" />
              <div className="absolute bottom-4 left-5">
                <h4 className="text-white font-bold text-xl">Kochi Centre</h4>
              </div>
            </div>
            <div className="p-5">
              <p className="text-gray-400 text-sm mb-4">
                6th Floor, Manjooran Estate, Edappally. Just 350m from Edapally Metro Station. 
                Welcoming reception, secure testing stations, and private testing environments.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Prometric', 'Pearson VUE', 'IELTS', 'ETS', 'AWS', 'Microsoft'].map((tag) => (
                  <span key={tag} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center modal-backdrop" onClick={closeLightbox}>
          <div className="relative max-w-5xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors z-10"
            >
              <X size={28} />
            </button>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={filteredImages[lightbox].src}
                alt={filteredImages[lightbox].title}
                className="w-full max-h-[80vh] object-contain bg-navy-950"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-navy-950 to-transparent">
                <h4 className="text-white font-semibold text-lg">{filteredImages[lightbox].title}</h4>
                <p className="text-gray-300 text-sm mt-1">{filteredImages[lightbox].desc}</p>
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all"
            >
              <ChevronRight size={24} />
            </button>
            <div className="flex justify-center mt-4 gap-2">
              {filteredImages.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightbox(i); }}
                  className={`transition-all duration-300 rounded-full ${
                    i === lightbox ? 'w-8 h-2 bg-gold-400' : 'w-2 h-2 bg-gray-500 hover:bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
