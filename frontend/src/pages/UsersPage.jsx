import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Shield, User, Mail, Search, ShieldAlert, X } from 'lucide-react';
import { userApi } from '../services/api';
import { useUIStore } from '../context/store';

// ═══════════════════════════════════════════════════════════════════════
// STYLE TOKENS (Local definition to match your architecture)
// ═══════════════════════════════════════════════════════════════════════
const STYLES = {
  PAGE_HEADER: "flex items-center justify-between mb-8",
  TITLE: "text-2xl font-bold text-surface-900 dark:text-surface-50",
  SUBTITLE: "text-surface-500 dark:text-surface-400 mt-1",
  
  CARD: "bg-white dark:bg-surface-800 rounded-xl shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden",
  
  TABLE_HEADER: "bg-surface-50 dark:bg-surface-900/50 border-b border-surface-200 dark:border-surface-700",
  TABLE_TH: "px-6 py-4 text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider",
  TABLE_ROW: "border-b border-surface-100 dark:border-surface-700/50 hover:bg-surface-50/50 dark:hover:bg-surface-700/30 transition-colors",
  TABLE_TD: "px-6 py-4 whitespace-nowrap text-sm text-surface-700 dark:text-surface-200",
  
  BUTTON_PRIMARY: "flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium",
  BUTTON_DANGER_ICON: "p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors",
  
  BADGE: {
    BASE: "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
    OWNER: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
    ADMIN: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    USER: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
  },

  INPUT: "w-full bg-white dark:bg-surface-900 border border-surface-300 dark:border-surface-600 rounded-lg px-4 py-2 text-surface-900 dark:text-surface-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all",
  LABEL: "block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1",
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { addNotification } = useUIStore();

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'USER'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getAll();
      setUsers(response.data);
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to load users', title: 'Error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await userApi.delete(id);
      addNotification({ type: 'success', message: 'User deleted successfully', title: 'Success' });
      loadUsers();
    } catch (error) {
      addNotification({ type: 'error', message: 'Failed to delete user', title: 'Error' });
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await userApi.create(formData);
      addNotification({ type: 'success', message: 'User created successfully', title: 'Success' });
      setShowCreateModal(false);
      setFormData({ username: '', email: '', password: '', role: 'USER' });
      loadUsers();
    } catch (error) {
      addNotification({ type: 'error', message: error.message || 'Failed to create user', title: 'Error' });
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'OWNER': return <span className={STYLES.BADGE.OWNER}><ShieldAlert className="w-3 h-3 mr-1" /> Owner</span>;
      case 'ADMIN': return <span className={STYLES.BADGE.ADMIN}><Shield className="w-3 h-3 mr-1" /> Admin</span>;
      default: return <span className={STYLES.BADGE.USER}><User className="w-3 h-3 mr-1" /> User</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className={STYLES.PAGE_HEADER}>
        <div>
          <h1 className={STYLES.TITLE}>Team Management</h1>
          <p className={STYLES.SUBTITLE}>Manage access and roles for your Yucast instance.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className={STYLES.BUTTON_PRIMARY}>
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Content */}
      <div className={STYLES.CARD}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
            <thead className={STYLES.TABLE_HEADER}>
              <tr>
                <th className={STYLES.TABLE_TH}>User</th>
                <th className={STYLES.TABLE_TH}>Role</th>
                <th className={STYLES.TABLE_TH}>Email</th>
                <th className={STYLES.TABLE_TH}>Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-surface-800 divide-y divide-surface-200 dark:divide-surface-700">
              {users.map((user) => (
                <tr key={user.id} className={STYLES.TABLE_ROW}>
                  <td className={STYLES.TABLE_TD}>
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold mr-3">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{user.username}</span>
                    </div>
                  </td>
                  <td className={STYLES.TABLE_TD}>
                    {getRoleBadge(user.role)}
                  </td>
                  <td className={STYLES.TABLE_TD}>
                    <div className="flex items-center text-surface-500 dark:text-surface-400">
                      <Mail className="w-4 h-4 mr-2" />
                      {user.email}
                    </div>
                  </td>
                  <td className={STYLES.TABLE_TD}>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.role !== 'OWNER' && (
                      <button onClick={() => handleDelete(user.id)} className={STYLES.BUTTON_DANGER_ICON}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-surface-500 dark:text-surface-400">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`${STYLES.CARD} w-full max-w-md p-6 animate-in fade-in zoom-in duration-200`}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-surface-900 dark:text-surface-100">Create New User</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-surface-500 hover:text-surface-700 dark:hover:text-surface-300">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className={STYLES.LABEL}>Username</label>
                <input
                  type="text"
                  required
                  className={STYLES.INPUT}
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
              
              <div>
                <label className={STYLES.LABEL}>Email</label>
                <input
                  type="email"
                  required
                  className={STYLES.INPUT}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <label className={STYLES.LABEL}>Password</label>
                <input
                  type="password"
                  required
                  className={STYLES.INPUT}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div>
                <label className={STYLES.LABEL}>Role</label>
                <select
                  className={STYLES.INPUT}
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="USER">User (Read-Only)</option>
                  <option value="ADMIN">Admin (Full Access)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className={STYLES.BUTTON_PRIMARY}>
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}