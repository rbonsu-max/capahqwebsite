import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Tag } from 'lucide-react';
import { api } from '../lib/api';

export default function Gallery() {
  const [images, setImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [filter, setFilter] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>(['All']);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const data = await api.get('/gallery');
        setImages(data.sort((a: any, b: any) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime()));
        
        // Extract unique categories
        const uniqueCategories = Array.from(new Set(data.map((item: any) => item.category).filter(Boolean)));
        setCategories(['All', ...uniqueCategories as string[]]);
      } catch (error) {
        console.error('Error fetching gallery:', error);
      }
    };
    fetchGallery();
  }, []);

  const filteredImages = filter === 'All' 
    ? images 
    : images.filter(img => img.category === filter);

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
            Photo Gallery
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto"
          >
            A visual journey through our programs, events, and community impact across Africa.
          </motion.p>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Filters */}
          {categories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                    filter === cat 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Masonry-style Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-[4/3] bg-slate-200 shadow-sm hover:shadow-xl"
                  onClick={() => setSelectedImage(image)}
                >
                  <img 
                    src={image.image_url} 
                    alt={image.title || 'Gallery image'} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    {image.title && (
                      <h3 className="text-white font-bold text-lg mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        {image.title}
                      </h3>
                    )}
                    <div className="flex items-center gap-4 text-slate-200 text-sm translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                      {image.category && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-4 h-4" /> {image.category}
                        </span>
                      )}
                      {image.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> {new Date(image.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredImages.length === 0 && (
              <div className="col-span-full text-center py-20 text-slate-500">
                No images found in this category.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              onClick={() => setSelectedImage(null)}
            />
            
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full z-10 backdrop-blur-sm transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-5xl max-h-[85vh] flex flex-col items-center justify-center"
            >
              <img 
                src={selectedImage.image_url} 
                alt={selectedImage.title || 'Gallery image'} 
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
                referrerPolicy="no-referrer"
              />
              
              {(selectedImage.title || selectedImage.category || selectedImage.date) && (
                <div className="mt-6 text-center text-white max-w-2xl">
                  {selectedImage.title && (
                    <h2 className="text-2xl font-bold mb-2">{selectedImage.title}</h2>
                  )}
                  <div className="flex items-center justify-center gap-6 text-slate-300 text-sm">
                    {selectedImage.category && (
                      <span className="flex items-center gap-2">
                        <Tag className="w-4 h-4" /> {selectedImage.category}
                      </span>
                    )}
                    {selectedImage.date && (
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> {new Date(selectedImage.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
