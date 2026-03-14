import React, { useState, useEffect } from 'react';
import {
  FiUserPlus,
  FiEdit,
  FiTrash2,
  FiShield,
  FiCheck,
  FiX,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
} from 'react-icons/fi';
import {
  getAllAdmins,
  addAdmin,
  updateAdmin,
  deleteAdmin,
  toggleAdminStatus,
  updateAdminPermissions,
  PERMISSIONS,
  ADMIN_ROLES,
} from '../services/adminApi';

export function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [toast, setToast] = useState(null);

  // Add Admin Form
  const [addForm, setAddForm] = useState({
    email: '',
    username: '',
    fullName: '',
    role: 'admin',
    permissions: ['view_reports', 'manage_reports'],
  });

  // Edit Admin Form
  const [editForm, setEditForm] = useState({
    username: '',
    role: '',
    is_active: true,
  });

  // Permissions Form
  const [permissionsForm, setPermissionsForm] = useState([]);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const data = await getAllAdmins();
      setAdmins(data);
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      await addAdmin(addForm);
      showToast('Admin added successfully!');
      setShowAddModal(false);
      setAddForm({
        email: '',
        username: '',
        fullName: '',
        role: 'admin',
        permissions: ['view_reports', 'manage_reports'],
      });
      await loadAdmins();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleEditAdmin = async (e) => {
    e.preventDefault();
    try {
      await updateAdmin(selectedAdmin.id, editForm);
      showToast('Admin updated successfully!');
      setShowEditModal(false);
      setSelectedAdmin(null);
      await loadAdmins();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleDeleteAdmin = async (adminId, email) => {
    if (!confirm(`Are you sure you want to delete admin: ${email}?`)) return;

    try {
      await deleteAdmin(adminId);
      showToast('Admin deleted successfully!');
      await loadAdmins();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleToggleStatus = async (adminId, currentStatus) => {
    try {
      await toggleAdminStatus(adminId, !currentStatus);
      showToast(`Admin ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      await loadAdmins();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const handleUpdatePermissions = async (e) => {
    e.preventDefault();
    try {
      await updateAdminPermissions(selectedAdmin.id, permissionsForm);
      showToast('Permissions updated successfully!');
      setShowPermissionsModal(false);
      setSelectedAdmin(null);
      await loadAdmins();
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setEditForm({
      username: admin.username || '',
      role: admin.role,
      is_active: admin.is_active,
    });
    setShowEditModal(true);
  };

  const openPermissionsModal = (admin) => {
    setSelectedAdmin(admin);
    setPermissionsForm(admin.permissions || []);
    setShowPermissionsModal(true);
  };

  const togglePermission = (permission) => {
    setPermissionsForm(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const toggleAddFormPermission = (permission) => {
    setAddForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '15px 25px',
          borderRadius: '8px',
          background: toast.type === 'success' ? '#27ae60' : '#e74c3c',
          color: 'white',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          animation: 'slideIn 0.3s ease',
        }}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#1a1a2e', fontSize: '28px' }}>Admin Management</h2>
          <p style={{ margin: '5px 0 0 0', color: '#666' }}>
            Manage admin users and their permissions
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={loadAdmins}
            disabled={loading}
            style={{
              padding: '12px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#95a5a6',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600',
            }}
          >
            <FiRefreshCw style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: '12px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#3498db',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600',
            }}
          >
            <FiUserPlus />
            Add Admin
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white',
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Admins</div>
          <div style={{ fontSize: '32px', fontWeight: '700', marginTop: '5px' }}>
            {admins.length}
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white',
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Active Admins</div>
          <div style={{ fontSize: '32px', fontWeight: '700', marginTop: '5px' }}>
            {admins.filter(a => a.is_active).length}
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white',
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Super Admins</div>
          <div style={{ fontSize: '32px', fontWeight: '700', marginTop: '5px' }}>
            {admins.filter(a => a.role === 'super_admin').length}
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
            Loading admins...
          </div>
        ) : admins.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
            No admins found. Add your first admin to get started.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>
                  Admin
                </th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>
                  Role
                </th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>
                  Permissions
                </th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>
                  Status
                </th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>
                  Created
                </th>
                <th style={{ padding: '15px', textAlign: 'center', fontWeight: '600', color: '#495057' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: '600', color: '#1a1a2e' }}>
                      {admin.username || 'N/A'}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', marginTop: '3px' }}>
                      {admin.email}
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      background: admin.role === 'super_admin' ? '#e74c3c20' : admin.role === 'admin' ? '#3498db20' : '#95a5a620',
                      color: admin.role === 'super_admin' ? '#e74c3c' : admin.role === 'admin' ? '#3498db' : '#95a5a6',
                    }}>
                      {admin.role === 'super_admin' ? 'Super Admin' :
                       admin.role === 'admin' ? 'Admin' :
                       admin.role === 'moderator' ? 'Moderator' : 'Viewer'}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {admin.permissions?.length || 0} permissions
                    </div>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <span style={{
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      background: admin.is_active ? '#27ae6020' : '#e74c3c20',
                      color: admin.is_active ? '#27ae60' : '#e74c3c',
                    }}>
                      {admin.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '15px', fontSize: '14px', color: '#666' }}>
                    {new Date(admin.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '15px' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => openEditModal(admin)}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#3498db20',
                          color: '#3498db',
                          cursor: 'pointer',
                        }}
                        title="Edit admin"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => openPermissionsModal(admin)}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#9b59b620',
                          color: '#9b59b6',
                          cursor: 'pointer',
                        }}
                        title="Manage permissions"
                      >
                        <FiShield size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(admin.id, admin.is_active)}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          border: 'none',
                          background: admin.is_active ? '#e74c3c20' : '#27ae6020',
                          color: admin.is_active ? '#e74c3c' : '#27ae60',
                          cursor: 'pointer',
                        }}
                        title={admin.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {admin.is_active ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                      <button
                        onClick={() => handleDeleteAdmin(admin.id, admin.email)}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          border: 'none',
                          background: '#e74c3c20',
                          color: '#e74c3c',
                          cursor: 'pointer',
                        }}
                        title="Delete admin"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            <h3 style={{ marginBottom: '20px', color: '#1a1a2e' }}>Add New Admin</h3>
            <form onSubmit={handleAddAdmin}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="admin@example.com"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '15px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Username
                </label>
                <input
                  type="text"
                  value={addForm.username}
                  onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
                  placeholder="Optional username"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '15px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={addForm.fullName}
                  onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                  placeholder="Optional full name"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '15px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Role *
                </label>
                <select
                  required
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '15px',
                  }}
                >
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="viewer">Viewer</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600' }}>
                  Permissions
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {Object.entries(PERMISSIONS).map(([key, value]) => (
                    <label key={value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={addForm.permissions.includes(value)}
                        onChange={() => toggleAddFormPermission(value)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px', color: '#333' }}>
                        {key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    background: 'white',
                    color: '#666',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#3498db',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Add Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '100%',
          }}>
            <h3 style={{ marginBottom: '20px', color: '#1a1a2e' }}>Edit Admin</h3>
            <form onSubmit={handleEditAdmin}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Email
                </label>
                <input
                  type="text"
                  value={selectedAdmin.email}
                  disabled
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '15px',
                    background: '#f5f5f5',
                    color: '#999',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Username
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  placeholder="Username"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '15px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '15px',
                  }}
                >
                  <option value="admin">Admin</option>
                  <option value="moderator">Moderator</option>
                  <option value="viewer">Viewer</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    background: 'white',
                    color: '#666',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#3498db',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && selectedAdmin && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
          }}>
            <h3 style={{ marginBottom: '20px', color: '#1a1a2e' }}>
              Manage Permissions: {selectedAdmin.email}
            </h3>
            <form onSubmit={handleUpdatePermissions}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {Object.entries(PERMISSIONS).map(([key, value]) => (
                    <label key={value} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      cursor: 'pointer',
                      background: permissionsForm.includes(value) ? '#3498db10' : 'white',
                    }}>
                      <input
                        type="checkbox"
                        checked={permissionsForm.includes(value)}
                        onChange={() => togglePermission(value)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px', color: '#333', fontWeight: '500' }}>
                        {key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '25px' }}>
                <button
                  type="button"
                  onClick={() => setShowPermissionsModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    background: 'white',
                    color: '#666',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#9b59b6',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Update Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
