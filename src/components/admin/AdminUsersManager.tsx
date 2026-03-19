import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Trash2, Loader2, Shield, Key, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminUsersManager() {
  const { isSuperAdmin } = useAuth();
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('admin');
  const [adding, setAdding] = useState(false);
  const [resetting, setResetting] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null; type: 'delete' | 'reset' }>({
    isOpen: false,
    id: null,
    type: 'delete'
  });

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const data = await api.get('/admins');
        setAdmins(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  const handleDelete = async (id: string) => {
    setConfirmModal({ isOpen: true, id, type: 'delete' });
  };

  const handleReset = async (id: string) => {
    setConfirmModal({ isOpen: true, id, type: 'reset' });
  };

  const confirmAction = async () => {
    if (!confirmModal.id) return;
    
    if (confirmModal.type === 'delete') {
      try {
        await api.delete(`/admins/${confirmModal.id}`);
        setAdmins(admins.filter(a => a.id !== confirmModal.id));
        setConfirmModal({ ...confirmModal, isOpen: false });
      } catch (error) {
        console.error('Error deleting admin:', error);
        alert(error instanceof Error ? error.message : 'Failed to remove admin.');
      }
    } else if (confirmModal.type === 'reset') {
      try {
        setResetting(confirmModal.id);
        const newPassword = Math.random().toString(36).slice(-10);
        await api.post('/auth/reset-password', { userId: confirmModal.id, newPassword });
        alert(`Password reset successful. New temporary password: ${newPassword}\n\nThe user will be required to change it on their next login.`);
        setConfirmModal({ ...confirmModal, isOpen: false });
      } catch (error) {
        console.error('Error resetting password:', error);
        alert(error instanceof Error ? error.message : 'Failed to reset password.');
      } finally {
        setResetting(null);
      }
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
      const res = await api.post('/admins', { email, role: newRole });
      setAdmins([...admins, res]);
      setNewEmail('');
      alert(`Admin added successfully. Temporary password: ${res.password || 'Check with administrator'}\n\nPlease share this password with the user.`);
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
          <div className="flex-1 flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold mr-3">
                        {admin.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="text-sm font-medium text-slate-900">{admin.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      admin.role === 'super_admin' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                    {admin.mustChangePassword ? (
                      <span className="flex items-center text-amber-600 text-xs font-medium">
                        <AlertCircle className="w-3 h-3 mr-1" /> Pending Password Change
                      </span>
                    ) : (
                      <span className="flex items-center text-green-600 text-xs font-medium">
                        <CheckCircle className="w-3 h-3 mr-1" /> Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      {isSuperAdmin && admin.role !== 'super_admin' && (
                        <button
                          onClick={() => handleReset(admin.id)}
                          className="text-amber-600 hover:text-amber-900 transition-colors flex items-center"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4 mr-1" /> Reset
                        </button>
                      )}
                      {admin.email !== 'youroger1@gmail.com' && (
                        <button
                          onClick={() => handleDelete(admin.id)}
                          className="text-red-600 hover:text-red-900 transition-colors flex items-center"
                          title="Remove User"
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.type === 'delete' ? "Remove Admin" : "Reset Password"}
        message={confirmModal.type === 'delete' 
          ? "Are you sure you want to remove this admin user? They will lose access to the admin dashboard."
          : "Are you sure you want to reset this user's password? A new temporary password will be generated."
        }
        onConfirm={confirmAction}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        confirmText={confirmModal.type === 'delete' ? "Remove" : "Reset Password"}
        isDanger={confirmModal.type === 'delete'}
      />
    </div>
  );
}
