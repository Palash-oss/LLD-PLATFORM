import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ArrowLeft, Clock, ChevronRight, Calendar, BookOpen } from 'lucide-react';

const DEMO_LEARNER = 'learner-demo-001';

interface Props {
  onSelectAttempt: (attemptId: string) => void;
  onBack: () => void;
}

export function HistoryPage({ onSelectAttempt, onBack }: Props) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getHistory(DEMO_LEARNER).then(setHistory).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="container page">
      <div className="loading">
        <div className="loading-spinner"></div>
        <span>Loading attempt history...</span>
      </div>
    </div>
  );

  // Group attempts by problemTitle
  const grouped: Record<string, any[]> = {};
  for (const attempt of history) {
    const key = attempt.problemTitle || 'Unknown Problem';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(attempt);
  }

  const keys = Object.keys(grouped);

  return (
    <div className="container page">
      <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: 28 }}>
        <ArrowLeft size={16} /> Back to Problems
      </button>

      <div className="page-header">
        <h1 className="page-title">Attempt History</h1>
        <p className="page-subtitle">Track your design iteration progress across all attempted problems.</p>
      </div>

      {keys.length === 0 ? (
        <div className="empty">
          <Clock size={36} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <div className="empty-title">No attempts recorded yet</div>
          <p>Choose a problem from the list and complete your first design workspace attempt.</p>
        </div>
      ) : (
        keys.map((problemTitle) => (
          <div key={problemTitle} className="history-group">
            <div className="history-group-title">
              <BookOpen size={18} style={{ color: 'var(--accent)' }} />
              <span>{problemTitle}</span>
            </div>
            <div className="history-timeline">
              {grouped[problemTitle].map((attempt: any, i: number) => {
                const isEvaluated = attempt.status === 'evaluated';
                return (
                  <div
                    key={attempt.id}
                    className={`history-item ${!isEvaluated ? 'disabled' : ''}`}
                    onClick={() => isEvaluated && onSelectAttempt(attempt.id)}
                    style={{ opacity: isEvaluated ? 1 : 0.6, cursor: isEvaluated ? 'pointer' : 'not-allowed' }}
                  >
                    <div className="history-item-left">
                      <span className="history-item-attempt">Attempt #{i + 1}</span>
                      <span className="history-item-date" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={13} />
                        {new Date(attempt.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span className={`badge badge-${isEvaluated ? 'medium' : attempt.status === 'failed' ? 'hard' : 'easy'}`}>
                        {attempt.status}
                      </span>
                      {isEvaluated && <ChevronRight size={18} style={{ color: 'var(--accent)' }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
