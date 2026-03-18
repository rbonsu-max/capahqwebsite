import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ExternalLink } from 'lucide-react';
import { api } from '../lib/api';

export default function Partners() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: 'start', skipSnaps: false },
    [Autoplay({ delay: 3000, stopOnInteraction: true })]
  );

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const data = await api.get('/partners');
        // Sort by createdAt desc
        const sorted = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPartners(sorted);
      } catch (error) {
        console.error("Error fetching partners:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, []);

  if (loading) return null;
  if (partners.length === 0) return null;

  return (
    <section className="py-24 bg-white border-t border-slate-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-2">Our Network</h2>
          <p className="text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Our Partners
          </p>
          <p className="mt-4 text-xl text-slate-600">
            We are very grateful and feel honored to all our partners for being with us.
          </p>
        </div>

        <div className="relative">
          {/* Gradient masks for smooth edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-4 touch-pan-y py-4">
              {partners.map((partner, index) => (
                <div 
                  key={partner.id}
                  className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%] pl-4"
                >
                  <motion.a
                    href={partner.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="block h-full bg-slate-50 rounded-2xl p-8 text-center border border-slate-100 hover:border-blue-300 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative flex flex-col items-center"
                  >
                    <div className="absolute top-4 right-4 text-slate-300 group-hover:text-blue-500 transition-colors duration-300">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                    
                    <div className="w-28 h-28 mx-auto bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-500 overflow-hidden border border-slate-100 p-3">
                      <img 
                        src={partner.logoUrl} 
                        alt={`${partner.name} logo`} 
                        className="w-full h-full object-contain mix-blend-multiply"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}&background=f8fafc&color=2563eb&size=128&font-size=0.33`;
                          e.currentTarget.classList.remove('mix-blend-multiply');
                        }}
                      />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">{partner.name}</h3>
                    
                    {partner.description && (
                      <p className="text-sm text-slate-500 line-clamp-3 mb-4">{partner.description}</p>
                    )}
                    
                    <div className="mt-auto pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="inline-flex items-center text-sm font-semibold text-blue-600">
                        Visit Website <ExternalLink className="w-4 h-4 ml-1" />
                      </span>
                    </div>
                  </motion.a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
