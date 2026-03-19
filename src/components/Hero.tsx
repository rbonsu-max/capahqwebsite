import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const data = await api.get('/hero_slides');
        // Sort by orderIndex
        const sorted = data.sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));
        setSlides(sorted);
      } catch (error) {
        console.error("Error fetching hero slides:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-slate-900 h-[650px] sm:h-[700px] lg:h-[800px] flex items-center justify-center pt-20">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return (
      <section className="relative overflow-hidden bg-slate-900 h-[650px] sm:h-[700px] lg:h-[800px] flex items-center pt-20">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
              Welcome to CAPA
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
              Council of Anglican Provinces of Africa
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-slate-900 h-[650px] sm:h-[700px] lg:h-[800px] flex items-center pt-20">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover opacity-30"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
            >
              {slides[currentSlide].badge && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-200 border border-blue-500/30 mb-6">
                  {slides[currentSlide].badge}
                </span>
              )}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
                {slides[currentSlide].title}
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
                {slides[currentSlide].description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#about"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/30"
                >
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
                <a
                  href="#work"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-medium rounded-full text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-colors"
                >
                  Our Work
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Carousel Controls */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-4 z-20">
          <button 
            onClick={prevSlide}
            className="p-2 rounded-full bg-white/10 hover:bg-white/30 hover:scale-110 text-white backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                  index === currentSlide ? 'bg-blue-500 w-8 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-white/50 w-2.5 hover:bg-white hover:scale-125 hover:shadow-[0_0_8px_rgba(255,255,255,0.5)]'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <button 
            onClick={nextSlide}
            className="p-2 rounded-full bg-white/10 hover:bg-white/30 hover:scale-110 text-white backdrop-blur-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </section>
  );
}
