import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ArrowLeft, Clock, ChevronRight, Calendar, BookOpen, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

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

  // Group by problemTitle — ONLY include evaluated or failed attempts, skip in_progress/submitted/evaluating
  const grouped: Record<string, any[]> = {};
  for (const attempt of history) {
    if (attempt.status === 'in_progress' || attempt.status === 'submitted' || attempt.status === 'evaluating') {
      continue; // Skip incomplete / abandoned attempts
    }
    const key = attempt.problemTitle || 'Unknown Problem';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(attempt);
  }

  const keys = Object.keys(grouped);
  const totalAttempts = keys.reduce((sum, k) => sum + grouped[k].length, 0);

  return (
    <div className="container page">
      <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: 28 }}>
        <ArrowLeft size={16} /> Back to Problems
      </button>

      <div className="page-header">
        <h1 className="page-title">Attempt History</h1>
        <p className="page-subtitle">
          {totalAttempts > 0
            ? `${totalAttempts} evaluated attempt${totalAttempts !== 1 ? 's' : ''} across ${keys.length} problem${keys.length !== 1 ? 's' : ''}`
            : 'Track your design iteration progress across all attempted problems.'}
        </p>
      </div>

      {keys.length === 0 ? (
        <div className="empty">
          <Clock size={36} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <div className="empty-title">No completed attempts yet</div>
          <p style={{ marginTop: 6, fontSize: 14, lineHeight: 1.6 }}>
            Choose a problem, fill in your design across all four fields, and submit for evaluation.
            Only completed evaluations will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {keys.map((problemTitle) => {
            const attempts = grouped[problemTitle];
            const evaluatedCount = attempts.filter(a => a.status === 'evaluated').length;
            return (
              <div key={problemTitle} className="history-group">
                <div className="history-group-title">
                  <BookOpen size={18} style={{ color: 'var(--accent)' }} />
                  <span>{problemTitle}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '2px 10px', borderRadius: 9999 }}>
                    {evaluatedCount} evaluated
                  </span>
                </div>
                <div className="history-timeline">
                  {attempts.map((attempt: any, i: number) => {
                    const isEvaluated = attempt.status === 'evaluated';
                    const isFailed = attempt.status === 'failed';
                    return (
                      <div
                        key={attempt.id}
                        className="history-item"
                        onClick={() => isEvaluated && onSelectAttempt(attempt.id)}
                        style={{ cursor: isEvaluated ? 'pointer' : 'default' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div className={`history-status-icon ${isEvaluated ? 'history-status-ok' : 'history-status-fail'}`}>
                            {isEvaluated
                              ? <CheckCircle2 size={18} />
                              : isFailed
                                ? <XCircle size={18} />
                                : <AlertCircle size={18} />}
                          </div>
                          <div className="history-item-left">
                            <span className="history-item-attempt">Attempt #{i + 1}</span>
                            <span className="history-item-date" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Calendar size={12} />
                              {new Date(attempt.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {isEvaluated
                            ? <span className="badge badge-medium">Evaluated</span>
                            : isFailed
                              ? <span className="badge badge-hard">Failed</span>
                              : <span className="badge badge-easy">{attempt.status}</span>}
                          {isEvaluated && <ChevronRight size={18} style={{ color: 'var(--accent)' }} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
