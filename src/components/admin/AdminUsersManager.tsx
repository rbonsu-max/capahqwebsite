import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Trash2, Loader2, Shield } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function AdminUsersManager() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null
  });

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const data = await api.get('/admins');
        setAdmins(data.filter((a: any) => a.email !== 'youroger1@gmail.com'));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  const handleDelete = async (id: string) => {
    setConfirmModal({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!confirmModal.id) return;
    try {
      await api.delete(`/admins/${confirmModal.id}`);
      setAdmins(admins.filter(a => a.id !== confirmModal.id));
      setConfirmModal({ isOpen: false, id: null });
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert(error instanceof Error ? error.message : 'Failed to remove admin.');
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newEmail.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }

    setAdding(true);
    try {
      const email = newEmail.trim().toLowerCase();
      const res = await api.post('/admins', { email, password: 'password123' }); // Default password
      setAdmins([...admins, res]);
      setNewEmail('');
    } catch (error) {
      console.error('Error adding admin:', error);
      alert(error instanceof Error ? error.message : 'Failed to add admin.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Manage Admin Users</h2>
        <p className="text-slate-600">Add or remove users who can access the admin dashboard.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Add New Admin</h3>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter Google email address"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <button
            type="submit"
            disabled={adding}
            className="flex items-center justify-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {adding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Add Admin
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Added On</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {/* Hardcoded super admin */}
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-blue-600 mr-2" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900">youroger1@gmail.com</span>
                      <span className="sm:hidden mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 w-fit">Super Admin</span>
                    </div>
                    <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Super Admin</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden sm:table-cell">System Default</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <span className="text-slate-400 cursor-not-allowed">Cannot Remove</span>
                </td>
              </tr>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{admin.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden sm:table-cell">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(admin.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 inline" /> <span className="hidden sm:inline">Remove</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Remove Admin"
        message="Are you sure you want to remove this admin user? They will lose access to the admin dashboard."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
        confirmText="Remove"
        isDanger={true}
      />
    </div>
  );
}
