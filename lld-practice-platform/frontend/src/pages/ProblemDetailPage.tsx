import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ArrowLeft, CheckCircle2, ShieldCheck, Layers, Play, AlertCircle } from 'lucide-react';

interface Props {
  slug: string;
  onStart: (attemptId: string) => void;
  onBack: () => void;
}

export function ProblemDetailPage({ slug, onStart, onBack }: Props) {
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    api.getProblem(slug).then(setProblem).finally(() => setLoading(false));
  }, [slug]);

  async function handleStart() {
    if (!problem) return;
    setStarting(true);
    try {
      const attempt = await api.startAttempt(problem.id);
      onStart(attempt.id);
    } catch (e: any) {
      alert(e.message);
      setStarting(false);
    }
  }

  if (loading) return (
    <div className="container page">
      <div className="loading">
        <div className="loading-spinner"></div>
        <span>Loading problem specification...</span>
      </div>
    </div>
  );

  if (!problem) return (
    <div className="container page">
      <div className="empty">
        <AlertCircle size={36} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
        <div className="empty-title">Problem not found</div>
      </div>
    </div>
  );

  return (
    <div className="container page">
      <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: 28 }}>
        <ArrowLeft size={16} /> Back to Problems
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
        <h1 className="page-title" style={{ margin: 0 }}>{problem.title}</h1>
        <span className={`badge badge-${problem.difficulty}`}>{problem.difficulty}</span>
      </div>

      <div className="problem-detail">
        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.75, marginBottom: 32 }}>
          {problem.statement}
        </p>

        <div className="section">
          <div className="section-title">
            <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} /> Functional Requirements
          </div>
          <ul className="requirements-list">
            {problem.functionalRequirements?.map((r: string, i: number) => (
              <li key={i}>
                <span className="req-icon"><CheckCircle2 size={16} /></span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {problem.nonFunctionalRequirements?.length > 0 && (
          <div className="section">
            <div className="section-title">
              <ShieldCheck size={16} style={{ color: 'var(--accent)' }} /> Design Constraints & Quality
            </div>
            <ul className="requirements-list">
              {problem.nonFunctionalRequirements.map((r: string, i: number) => (
                <li key={i}>
                  <span className="req-icon"><ShieldCheck size={16} /></span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {problem.rubric?.dimensions?.length > 0 && (
          <div className="section" style={{ marginBottom: 0 }}>
            <div className="section-title">
              <Layers size={16} style={{ color: 'var(--accent)' }} /> Evaluation Criteria
            </div>
            <ul className="requirements-list">
              {problem.rubric.dimensions.map((d: any, i: number) => (
                <li key={i}>
                  <span className="req-icon"><Layers size={16} /></span>
                  <span>
                    <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{d.name}:</strong> {d.description}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <button className="btn btn-primary" onClick={handleStart} disabled={starting} style={{ padding: '14px 28px', fontSize: 15 }}>
          <Play size={18} fill="currentColor" /> {starting ? 'Starting Workspace...' : 'Start Attempt Workspace'}
        </button>
      </div>
    </div>
  );
}
