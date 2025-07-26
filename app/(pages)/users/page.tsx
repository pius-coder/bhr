/**
 * 🚀 Page: /users
 * Exemple de page avec file-based routing BHR
 * Affiche la liste des utilisateurs avec appels API
 */

import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse {
  success: boolean;
  data?: User[];
  count?: number;
  error?: string;
  message?: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'user' });
  const [creating, setCreating] = useState(false);

  // 📊 Charger les utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      const data: ApiResponse = await response.json();
      
      if (data.success && data.data) {
        setUsers(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Network error while fetching users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Créer un nouvel utilisateur
  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.name || !newUser.email) {
      alert('Name and email are required');
      return;
    }
    
    try {
      setCreating(true);
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setNewUser({ name: '', email: '', role: 'user' });
        await fetchUsers(); // Recharger la liste
        alert('User created successfully!');
      } else {
        alert(data.error || 'Failed to create user');
      }
    } catch (err) {
      alert('Network error while creating user');
      console.error('Error creating user:', err);
    } finally {
      setCreating(false);
    }
  };

  // 🗑️ Supprimer un utilisateur
  const deleteUser = async (id: number) => {
    if (!confirm(`Are you sure you want to delete user ${id}?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchUsers(); // Recharger la liste
        alert('User deleted successfully!');
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      alert('Network error while deleting user');
      console.error('Error deleting user:', err);
    }
  };

  // 🔄 Charger les utilisateurs au montage
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container">
      <h1>🚀 BHR Users Management</h1>
      <p>Exemple de page avec file-based routing et API calls</p>
      
      {/* 📊 Statistiques */}
      <div style={{ 
        background: '#f0f8ff', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        border: '1px solid #e0e0e0'
      }}>
        <h3>📈 Statistics</h3>
        <p><strong>Total Users:</strong> {users.length}</p>
        <p><strong>Admins:</strong> {users.filter(u => u.role === 'admin').length}</p>
        <p><strong>Regular Users:</strong> {users.filter(u => u.role === 'user').length}</p>
      </div>

      {/* 🎯 Formulaire de création */}
      <div style={{ 
        background: '#f9f9f9', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h3>➕ Add New User</h3>
        <form onSubmit={createUser} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            disabled={creating}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: creating ? 'not-allowed' : 'pointer'
            }}
          >
            {creating ? '⏳ Creating...' : '➕ Add User'}
          </button>
        </form>
      </div>

      {/* 🔄 Actions */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={fetchUsers}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {loading ? '⏳ Loading...' : '🔄 Refresh'}
        </button>
        
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🏠 Back to Home
        </button>
      </div>

      {/* ❌ Affichage des erreurs */}
      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '15px', 
          borderRadius: '4px', 
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {/* 📋 Liste des utilisateurs */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading">⏳ Loading users...</div>
        </div>
      ) : (
        <div>
          <h3>👥 Users List ({users.length})</h3>
          {users.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
              No users found. Create your first user above! 👆
            </p>
          ) : (
            <div style={{ 
              display: 'grid', 
              gap: '15px', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' 
            }}>
              {users.map((user) => (
                <div
                  key={user.id}
                  style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>
                        {user.role === 'admin' ? '👑' : '👤'} {user.name}
                      </h4>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        📧 {user.email}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        🏷️ <span style={{ 
                          background: user.role === 'admin' ? '#ffd700' : '#e3f2fd',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {user.role.toUpperCase()}
                        </span>
                      </p>
                      <p style={{ margin: '5px 0', color: '#999', fontSize: '12px' }}>
                        🆔 ID: {user.id}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteUser(user.id)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      title={`Delete ${user.name}`}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🔗 Navigation */}
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        background: '#f8f9fa', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h4>🧭 Navigation</h4>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/" style={{ 
            padding: '8px 16px', 
            background: '#007bff', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '4px' 
          }}>
            🏠 Home
          </a>
          <a href="/about" style={{ 
            padding: '8px 16px', 
            background: '#6c757d', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '4px' 
          }}>
            ℹ️ About
          </a>
          <a href="/api/users" target="_blank" style={{ 
            padding: '8px 16px', 
            background: '#28a745', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '4px' 
          }}>
            🔗 API Endpoint
          </a>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
