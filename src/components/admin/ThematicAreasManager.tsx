import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Edit, Trash2, Loader2, Save, X, LayoutDashboard } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function ThematicAreasManager() {
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentArea, setCurrentArea] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await api.get('/thematic_areas');
        setAreas(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAreas();
  }, [isEditing]);

  const handleDelete = async (id: string) => {
    setConfirmModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!confirmModal.id) return;
    try {
      await api.delete(`/thematic_areas/${confirmModal.id}`);
      setAreas(areas.filter(a => a.id !== confirmModal.id));
      setConfirmModal({ isOpen: false, id: null });
    } catch (error) {
      console.error('Error deleting area:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete area.');
    }
  };

  const handleEdit = (area: any) => {
    setCurrentArea(area);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentArea({
      title: '',
      description: '',
      iconName: 'LayoutDashboard',
      order: areas.length
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...currentArea,
        icon: currentArea.iconName || currentArea.icon,
        orderIndex: currentArea.order || currentArea.orderIndex,
        updatedAt: new Date().toISOString()
      };
      if (currentArea.id) {
        await api.put(`/thematic_areas/${currentArea.id}`, payload);
      } else {
        await api.post('/thematic_areas', payload);
      }
      setIsEditing(false);
      setCurrentArea(null);
      // Refresh areas
      const data = await api.get('/thematic_areas');
      setAreas(data.sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0)));
    } catch (error) {
      console.error('Error saving area:', error);
      alert(error instanceof Error ? error.message : 'Failed to save thematic area.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900">{currentArea.id ? 'Edit Thematic Area' : 'New Thematic Area'}</h3>
          <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
            <input
              type="text"
              value={currentArea.title}
              onChange={(e) => setCurrentArea({...currentArea, title: e.target.value})}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Peace & Nation Building"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={currentArea.description}
              onChange={(e) => setCurrentArea({...currentArea, description: e.target.value})}
              required
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of the thematic area..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Icon Name (Lucide React)</label>
              <input
                type="text"
                value={currentArea.iconName}
                onChange={(e) => setCurrentArea({...currentArea, iconName: e.target.value})}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Heart, Shield, Book"
              />
              <p className="mt-1 text-xs text-slate-500">Enter a valid Lucide icon name (e.g., Heart, Shield, Book).</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Order</label>
              <input
                type="number"
                value={currentArea.order}
                onChange={(e) => setCurrentArea({...currentArea, order: parseInt(e.target.value) || 0})}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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
              disabled={saving}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {saving ? 'Saving...' : 'Save Area'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Manage Thematic Areas</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Area
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {areas.map((area) => (
          <div key={area.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <LayoutDashboard className="w-6 h-6" /> {/* Fallback icon */}
              </div>
              <div className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                Order: {area.order}
              </div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{area.title}</h3>
            <p className="text-slate-600 text-sm mb-6 flex-1 line-clamp-3">{area.description}</p>
            
            <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
              <button 
                onClick={() => handleEdit(area)}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Edit Area"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDelete(area.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Area"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {areas.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-200">
            No thematic areas found. Add one to get started.
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Thematic Area"
        message="Are you sure you want to delete this thematic area? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}
