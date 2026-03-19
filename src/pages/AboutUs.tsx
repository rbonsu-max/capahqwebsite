import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Info, X } from 'lucide-react';
import { api } from '../lib/api';

export default function AboutUs() {
  const [staff, setStaff] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<any | null>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  const [loadingPrograms, setLoadingPrograms] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const data = await api.get('/staff');
        setStaff(data.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)));
      } catch (error) {
        console.error('Error fetching staff:', error);
      }
    };

    const fetchPrograms = async () => {
      try {
        const data = await api.get('/programs');
        setPrograms(data);
      } catch (error) {
        console.error('Error fetching programs:', error);
      } finally {
        setLoadingPrograms(false);
      }
    };

    fetchStaff();
    fetchPrograms();
  }, []);

  return (
    <div className="pt-20 bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            About CAPA
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto"
          >
            The Council of Anglican Provinces of Africa (CAPA) is a continental body that coordinates and articulates issues affecting the Church and communities across Africa.
          </motion.p>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Programs</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              CAPA runs several programs aimed at empowering communities and addressing key challenges across the continent.
            </p>
          </div>
          
          {loadingPrograms ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program, index) => (
                <motion.div
                  key={program.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer hover:border-blue-300 group"
                  onClick={() => setSelectedProgram(program)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                      <div className="w-3 h-3 bg-blue-600 rounded-full group-hover:bg-white transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">{program.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Program Modal */}
      <AnimatePresence>
        {selectedProgram && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedProgram(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <button
                onClick={() => setSelectedProgram(null)}
                className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-slate-900 rounded-full z-10 backdrop-blur-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="p-8 overflow-y-auto">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">{selectedProgram.title}</h2>
                
                {selectedProgram.description && (
                  <p className="text-lg text-slate-600 mb-6 font-medium italic border-l-4 border-blue-500 pl-4">
                    {selectedProgram.description}
                  </p>
                )}
                
                <div className="prose prose-slate max-w-none mb-8">
                  {selectedProgram.content ? (
                    <div className="whitespace-pre-wrap text-slate-600 leading-relaxed">
                      {selectedProgram.content}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">No detailed information available.</p>
                  )}
                </div>

                {selectedProgram.link && (
                  <div className="mt-auto pt-6 border-t border-slate-100">
                    <a 
                      href={selectedProgram.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                    >
                      Visit Program Website
                      <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Staff Directory */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Staff Directory</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Meet the dedicated team working behind the scenes at CAPA.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {staff.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-50 rounded-2xl overflow-hidden shadow-sm border border-slate-200 cursor-pointer hover:shadow-lg transition-all group"
                onClick={() => setSelectedStaff(member)}
              >
                <div className="aspect-square overflow-hidden bg-slate-200">
                  {member.image_url ? (
                    <img 
                      src={member.image_url} 
                      alt={member.name} 
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
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  {member.email && (
                    <div className="flex items-center gap-2 text-slate-600 text-sm mb-4">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${member.email}`} className="hover:text-blue-600" onClick={(e) => e.stopPropagation()}>
                        {member.email}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                    <Info className="w-4 h-4" />
                    View Details
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Staff Modal */}
      <AnimatePresence>
        {selectedStaff && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedStaff(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <button
                onClick={() => setSelectedStaff(null)}
                className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white text-slate-900 rounded-full z-10 backdrop-blur-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="overflow-y-auto">
                <div className="sm:flex">
                  <div className="w-full sm:w-2/5 shrink-0">
                    <div className="aspect-square sm:aspect-auto sm:h-full bg-slate-100">
                      {selectedStaff.image_url ? (
                        <img 
                          src={selectedStaff.image_url} 
                          alt={selectedStaff.name} 
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
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">{selectedStaff.name}</h2>
                    <p className="text-lg text-blue-600 font-medium mb-6">{selectedStaff.role}</p>
                    
                    {selectedStaff.email && (
                      <div className="flex items-center gap-3 text-slate-600 mb-6 bg-slate-50 p-3 rounded-lg">
                        <Mail className="w-5 h-5 text-slate-400" />
                        <a href={`mailto:${selectedStaff.email}`} className="hover:text-blue-600 font-medium">
                          {selectedStaff.email}
                        </a>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Biography</h3>
                      <div className="prose prose-slate prose-sm max-w-none">
                        {selectedStaff.bio ? (
                          <p className="whitespace-pre-wrap text-slate-600 leading-relaxed">{selectedStaff.bio}</p>
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
