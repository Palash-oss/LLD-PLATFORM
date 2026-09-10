import './styles/tokens.css';
import { useState } from 'react';
import { ProblemListPage } from './pages/ProblemListPage';
import { ProblemDetailPage } from './pages/ProblemDetailPage';
import { AttemptWorkspacePage } from './pages/AttemptWorkspacePage';
import { FeedbackPage } from './pages/FeedbackPage';
import { HistoryPage } from './pages/HistoryPage';
import { Layers, BookOpen, Clock } from 'lucide-react';

export type Route =
  | { name: 'problems' }
  | { name: 'problem'; slug: string }
  | { name: 'attempt'; attemptId: string; problemSlug: string }
  | { name: 'feedback'; attemptId: string }
  | { name: 'history' };

export default function App() {
  const [route, setRoute] = useState<Route>({ name: 'problems' });
  const go = (r: Route) => setRoute(r);

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-brand" style={{ cursor: 'pointer' }} onClick={() => go({ name: 'problems' })}>
            <div className="brand-icon">
              <Layers size={18} strokeWidth={2.5} />
            </div>
            <span>LLD Studio</span>
          </div>
          <div className="nav-links">
            <button 
              className={`nav-link ${route.name === 'problems' || route.name === 'problem' || route.name === 'attempt' ? 'active' : ''}`}
              onClick={() => go({ name: 'problems' })}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <BookOpen size={16} />
              <span>Problems</span>
            </button>
            <button 
              className={`nav-link ${route.name === 'history' ? 'active' : ''}`}
              onClick={() => go({ name: 'history' })}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Clock size={16} />
              <span>History</span>
            </button>
          </div>
        </div>
      </nav>

      {route.name === 'problems' && <ProblemListPage onSelect={(slug) => go({ name: 'problem', slug })} />}
      {route.name === 'problem' && (
        <ProblemDetailPage
          slug={route.slug}
          onStart={(attemptId) => go({ name: 'attempt', attemptId, problemSlug: route.slug })}
          onBack={() => go({ name: 'problems' })}
        />
      )}
      {route.name === 'attempt' && (
        <AttemptWorkspacePage
          attemptId={route.attemptId}
          problemSlug={route.problemSlug}
          onDone={(attemptId) => go({ name: 'feedback', attemptId })}
          onBack={() => go({ name: 'problem', slug: route.problemSlug })}
        />
      )}
      {route.name === 'feedback' && (
        <FeedbackPage
          attemptId={route.attemptId}
          onBack={() => go({ name: 'problems' })}
          onHistory={() => go({ name: 'history' })}
        />
      )}
      {route.name === 'history' && (
        <HistoryPage
          onSelectAttempt={(attemptId) => go({ name: 'feedback', attemptId })}
          onBack={() => go({ name: 'problems' })}
        />
      )}
    </>
  );
}
