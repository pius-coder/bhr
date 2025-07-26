export default function AboutPage() {
  return (
    <div className="container">
      <h1>📖 À propos de BHR</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>🏗️ Architecture</h2>
        <p>BHR utilise une architecture unifiée moderne :</p>
        <ul>
          <li><strong>Bun</strong> - Runtime JavaScript ultra-rapide</li>
          <li><strong>Hono</strong> - Framework web léger et performant</li>
          <li><strong>React</strong> - Bibliothèque UI avec SSR</li>
        </ul>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>⚡ Avantages</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h3>🚀 Performance</h3>
            <ul>
              <li>Server-Side Rendering</li>
              <li>Hydratation rapide</li>
              <li>Un seul serveur</li>
              <li>Pas de CORS</li>
            </ul>
          </div>
          <div>
            <h3>🛠️ Développement</h3>
            <ul>
              <li>TypeScript natif</li>
              <li>Hot reload</li>
              <li>API routes intégrées</li>
              <li>Structure simple</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>📁 Structure du Projet</h2>
        <pre style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '4px',
          overflow: 'auto',
          fontSize: '14px'
        }}>
{`bhr/
├── app/
│   ├── api/           # Routes API
│   │   └── hello/
│   │       └── route.ts
│   ├── components/    # Composants React
│   ├── lib/          # Utilitaires
│   ├── page.tsx      # Page d'accueil
│   └── about/
│       └── page.tsx  # Cette page
├── src/
│   ├── server.ts     # Serveur Hono principal
│   └── client.tsx    # Entry point client
├── public/           # Assets statiques
└── package.json      # Configuration`}
        </pre>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>🔄 Comparaison avec BHVR</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Aspect</th>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>BHVR (Séparé)</th>
              <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>BHR (Unifié)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Serveurs</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>2 (Vite + Hono)</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>1 (Hono)</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Rendu</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Client-Side</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Server-Side</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Performance</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Bonne</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Excellente</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>SEO</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Limité</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Optimal</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <h2>🔗 Navigation</h2>
        <a 
          href="/" 
          style={{
            color: '#007acc',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          ← Retour à l'accueil
        </a>
      </div>
    </div>
  )
}
