import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Edit, Trash2, Loader2, Save, X, ExternalLink } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function ProgramsManager() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProgram, setCurrentProgram] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const data = await api.get('/programs');
        setPrograms(data.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, [isEditing]);

  const handleDelete = async (id: string) => {
    setConfirmModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!confirmModal.id) return;
    try {
      await api.delete(`/programs/${confirmModal.id}`);
      setPrograms(programs.filter(p => p.id !== confirmModal.id));
      setConfirmModal({ isOpen: false, id: null });
    } catch (error) {
      console.error('Error deleting program:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete program.');
    }
  };

  const handleEdit = (program: any) => {
    setCurrentProgram(program);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentProgram({
      title: '',
      description: '',
      content: '',
      link: '',
      order_index: programs.length
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...currentProgram,
        updated_at: new Date().toISOString()
      };
      if (currentProgram.id) {
        await api.put(`/programs/${currentProgram.id}`, payload);
      } else {
        await api.post('/programs', payload);
      }
      setIsEditing(false);
      setCurrentProgram(null);
      // Refresh programs
      const data = await api.get('/programs');
      setPrograms(data.sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)));
    } catch (error) {
      console.error('Error saving program:', error);
      alert(error instanceof Error ? error.message : 'Failed to save program.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            {currentProgram?.id ? 'Edit Program' : 'Add New Program'}
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Program Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={currentProgram?.title || ''}
                onChange={e => setCurrentProgram({...currentProgram, title: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Short Description</label>
              <input
                type="text"
                value={currentProgram?.description || ''}
                onChange={e => setCurrentProgram({...currentProgram, description: e.target.value})}
                placeholder="A brief summary of the program"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">External Link (Optional)</label>
              <div className="relative">
                <input
                  type="url"
                  value={currentProgram?.link || ''}
                  onChange={e => setCurrentProgram({...currentProgram, link: e.target.value})}
                  placeholder="https://example.com"
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
                <ExternalLink className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Display Order</label>
              <input
                type="number"
                value={currentProgram?.order_index || 0}
                onChange={e => setCurrentProgram({...currentProgram, order_index: parseInt(e.target.value) || 0})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Detailed Content</label>
            <textarea
              rows={8}
              value={currentProgram?.content || ''}
              onChange={e => setCurrentProgram({...currentProgram, content: e.target.value})}
              placeholder="Full details about the program..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
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
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Program
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Programs Manager</h2>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Program
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-semibold text-slate-900">Title</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-900">Description</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-900">Order</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {programs.map((program) => (
                <tr key={program.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{program.title}</div>
                    {program.link && (
                      <div className="text-xs text-blue-600 flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        {new URL(program.link).hostname}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{program.description}</td>
                  <td className="px-6 py-4 text-slate-600">{program.order_index}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(program)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(program.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {programs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No programs found. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Program"
        message="Are you sure you want to delete this program? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}
