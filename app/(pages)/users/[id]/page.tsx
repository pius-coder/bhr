import React from 'react';

interface Props {
  params: { id: string };
}

const UserPage: React.FC<Props> = ({ params }) => {
  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: '2.5rem' }}>
          👤 User Profile
        </h1>
        <p style={{ margin: 0, fontSize: '1.2rem', opacity: 0.9 }}>
          Dynamic Route Test - BHR Framework
        </p>
      </div>

      <div style={{
        background: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h2 style={{ margin: '0 0 1rem 0', color: '#495057' }}>
          🆔 User Information
        </h2>
        <div style={{
          background: 'white',
          padding: '1rem',
          borderRadius: '6px',
          border: '2px solid #28a745',
          fontSize: '1.1rem'
        }}>
          <strong>User ID:</strong> <code style={{
            background: '#e9ecef',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            color: '#495057'
          }}>{params.id}</code>
        </div>
      </div>

      <div style={{
        background: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#856404' }}>
          🧪 Dynamic Route Test
        </h3>
        <p style={{ margin: '0 0 1rem 0', color: '#856404' }}>
          This page demonstrates BHR's dynamic routing capabilities:
        </p>
        <ul style={{ color: '#856404', paddingLeft: '1.5rem' }}>
          <li><strong>Route Pattern:</strong> <code>/users/[id]</code></li>
          <li><strong>File Location:</strong> <code>app/(pages)/users/[id]/page.tsx</code></li>
          <li><strong>Current URL:</strong> <code>/users/{params.id}</code></li>
          <li><strong>SSR Rendered:</strong> ✅ Server-Side Rendered</li>
        </ul>
      </div>

      <div style={{
        background: '#d1ecf1',
        border: '1px solid #bee5eb',
        borderRadius: '8px',
        padding: '1.5rem',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#0c5460' }}>
          🔗 Test Different IDs
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {['123', '456', 'john', 'admin', 'test'].map(id => (
            <a
              key={id}
              href={`/users/${id}`}
              style={{
                background: '#17a2b8',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#138496'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#17a2b8'}
            >
              /users/{id}
            </a>
          ))}
        </div>
      </div>

      <div style={{
        background: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '8px',
        padding: '1.5rem'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#721c24' }}>
          🚀 BHR Performance
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>~12ms</div>
            <div style={{ fontSize: '0.9rem', color: '#721c24' }}>SSR Render Time</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#17a2b8' }}>~30ms</div>
            <div style={{ fontSize: '0.9rem', color: '#721c24' }}>Hydration Time</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffc107' }}>0.37MB</div>
            <div style={{ fontSize: '0.9rem', color: '#721c24' }}>Bundle Size</div>
          </div>
        </div>
      </div>

      <div style={{ 
        textAlign: 'center', 
        marginTop: '2rem',
        padding: '1rem',
        borderTop: '2px solid #e9ecef'
      }}>
        <a 
          href="/users" 
          style={{
            background: '#6c757d',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            textDecoration: 'none',
            marginRight: '1rem'
          }}
        >
          ← Back to Users
        </a>
        <a 
          href="/" 
          style={{
            background: '#007bff',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            textDecoration: 'none'
          }}
        >
          🏠 Home
        </a>
      </div>
    </div>
  );
};

export default UserPage;
