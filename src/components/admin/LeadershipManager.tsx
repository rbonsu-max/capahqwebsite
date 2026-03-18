import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Edit, Trash2, Loader2, Save, X, Image as ImageIcon } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function LeadershipManager() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentLeader, setCurrentLeader] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });
  const [uploading, setUploading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const data = await api.get('/leadership');
        setLeaders(data.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, [isEditing]);

  const handleDelete = async (id: string) => {
    setConfirmModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!confirmModal.id) return;
    try {
      await api.delete(`/leadership/${confirmModal.id}`);
      setLeaders(leaders.filter(l => l.id !== confirmModal.id));
      setConfirmModal({ isOpen: false, id: null });
    } catch (error) {
      console.error('Error deleting leader:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete leader.');
    }
  };

  const handleEdit = (leader: any) => {
    setCurrentLeader(leader);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentLeader({
      name: '',
      role: '',
      category: 'primate',
      bio: '',
      image_url: '',
      order_index: leaders.length
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const payload = {
        ...currentLeader,
        updated_at: new Date().toISOString()
      };
      if (currentLeader.id) {
        await api.put(`/leadership/${currentLeader.id}`, payload);
      } else {
        await api.post('/leadership', payload);
      }
      setIsEditing(false);
      setCurrentLeader(null);
      // Refresh leaders
      const data = await api.get('/leadership');
      setLeaders(data.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)));
    } catch (error) {
      console.error('Error saving leader:', error);
      alert(error instanceof Error ? error.message : 'Failed to save leader.');
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
      setCurrentLeader((prev: any) => ({
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

  const filteredLeaders = filterCategory === 'all' 
    ? leaders 
    : leaders.filter(l => l.category === filterCategory);

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            {currentLeader?.id ? 'Edit Leader' : 'Add New Leader'}
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={currentLeader?.name || ''}
                onChange={e => setCurrentLeader({...currentLeader, name: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                required
                value={currentLeader?.category || 'primate'}
                onChange={e => setCurrentLeader({...currentLeader, category: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="primate">Primate</option>
                <option value="standing_committee">Standing Committee Member</option>
                <option value="trustee">Trustee</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Role / Title</label>
              <input
                type="text"
                value={currentLeader?.role || ''}
                onChange={e => setCurrentLeader({...currentLeader, role: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Display Order</label>
              <input
                type="number"
                value={currentLeader?.order_index || 0}
                onChange={e => setCurrentLeader({...currentLeader, order_index: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Biography</label>
            <textarea
              rows={4}
              value={currentLeader?.bio || ''}
              onChange={e => setCurrentLeader({...currentLeader, bio: e.target.value})}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Profile Image</label>
            <div className="mt-1 flex items-center gap-4">
              {currentLeader?.image_url && (
                <img 
                  src={currentLeader.image_url} 
                  alt="Preview" 
                  className="h-20 w-20 object-cover rounded-lg border border-slate-200"
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
              disabled={uploading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Leader
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Leadership Directory</h2>
        
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
          >
            <option value="all">All Categories</option>
            <option value="primate">Primates</option>
            <option value="standing_committee">Standing Committee</option>
            <option value="trustee">Trustees</option>
          </select>

          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add Leader
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-semibold text-slate-900">Leader</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-900">Category</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-900">Role</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-900">Order</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLeaders.map((leader) => (
                <tr key={leader.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {leader.image_url ? (
                        <img 
                          src={leader.image_url} 
                          alt={leader.name} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                          <ImageIcon className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                      <div className="font-medium text-slate-900">{leader.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 capitalize">{leader.category.replace('_', ' ')}</td>
                  <td className="px-6 py-4 text-slate-600">{leader.role}</td>
                  <td className="px-6 py-4 text-slate-600">{leader.order_index}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(leader)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(leader.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLeaders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No leaders found. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Leader"
        message="Are you sure you want to delete this leader? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}
