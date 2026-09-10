import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ArrowLeft, Clock, CheckCircle2, XCircle, TrendingUp, TrendingDown, Sparkles, AlertCircle, Award } from 'lucide-react';

interface Props {
  attemptId: string;
  onBack: () => void;
  onHistory: () => void;
}

export function FeedbackPage({ attemptId, onBack, onHistory }: Props) {
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getFeedback(attemptId)
      .then(setFeedback)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [attemptId]);

  if (loading) return (
    <div className="container page">
      <div className="loading">
        <div className="loading-spinner"></div>
        <span>Generating evaluation report...</span>
      </div>
    </div>
  );

  if (error) return (
    <div className="container page">
      <div className="empty">
        <AlertCircle size={36} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
        <div className="empty-title">Error Loading Feedback</div>
        <p>{error}</p>
      </div>
    </div>
  );

  if (!feedback) return null;

  const signalClass = `signal-${feedback.overallSignal.replace('_', '-')}`;
  const signalLabel = feedback.overallSignal === 'needs_work' ? 'Needs Work' : feedback.overallSignal === 'solid' ? 'Solid' : 'Strong';

  return (
    <div className="container page">
      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <button className="btn btn-ghost" onClick={onBack}>
          <ArrowLeft size={16} /> Problems
        </button>
        <button className="btn btn-ghost" onClick={onHistory}>
          <Clock size={16} /> Attempt History
        </button>
      </div>

      {/* Overall Signal Card */}
      <div className="feedback-signal">
        <div className="feedback-signal-label">Evaluation Summary</div>
        <div className={`feedback-signal-value ${signalClass}`}>
          <Award size={36} />
          <span>{signalLabel}</span>
        </div>
      </div>

      {/* AI Unavailable notice */}
      {!feedback.llmAvailable && (
        <div className="ai-unavailable">
          <AlertCircle size={18} />
          <span>AI-based review is temporarily using fallback rules. Set GEMINI_API_KEY in backend .env for AI synthesis.</span>
        </div>
      )}

      {/* Summary */}
      {feedback.summary && (
        <div className="feedback-summary">
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} style={{ color: 'var(--accent)' }} /> Key Observations
          </p>
          {feedback.summary}
        </div>
      )}

      {/* Diff notes compared to previous attempt */}
      {feedback.comparedToPrevious && feedback.comparedToPrevious.length > 0 && (
        <div className="diff-section">
          <div className="diff-title">
            <TrendingUp size={16} /> Progress vs Previous Attempt
          </div>
          {feedback.comparedToPrevious.map((note: any, i: number) => (
            <div key={i} className={`diff-item diff-${note.type}`}>
              {note.type === 'improvement' ? (
                <TrendingUp size={18} className="diff-improvement" />
              ) : note.type === 'regression' ? (
                <TrendingDown size={18} className="diff-regression" />
              ) : (
                <Sparkles size={18} style={{ color: 'var(--accent)' }} />
              )}
              <span>{note.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Deterministic rule-based checks */}
      {feedback.deterministicResults?.length > 0 && (
        <div className="section">
          <div className="section-title">
            <CheckCircle2 size={16} style={{ color: 'var(--text-muted)' }} /> Automated Pattern Verification
          </div>
          <div className="checks-list">
            {feedback.deterministicResults.map((check: any, i: number) => (
              <div key={i} className="check-item">
                <div className={`check-icon-container ${check.passed ? 'check-pass-bg' : 'check-fail-bg'}`}>
                  {check.passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                </div>
                <div>
                  <div className="check-label">{check.label}</div>
                  {check.note && <div className="check-note">{check.note}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LLM dimension scores */}
      {feedback.llmResults?.length > 0 && (
        <div className="section">
          <div className="section-title">
            <Sparkles size={16} style={{ color: 'var(--accent)' }} /> Deep Design Review
          </div>
          <div className="dimension-list">
            {feedback.llmResults.map((dim: any, i: number) => (
              <div key={i} className="dimension-item">
                <div className="dimension-header">
                  <span className="dimension-name">{dim.dimension}</span>
                  <span className={`badge badge-${dim.signal === 'strong' ? 'easy' : dim.signal === 'acceptable' ? 'medium' : 'hard'}`}>
                    {dim.signal}
                  </span>
                </div>
                <p className="dimension-explanation">{dim.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
