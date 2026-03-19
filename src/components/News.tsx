import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, ArrowRight, Sparkles, X, Loader2 } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { api } from '../lib/api';

export default function News() {
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await api.get('/news');
        // Sort by createdAt desc
        const sorted = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNews(sorted);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: 'start', skipSnaps: false },
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  );

  const categories = Array.from(new Set(news.map(item => item.category)));
  const [showGenerator, setShowGenerator] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    setGeneratedImage(null);
    try {
      const prompt = `A beautiful, inspiring, high-quality illustration representing the concept of "${selectedCategory}" in the context of African community development, hope, and faith.`;
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate image');
      }
      
      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        throw new Error('No image URL returned');
      }
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section id="news" className="py-24 bg-slate-50 border-t border-slate-100 overflow-hidden scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16">
          <div className="max-w-2xl">
            <h2 className="text-sm font-semibold text-blue-600 tracking-wide uppercase">Communications</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              News & Updates
            </p>
            <p className="mt-4 text-xl text-slate-500">
              Take a look at our blog posts and see our activity around the Continent as well as globally.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 hidden md:flex">
            <button 
              onClick={() => setShowGenerator(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-full hover:bg-blue-100 transition-colors"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Visualize News
            </button>
            <a href="#" className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              View all news <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="relative">
          {/* Gradient masks for smooth edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : news.length > 0 ? (
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex -ml-4 sm:-ml-8 touch-pan-y py-4">
                {news.map((item, index) => (
                  <div 
                    key={item.id || index}
                    className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%] pl-4 sm:pl-8"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group h-full flex flex-col"
                    >
                      <div className="relative h-48 overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-700 uppercase tracking-wider">
                          {item.category}
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="flex items-center text-sm text-slate-500 mb-3">
                          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                          {new Date(item.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2 flex-grow">
                          {item.title}
                        </h3>
                        <button 
                          onClick={() => setSelectedArticle(item)}
                          className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 mt-auto"
                        >
                          Read article
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">
              No news articles found.
            </div>
          )}
        </div>
        
        <div className="mt-10 text-center md:hidden flex flex-col items-center gap-4">
          <button 
            onClick={() => setShowGenerator(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-full hover:bg-blue-100 transition-colors"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Visualize News
          </button>
          <a href="#" className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors">
            View all news <ArrowRight className="ml-2 h-5 w-5" />
          </a>
        </div>

        {/* About Resources Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 bg-blue-900 rounded-3xl overflow-hidden shadow-xl relative"
        >
          <div className="absolute inset-0 opacity-10 bg-[url('https://picsum.photos/seed/library/1920/1080')] bg-cover bg-center mix-blend-overlay"></div>
          <div className="relative px-8 py-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Looking for official documents?</h3>
              <p className="text-blue-200 text-lg">
                Explore our comprehensive collection of toolkits, prayer cycles, and strategic plans in the Resources section.
              </p>
            </div>
            <a 
              href="#resources" 
              className="inline-flex items-center px-8 py-4 bg-white text-blue-900 font-bold rounded-full hover:bg-blue-50 hover:scale-105 transition-all shadow-lg"
            >
              About Resources
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </motion.div>
      </div>

      {/* Article Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden"
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-48 sm:h-64 flex-shrink-0">
                <img 
                  src={selectedArticle.image} 
                  alt={selectedArticle.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 right-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                      {selectedArticle.category}
                    </span>
                    <span className="flex items-center text-sm text-slate-200">
                      <Calendar className="h-4 w-4 mr-1.5" />
                      {new Date(selectedArticle.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                    {selectedArticle.title}
                  </h3>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 sm:p-8 overflow-y-auto flex-1 min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 text-base sm:text-lg leading-relaxed whitespace-pre-line">
                    {selectedArticle.content}
                  </p>
                </div>
              </div>
              
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-slate-100 bg-slate-50 flex justify-end flex-shrink-0">
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="px-6 py-2.5 bg-slate-200 text-slate-800 font-medium rounded-xl hover:bg-slate-300 transition-colors"
                >
                  Close Article
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Generator Modal */}
      <AnimatePresence>
        {showGenerator && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden"
            onClick={() => setShowGenerator(false)}
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
              <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                  Visualize News Category
                </h3>
                <button 
                  onClick={() => setShowGenerator(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 sm:p-6 sm:p-8 overflow-y-auto flex-1 flex flex-col items-center min-h-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
                <p className="text-slate-600 text-center mb-6">
                  Select a news category to generate an inspiring illustration representing its themes.
                </p>
                
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="w-full max-w-md aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden relative mb-6">
                  {isGenerating ? (
                    <div className="flex flex-col items-center text-blue-600">
                      <Loader2 className="w-10 h-10 animate-spin mb-3" />
                      <span className="text-sm font-medium">Generating image...</span>
                    </div>
                  ) : generatedImage ? (
                    <img src={generatedImage} alt={`Generated illustration for ${selectedCategory}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <Sparkles className="w-10 h-10 mb-3 opacity-50" />
                      <span className="text-sm font-medium">Image will appear here</span>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={handleGenerateImage}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Image
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
