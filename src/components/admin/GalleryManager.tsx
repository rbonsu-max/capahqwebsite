import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Edit, Trash2, Loader2, Save, X, Image as ImageIcon, UploadCloud } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function GalleryManager() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [currentImage, setCurrentImage] = useState<any>(null);
  const [bulkData, setBulkData] = useState<{ title: string; category: string; date: string; files: File[] }>({
    title: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    files: []
  });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const data = await api.get('/gallery');
        setImages(data.sort((a: any, b: any) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime()));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [isEditing, isBulkMode]);

  const handleDelete = async (id: string) => {
    setConfirmModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!confirmModal.id) return;
    try {
      await api.delete(`/gallery/${confirmModal.id}`);
      setImages(images.filter(i => i.id !== confirmModal.id));
      setConfirmModal({ isOpen: false, id: null });
    } catch (error) {
      console.error('Error deleting image:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete image.');
    }
  };

  const handleEdit = (image: any) => {
    setCurrentImage(image);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentImage({
      title: '',
      image_url: '',
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const payload = {
        ...currentImage,
        updated_at: new Date().toISOString()
      };
      if (currentImage.id) {
        await api.put(`/gallery/${currentImage.id}`, payload);
      } else {
        await api.post('/gallery', payload);
      }
      setIsEditing(false);
      setCurrentImage(null);
      // Refresh gallery
      const data = await api.get('/gallery');
      setImages(data.sort((a: any, b: any) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime()));
    } catch (error) {
      console.error('Error saving image:', error);
      alert(error instanceof Error ? error.message : 'Failed to save image.');
    } finally {
      setUploading(false);
    }
  };

  const handleBulkSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkData.files.length === 0) {
      alert("Please select at least one image.");
      return;
    }
    setUploading(true);
    try {
      // Upload all images in parallel
      const uploadPromises = bulkData.files.map(file => api.upload(file));
      const uploadResults = await Promise.all(uploadPromises);
      const imageUrls = uploadResults.map(res => res.url);

      // Send bulk request
      await (api as any).postBulkGallery({
        images: imageUrls,
        title: bulkData.title,
        category: bulkData.category,
        date: bulkData.date
      });

      setIsBulkMode(false);
      setBulkData({
        title: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        files: []
      });
      // Refresh gallery
      const data = await api.get('/gallery');
      setImages(data.sort((a: any, b: any) => new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime()));
    } catch (error) {
      console.error('Error in bulk upload:', error);
      alert(error instanceof Error ? error.message : 'Failed to complete bulk upload.');
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
      setCurrentImage((prev: any) => ({
        ...prev,
        image_url: res.url
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(error instanceof Error ? error.message : "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleBulkFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setBulkData(prev => ({
        ...prev,
        files: [...prev.files, ...selectedFiles]
      }));
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  if (isBulkMode) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Bulk Upload Images</h2>
          <button
            onClick={() => setIsBulkMode(false)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleBulkSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Common Title / Description <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={bulkData.title}
                onChange={e => setBulkData({...bulkData, title: e.target.value})}
                placeholder="e.g., Annual General Meeting 2024"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category (Optional)</label>
              <input
                type="text"
                value={bulkData.category}
                onChange={e => setBulkData({...bulkData, category: e.target.value})}
                placeholder="e.g., Events"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={bulkData.date}
                onChange={e => setBulkData({...bulkData, date: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Images <span className="text-red-500">*</span></label>
            <div className="mt-1 border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleBulkFilesChange}
                className="hidden"
                id="bulk-upload"
              />
              <label htmlFor="bulk-upload" className="cursor-pointer flex flex-col items-center">
                <UploadCloud className="w-12 h-12 text-slate-400 mb-2" />
                <span className="text-slate-600 font-medium">Click to select multiple images</span>
                <span className="text-slate-400 text-sm">or drag and drop them here</span>
              </label>
            </div>
            
            {bulkData.files.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-slate-700">{bulkData.files.length} images selected:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {bulkData.files.map((file, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setBulkData(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== idx) }))}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsBulkMode(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || bulkData.files.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
              {uploading ? 'Uploading...' : `Upload ${bulkData.files.length} Images`}
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            {currentImage?.id ? 'Edit Image' : 'Add New Image'}
          </h2>
          <button
            onClick={() => setIsEditing(false)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title (Optional)</label>
              <input
                type="text"
                value={currentImage?.title || ''}
                onChange={e => setCurrentImage({...currentImage, title: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category (Optional)</label>
              <input
                type="text"
                value={currentImage?.category || ''}
                onChange={e => setCurrentImage({...currentImage, category: e.target.value})}
                placeholder="e.g., Events, Programs"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                value={currentImage?.date || ''}
                onChange={e => setCurrentImage({...currentImage, date: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Image <span className="text-red-500">*</span></label>
            <div className="mt-1 flex items-center gap-4">
              {currentImage?.image_url && (
                <img 
                  src={currentImage.image_url} 
                  alt="Preview" 
                  className="h-32 w-48 object-cover rounded-lg border border-slate-200"
                  referrerPolicy="no-referrer"
                />
              )}
              <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer transition-colors border border-slate-300">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
            {!currentImage?.image_url && (
              <p className="mt-2 text-sm text-red-500">An image is required.</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !currentImage?.image_url}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Image
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Gallery Manager</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsBulkMode(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium border border-slate-300"
          >
            <UploadCloud className="w-5 h-5" />
            Bulk Upload
          </button>
          <button
            onClick={handleAddNew}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Image
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image) => (
          <div key={image.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden group">
            <div className="aspect-video relative bg-slate-100">
              <img 
                src={image.image_url} 
                alt={image.title || 'Gallery image'} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  onClick={() => handleEdit(image)}
                  className="p-2 bg-white text-blue-600 rounded-full hover:bg-blue-50 transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(image.id)}
                  className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-slate-900 truncate">{image.title || 'Untitled'}</h3>
              <div className="flex justify-between items-center mt-2 text-sm text-slate-500">
                <span>{image.category || 'Uncategorized'}</span>
                <span>{image.date ? new Date(image.date).toLocaleDateString() : ''}</span>
              </div>
            </div>
          </div>
        ))}
        {images.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">
            No images found. Add one to get started.
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Image"
        message="Are you sure you want to delete this image from the gallery? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}
