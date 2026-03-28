const partners = [
  { name: 'Prometric', logo: '/images/logos/prometric.png' },
  { name: 'Pearson VUE', logo: '/images/logos/pearson-vue.png' },
  { name: 'CELPIP', logo: '/images/logos/celpip.jpg' },
  { name: 'CMA USA', logo: '/images/logos/cma-usa.png' },
  { name: 'PSI', logo: '/images/logos/psi.png' },
  { name: 'MRCS', logo: '/images/logos/rcs.png' },
  { name: 'Microsoft', logo: '/images/logos/microsoft.png' },
];

export default function Partners() {
  return (
    <section className="py-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-center text-sm text-gray-500 uppercase tracking-[0.2em] mb-10 font-medium">
          Authorized Testing Partner For
        </p>
        
        {/* Logo grid */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12">
          {partners.map((p, i) => (
            <div
              key={i}
              className="glass-card px-6 py-4 rounded-2xl hover:border-gold-500/30 transition-all duration-300 group cursor-default flex items-center justify-center"
              title={p.name}
            >
              <img
                src={p.logo}
                alt={p.name}
                className="h-10 sm:h-12 w-auto object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
              />
            </div>
          ))}
        </div>

        {/* Additional partner text badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          {['IELTS', 'TOEFL / GRE (ETS)', 'ACCA', 'AWS', 'Cisco', 'CompTIA', 'Oracle'].map((name, i) => (
            <span
              key={i}
              className="px-4 py-2 rounded-full bg-white/[0.03] border border-white/8 text-gray-400 text-xs font-medium hover:text-gold-400 hover:border-gold-500/30 transition-all cursor-default"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
