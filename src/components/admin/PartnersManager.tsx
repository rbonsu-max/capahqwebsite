import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Edit, Trash2, Loader2, Save, X, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function PartnersManager() {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPartner, setCurrentPartner] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const data = await api.get('/partners');
        setPartners(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPartners();
  }, [isEditing]);

  const handleDelete = async (id: string) => {
    setConfirmModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!confirmModal.id) return;
    try {
      await api.delete(`/partners/${confirmModal.id}`);
      setPartners(partners.filter(p => p.id !== confirmModal.id));
      setConfirmModal({ isOpen: false, id: null });
    } catch (error) {
      console.error('Error deleting partner: ', error);
      alert(error instanceof Error ? error.message : 'Failed to delete partner.');
    }
  };

  const handleEdit = (partner: any) => {
    setCurrentPartner(partner);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentPartner({
      name: '',
      logoUrl: '',
      websiteUrl: '',
      description: ''
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const payload = {
        ...currentPartner,
        updatedAt: new Date().toISOString()
      };
      if (currentPartner.id) {
        await api.put(`/partners/${currentPartner.id}`, payload);
      } else {
        await api.post('/partners', payload);
      }
      setIsEditing(false);
      setCurrentPartner(null);
      // Refresh partners
      const data = await api.get('/partners');
      setPartners(data);
    } catch (error) {
      console.error('Error saving partner:', error);
      alert(error instanceof Error ? error.message : 'Failed to save partner.');
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
      setCurrentPartner((prev: any) => ({
        ...prev,
        logoUrl: res.url
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
          <h3 className="text-xl font-bold text-slate-900">{currentPartner.id ? 'Edit Partner' : 'New Partner'}</h3>
          <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Partner Name</label>
            <input
              type="text"
              value={currentPartner.name}
              onChange={(e) => setCurrentPartner({...currentPartner, name: e.target.value})}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Anglican Alliance"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Website URL</label>
            <div className="flex items-center">
              <span className="px-3 py-2 bg-slate-50 border border-r-0 border-slate-300 rounded-l-lg text-slate-500">
                <LinkIcon className="w-4 h-4" />
              </span>
              <input
                type="url"
                value={currentPartner.websiteUrl}
                onChange={(e) => setCurrentPartner({...currentPartner, websiteUrl: e.target.value})}
                required
                className="flex-1 px-4 py-2 border border-slate-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={currentPartner.description || ''}
              onChange={(e) => setCurrentPartner({...currentPartner, description: e.target.value})}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of the partner..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Partner Logo</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {currentPartner.logoUrl ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-50 flex items-center justify-center p-2">
                  <img src={currentPartner.logoUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 flex-shrink-0">
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
                <p className="mt-2 text-xs text-slate-500">Upload a transparent PNG or SVG logo (Max 5MB).</p>
              </div>
            </div>
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
              {uploading ? 'Saving...' : 'Save Partner'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Manage Partners</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Partner
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner) => (
          <div key={partner.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="h-32 bg-slate-50 p-4 flex items-center justify-center border-b border-slate-100">
              <img src={partner.logoUrl} alt={partner.name} className="max-w-full max-h-full object-contain" />
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{partner.name}</h3>
              <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline line-clamp-1 mb-2 flex items-center">
                <LinkIcon className="w-3 h-3 mr-1" />
                {partner.websiteUrl}
              </a>
              {partner.description && (
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">{partner.description}</p>
              )}
              {!partner.description && <div className="flex-1 mb-4"></div>}
              
              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 mt-auto">
                <button 
                  onClick={() => handleEdit(partner)}
                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Edit Partner"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDelete(partner.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Partner"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {partners.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">
            No partners found. Add one to get started.
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Partner"
        message="Are you sure you want to delete this partner? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}
