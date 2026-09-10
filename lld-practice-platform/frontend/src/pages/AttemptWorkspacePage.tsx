import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { MermaidLivePreview } from '../components/MermaidLivePreview';
import { ArrowLeft, Code2, FileText, Scale, Send, AlertTriangle, Loader2, Layers } from 'lucide-react';

interface Props {
  attemptId: string;
  problemSlug: string;
  onDone: (attemptId: string) => void;
  onBack: () => void;
}

export function AttemptWorkspacePage({ attemptId, problemSlug, onDone, onBack }: Props) {
  const [problem, setProblem] = useState<any>(null);
  const [form, setForm] = useState({
    classDiagram: '',
    methodSignatures: '',
    responsibilities: '',
    tradeoffs: '',
    rawText: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState('in_progress');
  const [error, setError] = useState('');

  useEffect(() => {
    api.getProblem(problemSlug).then(setProblem);
  }, [problemSlug]);

  // Poll status when submitted
  useEffect(() => {
    if (!submitted) return;
    const interval = setInterval(async () => {
      try {
        const s = await api.getAttemptStatus(attemptId);
        setStatus(s.status);
        if (s.status === 'evaluated' || s.status === 'failed') {
          clearInterval(interval);
          if (s.status === 'evaluated') onDone(attemptId);
        }
      } catch { clearInterval(interval); }
    }, 2000);
    return () => clearInterval(interval);
  }, [submitted, attemptId, onDone]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.classDiagram.trim() || !form.methodSignatures.trim() || !form.responsibilities.trim() || !form.tradeoffs.trim()) {
      setError('All fields (Class Diagram, Method Signatures, Responsibilities, and Trade-offs) are required.');
      return;
    }
    if (form.tradeoffs.trim().length < 20) {
      setError('Trade-off explanation must be at least 20 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await api.submitAttempt(attemptId, form);
      setSubmitted(true);
      setStatus('evaluating');
    } catch (e: any) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="container page">
        <div className="status-bar">
          <span className={`status-dot ${status === 'evaluating' ? 'status-dot-evaluating' : status === 'evaluated' ? 'status-dot-done' : 'status-dot-failed'}`} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {status === 'evaluating' && <Loader2 size={18} className="loading-spinner" style={{ animation: 'spin 1s linear infinite' }} />}
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
              {status === 'evaluating' ? 'Evaluating your design solution — analyzing Mermaid diagram & trade-offs...' : status === 'evaluated' ? 'Evaluation complete. Redirecting to feedback...' : 'Evaluation failed.'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const exampleDiagram = problem?.rubric?.exampleClassDiagram || `classDiagram\n  ParkingLot --> ParkingSpot\n  ParkingSpot --> Vehicle\n  ParkingSpot : +allocate(Vehicle)\n  ParkingSpot : +release()`;

  return (
    <div className="container page">
      <button className="btn btn-ghost" onClick={onBack} style={{ marginBottom: 24 }}>
        <ArrowLeft size={16} /> Back to Problem
      </button>

      <div className="page-header">
        <h1 className="page-title">{problem?.title ?? 'Attempt Workspace'}</h1>
        <p className="page-subtitle">Design your low-level architecture using Mermaid syntax with live visual preview.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Section 1: Mermaid Class Diagram + Live Preview Panel */}
        <div className="form-group">
          <label className="form-label">
            <Layers size={16} style={{ color: 'var(--accent)' }} /> 1. Visual Class Diagram (Mermaid Syntax)
          </label>
          <div className="diagram-workspace-grid">
            <div className="diagram-editor-col">
              <textarea
                className="form-textarea form-textarea-mono"
                rows={11}
                placeholder={exampleDiagram}
                value={form.classDiagram}
                onChange={(e) => setForm({ ...form, classDiagram: e.target.value })}
              />
              <p className="form-hint">Type Mermaid <code>classDiagram</code> syntax. (Arrow <code>--&gt;</code> indicates association/dependency).</p>
            </div>
            <div className="diagram-preview-col">
              <MermaidLivePreview chart={form.classDiagram || exampleDiagram} />
            </div>
          </div>
        </div>

        {/* Section 2: Method Signatures */}
        <div className="form-group">
          <label className="form-label">
            <Code2 size={16} style={{ color: 'var(--accent)' }} /> 2. Key Method Signatures & Fields
          </label>
          <textarea
            className="form-textarea form-textarea-mono"
            rows={5}
            placeholder={"class ParkingSpot {\n  spotId: string;\n  isOccupied: boolean;\n  allocate(v: Vehicle): boolean;\n  release(): void;\n}"}
            value={form.methodSignatures}
            onChange={(e) => setForm({ ...form, methodSignatures: e.target.value })}
          />
          <p className="form-hint">Text or pseudocode of key method signatures and attributes per class.</p>
        </div>

        {/* Section 3: Responsibility Breakdown */}
        <div className="form-group">
          <label className="form-label">
            <FileText size={16} style={{ color: 'var(--accent)' }} /> 3. Responsibility Breakdown & Reasoning
          </label>
          <textarea
            className="form-textarea"
            rows={4}
            placeholder="Explain why you assigned responsibilities the way you did. Why is pricing calculation separate from spot allocation?"
            value={form.responsibilities}
            onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
          />
          <p className="form-hint">Focus on Single Responsibility, Encapsulation, and separation of concerns.</p>
        </div>

        {/* Section 4: Trade-offs */}
        <div className="form-group">
          <label className="form-label">
            <Scale size={16} style={{ color: 'var(--accent)' }} /> 4. Architectural Trade-offs & Decisions
          </label>
          <textarea
            className="form-textarea"
            rows={4}
            placeholder="What explicit trade-offs did you make? (e.g. 'I chose Strategy pattern for pricing to allow dynamic algorithms, but it adds extra interface classes.')"
            value={form.tradeoffs}
            onChange={(e) => setForm({ ...form, tradeoffs: e.target.value })}
          />
          <p className="form-hint">Required (minimum 20 characters). State what you compromised on and why.</p>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius)', padding: '14px 18px', marginBottom: 24, fontSize: 14, fontWeight: 600, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ padding: '14px 28px', fontSize: 15 }}>
          {submitting ? (
            <>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Submitting Solution...
            </>
          ) : (
            <>
              <Send size={18} /> Submit Solution for Evaluation
            </>
          )}
        </button>
      </form>
    </div>
  );
}
