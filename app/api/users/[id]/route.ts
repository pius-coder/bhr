/**
 * 🚀 API Route: /api/users/[id]
 * Route dynamique avec paramètre ID
 * Exemple de file-based routing avec paramètres
 */

import { Hono } from 'hono';

const app = new Hono();

// 📊 Données d'exemple (en réalité, ça viendrait d'une DB)
const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin', created_at: '2024-01-01' },
  { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user', created_at: '2024-01-02' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'user', created_at: '2024-01-03' }
];

// 🎯 GET /api/users/[id] - Récupérer un utilisateur par ID
export const GET = (c: any) => {
  const start = Date.now();
  
  try {
    const id = parseInt(c.req.param('id'));
    
    if (isNaN(id)) {
      return c.json({
        success: false,
        error: 'Invalid user ID',
        message: 'ID must be a number',
        provided: c.req.param('id')
      }, { status: 400 });
    }
    
    const user = users.find(u => u.id === id);
    
    if (!user) {
      return c.json({
        success: false,
        error: 'User not found',
        message: `No user found with ID ${id}`,
        available_ids: users.map(u => u.id)
      }, { status: 404 });
    }
    
    const duration = Date.now() - start;
    
    // Headers de performance
    c.res.headers.set('X-Response-Time', `${duration}ms`);
    c.res.headers.set('X-Powered-By', 'BHR-Framework');
    c.res.headers.set('Cache-Control', 'public, max-age=300');
    
    return c.json({
      success: true,
      data: user,
      framework: 'BHR',
      route: `/api/users/${id}`,
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};

// 🎯 PUT /api/users/[id] - Mettre à jour un utilisateur
export const PUT = async (c: any) => {
  const start = Date.now();
  
  try {
    const id = parseInt(c.req.param('id'));
    
    if (isNaN(id)) {
      return c.json({
        success: false,
        error: 'Invalid user ID',
        message: 'ID must be a number'
      }, { status: 400 });
    }
    
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return c.json({
        success: false,
        error: 'User not found',
        message: `No user found with ID ${id}`
      }, { status: 404 });
    }
    
    const body = await c.req.json();
    
    // Mettre à jour les champs fournis
    const updatedUser = {
      ...users[userIndex],
      ...body,
      id, // Garder l'ID original
      updated_at: new Date().toISOString()
    };
    
    users[userIndex] = updatedUser;
    
    const duration = Date.now() - start;
    
    // Headers de performance
    c.res.headers.set('X-Response-Time', `${duration}ms`);
    c.res.headers.set('X-Powered-By', 'BHR-Framework');
    
    return c.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
      framework: 'BHR',
      route: `/api/users/${id}`
    }, { status: 200 });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to update user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};

// 🎯 DELETE /api/users/[id] - Supprimer un utilisateur
export const DELETE = (c: any) => {
  const start = Date.now();
  
  try {
    const id = parseInt(c.req.param('id'));
    
    if (isNaN(id)) {
      return c.json({
        success: false,
        error: 'Invalid user ID',
        message: 'ID must be a number'
      }, { status: 400 });
    }
    
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return c.json({
        success: false,
        error: 'User not found',
        message: `No user found with ID ${id}`
      }, { status: 404 });
    }
    
    const deletedUser = users.splice(userIndex, 1)[0];
    
    const duration = Date.now() - start;
    
    // Headers de performance
    c.res.headers.set('X-Response-Time', `${duration}ms`);
    c.res.headers.set('X-Powered-By', 'BHR-Framework');
    
    return c.json({
      success: true,
      message: 'User deleted successfully',
      deleted_user: deletedUser,
      remaining_count: users.length,
      framework: 'BHR',
      route: `/api/users/${id}`
    }, { status: 200 });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to delete user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};

// 🎯 PATCH /api/users/[id] - Mise à jour partielle
export const PATCH = async (c: any) => {
  const start = Date.now();
  
  try {
    const id = parseInt(c.req.param('id'));
    
    if (isNaN(id)) {
      return c.json({
        success: false,
        error: 'Invalid user ID'
      }, { status: 400 });
    }
    
    const userIndex = users.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return c.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }
    
    const body = await c.req.json();
    
    // Appliquer seulement les champs fournis
    Object.keys(body).forEach(key => {
      if (key !== 'id') { // Ne pas permettre de changer l'ID
        (users[userIndex] as any)[key] = body[key];
      }
    });
    
    users[userIndex].updated_at = new Date().toISOString();
    
    const duration = Date.now() - start;
    
    // Headers de performance
    c.res.headers.set('X-Response-Time', `${duration}ms`);
    c.res.headers.set('X-Powered-By', 'BHR-Framework');
    
    return c.json({
      success: true,
      message: 'User partially updated',
      data: users[userIndex],
      updated_fields: Object.keys(body),
      framework: 'BHR',
      route: `/api/users/${id}`
    }, { status: 200 });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to patch user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};

export default app;
