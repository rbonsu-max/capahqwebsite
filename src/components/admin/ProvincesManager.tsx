import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Edit, Trash2, Loader2, Save, X, MapPin } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function ProvincesManager() {
  const [provinces, setProvinces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProvince, setCurrentProvince] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await api.get('/provinces');
        setProvinces(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProvinces();
  }, [isEditing]);

  const handleDelete = async (id: string) => {
    setConfirmModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!confirmModal.id) return;
    try {
      await api.delete(`/provinces/${confirmModal.id}`);
      setProvinces(provinces.filter(p => p.id !== confirmModal.id));
      setConfirmModal({ isOpen: false, id: null });
    } catch (error) {
      console.error('Error deleting province:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete province.');
    }
  };

  const handleEdit = (province: any) => {
    setCurrentProvince(province);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentProvince({
      name: '',
      countries: '',
      description: '',
      latitude: 0,
      longitude: 0
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...currentProvince,
        updatedAt: new Date().toISOString()
      };
      if (currentProvince.id) {
        await api.put(`/provinces/${currentProvince.id}`, payload);
      } else {
        await api.post('/provinces', payload);
      }
      setIsEditing(false);
      setCurrentProvince(null);
      // Refresh provinces
      const data = await api.get('/provinces');
      setProvinces(data);
    } catch (error) {
      console.error('Error saving province:', error);
      alert(error instanceof Error ? error.message : 'Failed to save province.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">{currentProvince.id ? 'Edit Province' : 'New Province'}</h3>
          <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Province Name</label>
            <input
              type="text"
              value={currentProvince.name}
              onChange={(e) => setCurrentProvince({...currentProvince, name: e.target.value})}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Anglican Church of Kenya"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Countries Covered</label>
            <input
              type="text"
              value={currentProvince.countries}
              onChange={(e) => setCurrentProvince({...currentProvince, countries: e.target.value})}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Kenya"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Latitude</label>
              <input
                type="number"
                step="any"
                value={currentProvince.latitude || 0}
                onChange={(e) => setCurrentProvince({...currentProvince, latitude: parseFloat(e.target.value) || 0})}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., -1.2921"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Longitude</label>
              <input
                type="number"
                step="any"
                value={currentProvince.longitude || 0}
                onChange={(e) => setCurrentProvince({...currentProvince, longitude: parseFloat(e.target.value) || 0})}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 36.8219"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description / Details</label>
            <textarea
              value={currentProvince.description}
              onChange={(e) => setCurrentProvince({...currentProvince, description: e.target.value})}
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description or additional details about the province..."
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
              disabled={saving}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {saving ? 'Saving...' : 'Save Province'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Manage Provinces</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Province
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Province Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Countries</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {provinces.map((province) => (
              <tr key={province.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-blue-600 mr-3" />
                    <div className="text-sm font-medium text-slate-900">{province.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {province.countries}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(province)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <Edit className="w-4 h-4 inline" />
                  </button>
                  <button
                    onClick={() => handleDelete(province.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4 inline" />
                  </button>
                </td>
              </tr>
            ))}
            {provinces.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                  No provinces found. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Province"
        message="Are you sure you want to delete this province? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}
