import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Edit, Trash2, Image as ImageIcon, Loader2, Save, X } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function CarouselManager() {
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const data = await api.get('/hero_slides');
        setSlides(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, [isEditing]);

  const handleDelete = async (id: string) => {
    setConfirmModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!confirmModal.id) return;
    try {
      await api.delete(`/hero_slides/${confirmModal.id}`);
      setSlides(slides.filter(s => s.id !== confirmModal.id));
      setConfirmModal({ isOpen: false, id: null });
    } catch (error) {
      console.error('Error deleting slide: ', error);
      alert(error instanceof Error ? error.message : 'Failed to delete slide.');
    }
  };

  const handleEdit = (slide: any) => {
    setCurrentSlide(slide);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentSlide({
      title: '',
      description: '',
      badge: '',
      image: '',
      order: slides.length
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const payload = {
        ...currentSlide,
        imageUrl: currentSlide.image || currentSlide.imageUrl,
        orderIndex: currentSlide.order || currentSlide.orderIndex,
        updatedAt: new Date().toISOString()
      };
      if (currentSlide.id) {
        await api.put(`/hero_slides/${currentSlide.id}`, payload);
      } else {
        await api.post('/hero_slides', payload);
      }
      setIsEditing(false);
      setCurrentSlide(null);
    } catch (error) {
      console.error('Error saving slide:', error);
      alert(error instanceof Error ? error.message : 'Failed to save slide.');
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image exceeds the 5MB size limit.");
      return;
    }

    setUploading(true);
    try {
      const res = await api.upload(file);
      setCurrentSlide((prev: any) => ({
        ...prev,
        image: res.url,
        imageUrl: res.url
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(error instanceof Error ? error.message : "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">{currentSlide.id ? 'Edit Slide' : 'New Slide'}</h3>
          <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Image</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {currentSlide.image ? (
                <div className="relative w-48 h-32 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                  <img src={currentSlide.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-48 h-32 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 flex-shrink-0">
                  <ImageIcon className="w-8 h-8 text-slate-400" />
                </div>
              )}
              <div className="flex-1 w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-2 text-xs text-slate-500">Upload a high-resolution image (1920x1080 recommended, Max 5MB).</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Badge Text (Optional)</label>
            <input
              type="text"
              value={currentSlide.badge}
              onChange={(e) => setCurrentSlide({...currentSlide, badge: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Instrument of Anglican Communion"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
            <input
              type="text"
              value={currentSlide.title}
              onChange={(e) => setCurrentSlide({...currentSlide, title: e.target.value})}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Main headline"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={currentSlide.description}
              onChange={(e) => setCurrentSlide({...currentSlide, description: e.target.value})}
              required
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Sub-headline or short description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Order (0 is first)</label>
            <input
              type="number"
              value={currentSlide.order}
              onChange={(e) => setCurrentSlide({...currentSlide, order: parseInt(e.target.value) || 0})}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors mr-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {uploading ? 'Saving...' : 'Save Slide'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Manage Homepage Carousel</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Slide
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slides.map((slide) => (
          <div key={slide.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="h-48 relative">
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold">
                Order: {slide.order}
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              {slide.badge && <span className="text-xs font-semibold text-blue-600 mb-1">{slide.badge}</span>}
              <h3 className="font-bold text-slate-900 mb-2 line-clamp-2">{slide.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1">{slide.description}</p>
              
              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => handleEdit(slide)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Edit Slide"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(slide.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Slide"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {slides.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">
            No slides found. Add one to get started.
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Slide"
        message="Are you sure you want to delete this carousel slide? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}
