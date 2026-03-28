import { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { testimonials } from '../data/siteData';

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const intervalRef = useRef(null);

  const startAutoPlay = () => {
    intervalRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 5000);
  };

  useEffect(() => {
    startAutoPlay();
    return () => clearInterval(intervalRef.current);
  }, []);

  const goTo = (i) => {
    clearInterval(intervalRef.current);
    setActive(i);
    startAutoPlay();
  };

  const prev = () => goTo((active - 1 + testimonials.length) % testimonials.length);
  const next = () => goTo((active + 1) % testimonials.length);

  return (
    <section className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-gold-400 text-sm font-semibold tracking-[0.15em] uppercase">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-3 mb-5">
            What Our <span className="gradient-text font-serif">Candidates Say</span>
          </h2>
        </div>

        {/* Featured testimonial */}
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <Quote size={80} className="absolute top-6 right-6 text-gold-500/5" />
            <div className="relative z-10">
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {Array.from({ length: testimonials[active].rating }, (_, i) => (
                  <Star key={i} size={20} className="text-gold-400 fill-gold-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-white text-xl sm:text-2xl leading-relaxed mb-8 font-light italic">
                "{testimonials[active].text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-navy-950 font-bold text-lg">
                  {testimonials[active].avatar}
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">{testimonials[active].name}</h4>
                  <p className="text-gold-400 text-sm">{testimonials[active].role}</p>
                </div>
                <div className="ml-auto text-xs text-gray-500">Google Review</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button onClick={prev} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all">
              <ChevronLeft size={20} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === active ? 'w-8 h-2 bg-gold-400' : 'w-2 h-2 bg-gray-600 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
            <button onClick={next} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Small cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          {testimonials.filter((_, i) => i !== active).slice(0, 3).map((t, i) => (
            <div key={i} className="glass-card rounded-xl p-5">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating }, (_, j) => (
                  <Star key={j} size={14} className="text-gold-400 fill-gold-400" />
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-3 line-clamp-3">"{t.text}"</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center text-gold-400 text-xs font-bold">
                  {t.avatar}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{t.name}</div>
                  <div className="text-gray-500 text-xs">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
