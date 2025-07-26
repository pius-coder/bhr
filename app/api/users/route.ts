/**
 * 🚀 API Route: /api/users
 * Exemple de route API avec file-based routing BHR
 */

import { Hono } from 'hono';

const app = new Hono();

// 📊 Données d'exemple
const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' },
  { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'user' }
];

// 🎯 GET /api/users - Récupérer tous les utilisateurs
export const GET = (c: any) => {
  const start = Date.now();
  
  try {
    const response = {
      success: true,
      data: users,
      count: users.length,
      timestamp: new Date().toISOString(),
      framework: 'BHR',
      route: '/api/users'
    };
    
    const duration = Date.now() - start;
    
    // Headers de performance
    c.res.headers.set('X-Response-Time', `${duration}ms`);
    c.res.headers.set('X-Powered-By', 'BHR-Framework');
    c.res.headers.set('Cache-Control', 'public, max-age=300');
    
    return c.json(response, { status: 200 });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};

// 🎯 POST /api/users - Créer un nouvel utilisateur
export const POST = async (c: any) => {
  const start = Date.now();
  
  try {
    const body = await c.req.json();
    
    // Validation simple
    if (!body.name || !body.email) {
      return c.json({
        success: false,
        error: 'Name and email are required',
        required_fields: ['name', 'email']
      }, { status: 400 });
    }
    
    // Créer le nouvel utilisateur
    const newUser = {
      id: users.length + 1,
      name: body.name,
      email: body.email,
      role: body.role || 'user',
      created_at: new Date().toISOString()
    };
    
    users.push(newUser);
    
    const duration = Date.now() - start;
    
    // Headers de performance
    c.res.headers.set('X-Response-Time', `${duration}ms`);
    c.res.headers.set('X-Powered-By', 'BHR-Framework');
    
    return c.json({
      success: true,
      message: 'User created successfully',
      data: newUser,
      framework: 'BHR',
      route: '/api/users'
    }, { status: 201 });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to create user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};

// 🎯 PUT /api/users - Mettre à jour tous les utilisateurs (exemple)
export const PUT = async (c: any) => {
  const start = Date.now();
  
  try {
    const body = await c.req.json();
    
    if (!body.action) {
      return c.json({
        success: false,
        error: 'Action is required',
        available_actions: ['reset', 'bulk_update']
      }, { status: 400 });
    }
    
    let result;
    
    switch (body.action) {
      case 'reset':
        users.length = 0;
        users.push(
          { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' },
          { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user' }
        );
        result = { message: 'Users reset to default', count: users.length };
        break;
        
      default:
        return c.json({
          success: false,
          error: 'Invalid action',
          available_actions: ['reset', 'bulk_update']
        }, { status: 400 });
    }
    
    const duration = Date.now() - start;
    
    // Headers de performance
    c.res.headers.set('X-Response-Time', `${duration}ms`);
    c.res.headers.set('X-Powered-By', 'BHR-Framework');
    
    return c.json({
      success: true,
      ...result,
      framework: 'BHR',
      route: '/api/users'
    }, { status: 200 });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to update users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};

// 🎯 DELETE /api/users - Supprimer tous les utilisateurs
export const DELETE = (c: any) => {
  const start = Date.now();
  
  try {
    const deletedCount = users.length;
    users.length = 0; // Vider le tableau
    
    const duration = Date.now() - start;
    
    // Headers de performance
    c.res.headers.set('X-Response-Time', `${duration}ms`);
    c.res.headers.set('X-Powered-By', 'BHR-Framework');
    
    return c.json({
      success: true,
      message: 'All users deleted',
      deleted_count: deletedCount,
      framework: 'BHR',
      route: '/api/users'
    }, { status: 200 });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to delete users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
};

export default app;
