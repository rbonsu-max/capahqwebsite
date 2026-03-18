import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, TrendingUp, Users, Leaf, Navigation, X, Globe } from 'lucide-react';
import { api } from '../lib/api';

const iconMap: Record<string, any> = {
  'Shield': Shield,
  'TrendingUp': TrendingUp,
  'Users': Users,
  'Leaf': Leaf,
  'Navigation': Navigation,
  'Globe': Globe,
};

export default function FocusAreas() {
  const [areas, setAreas] = useState<any[]>([]);
  const [selectedArea, setSelectedArea] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await api.get('/thematic_areas');
        // Sort by orderIndex
        const sorted = data.sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));
        setAreas(sorted);
      } catch (error) {
        console.error("Error fetching thematic areas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAreas();
  }, []);

  if (loading) return null;
  if (areas.length === 0) return null;

  return (
    <section id="work" className="py-24 bg-slate-50 border-t border-slate-100 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-semibold text-blue-600 tracking-wide uppercase">Our Work</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Thematic Focus Areas
          </p>
          <p className="mt-4 max-w-2xl text-xl text-slate-500 mx-auto">
            We are dedicated to building the capacity of the Anglican Churches in Africa to understand better the issues of mission and development.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {areas.map((area, index) => {
            const IconComponent = iconMap[area.iconName] || Globe;
            return (
              <motion.div
                key={area.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col"
              >
                <div className={`inline-flex items-center justify-center p-4 rounded-xl bg-blue-50 mb-6 group-hover:scale-110 transition-transform duration-300 self-start`}>
                  <IconComponent className={`h-8 w-8 text-blue-600`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{area.title}</h3>
                <p className="text-slate-600 leading-relaxed mb-6 flex-grow">{area.description}</p>
                <button 
                  onClick={() => setSelectedArea(area)}
                  className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 self-start mt-auto"
                >
                  Learn more
                  <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Focus Area Details Modal */}
      <AnimatePresence>
        {selectedArea && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden"
            onClick={() => setSelectedArea(null)}
          >
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6 border-b border-slate-100 flex items-start justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    {React.createElement(iconMap[selectedArea.iconName] || Globe, { className: "w-6 h-6 sm:w-8 sm:h-8" })}
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900">{selectedArea.title}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedArea(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 sm:p-6 sm:p-8 overflow-y-auto flex-1 min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
                <p className="text-slate-700 text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                  {selectedArea.fullDescription || selectedArea.description}
                </p>
              </div>
              
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-slate-100 bg-slate-50 flex justify-end flex-shrink-0">
                <button 
                  onClick={() => setSelectedArea(null)}
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
