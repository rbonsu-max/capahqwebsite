import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, X } from 'lucide-react';
import { api } from '../lib/api';
import { useLocation } from 'react-router-dom';

export default function Leadership() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [selectedLeader, setSelectedLeader] = useState<any | null>(null);
  const location = useLocation();

  // Determine category from URL
  const categoryMap: Record<string, string> = {
    '/leadership/primates': 'primate',
    '/leadership/standing-committee': 'standing_committee',
    '/leadership/trustees': 'trustee'
  };

  const titleMap: Record<string, string> = {
    'primate': 'Primates',
    'standing_committee': 'Standing Committee Members',
    'trustee': 'Trustees'
  };

  const currentCategory = categoryMap[location.pathname] || 'primate';
  const currentTitle = titleMap[currentCategory];

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const data = await api.get('/leadership');
        const filtered = data.filter((l: any) => l.category === currentCategory);
        setLeaders(filtered.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)));
      } catch (error) {
        console.error('Error fetching leadership:', error);
      }
    };
    fetchLeaders();
  }, [currentCategory]);

  return (
    <div className="pt-20 bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={currentTitle}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            {currentTitle}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto"
          >
            Meet the dedicated leaders guiding the Council of Anglican Provinces of Africa.
          </motion.p>
        </div>
      </section>

      {/* Leadership Directory */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {leaders.map((leader, index) => (
              <motion.div
                key={leader.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-50 rounded-2xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer hover:shadow-lg transition-all group"
                onClick={() => setSelectedLeader(leader)}
              >
                <div className="aspect-square overflow-hidden bg-slate-200">
                  {leader.image_url ? (
                    <img 
                      src={leader.image_url} 
                      alt={leader.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{leader.name}</h3>
                  <p className="text-blue-600 font-medium mb-4">{leader.role}</p>
                  
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                    <Info className="w-4 h-4" />
                    View Details
                  </div>
                </div>
              </motion.div>
            ))}
            
            {leaders.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500">
                No leaders found for this category.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Leader Modal */}
      <AnimatePresence>
        {selectedLeader && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedLeader(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <button
                onClick={() => setSelectedLeader(null)}
                className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-slate-900 rounded-full z-10 backdrop-blur-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="overflow-y-auto">
                <div className="sm:flex">
                  <div className="w-full sm:w-2/5 shrink-0">
                    <div className="aspect-square sm:aspect-auto sm:h-full bg-slate-100">
                      {selectedLeader.image_url ? (
                        <img 
                          src={selectedLeader.image_url} 
                          alt={selectedLeader.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 min-h-[300px]">
                          No Image
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-8 sm:w-3/5">
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">{selectedLeader.name}</h2>
                    <p className="text-lg text-blue-600 font-medium mb-6">{selectedLeader.role}</p>
                    
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Biography</h3>
                      <div className="prose prose-slate prose-sm max-w-none">
                        {selectedLeader.bio ? (
                          <p className="whitespace-pre-wrap text-slate-600 leading-relaxed">{selectedLeader.bio}</p>
                        ) : (
                          <p className="text-slate-400 italic">No biography available.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
