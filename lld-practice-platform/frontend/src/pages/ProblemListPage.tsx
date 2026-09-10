import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ChevronRight, Sparkles, AlertCircle } from 'lucide-react';

interface Props {
  onSelect: (slug: string) => void;
}

export function ProblemListPage({ onSelect }: Props) {
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProblems().then(setProblems).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="container page">
      <div className="loading">
        <div className="loading-spinner"></div>
        <span>Loading design challenges...</span>
      </div>
    </div>
  );

  return (
    <div className="container page">
      <div className="page-header">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-dim)', color: 'var(--accent)', padding: '6px 12px', borderRadius: '9999px', fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
          <Sparkles size={14} /> Interactive LLD Platform
        </div>
        <h1 className="page-title">Low Level System Design Problems</h1>
        <p className="page-subtitle">Select a real-world design problem, structure your classes, and receive instant feedback on trade-offs and OOP principles.</p>
      </div>

      {problems.length === 0 ? (
        <div className="empty">
          <AlertCircle size={36} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <div className="empty-title">No problems found</div>
          <p>Run <code>npm run db:seed</code> in the backend directory to populate problems.</p>
        </div>
      ) : (
        <div className="problem-list">
          {problems.map((p) => (
            <div key={p.id} className="problem-card" onClick={() => onSelect(p.slug)}>
              <div>
                <div className="problem-card-title">{p.title}</div>
                <div className="problem-card-meta">
                  <span className={`badge badge-${p.difficulty}`}>{p.difficulty}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--accent)' }}>
                <ChevronRight size={20} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
