import { Layers, ChevronRight, Code2, Sparkles, BarChart3, GitBranch } from 'lucide-react';

interface Props {
  onGetStarted: () => void;
}

const features = [
  {
    icon: <GitBranch size={22} />,
    title: 'Visual Mermaid Diagrams',
    desc: 'Draw your class architecture in real-time with live diagram rendering. See relationships, methods, and structure come to life as you type.',
  },
  {
    icon: <Code2 size={22} />,
    title: 'Structured Design Submissions',
    desc: 'Go beyond code — capture class diagrams, method signatures, responsibility reasoning, and explicit trade-offs in one structured workspace.',
  },
  {
    icon: <Sparkles size={22} />,
    title: 'Dual-Layer Evaluation',
    desc: 'Get instant automated checks for expected classes and patterns, plus optional AI-powered deep design review from Gemini.',
  },
  {
    icon: <BarChart3 size={22} />,
    title: 'Progress Tracking',
    desc: 'Review every past attempt, see how your design improved across iterations, and track improvements against your previous submissions.',
  },
];

const problems = [
  { title: 'Parking Lot System', difficulty: 'medium', tags: ['Strategy', 'Singleton'] },
  { title: 'Elevator System', difficulty: 'hard', tags: ['State', 'Observer'] },
  { title: 'Vending Machine', difficulty: 'easy', tags: ['State Pattern'] },
  { title: 'Library Management', difficulty: 'easy', tags: ['Repository', 'Factory'] },
  { title: 'Movie Ticket Booking', difficulty: 'medium', tags: ['Strategy', 'Concurrency'] },
];

export function LandingPage({ onGetStarted }: Props) {
  return (
    <div className="landing">
      {/* ── Navbar ── */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <div className="nav-brand">
            <div className="brand-icon">
              <Layers size={18} strokeWidth={2.5} />
            </div>
            <span>LLD Studio</span>
          </div>
          <button className="btn btn-primary" onClick={onGetStarted} style={{ padding: '10px 22px', fontSize: 14 }}>
            Start Practicing
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-badge">
          <Sparkles size={13} /> Real-world LLD Practice Platform
        </div>
        <h1 className="hero-title">
          Master Low Level<br />System Design
        </h1>
        <p className="hero-subtitle">
          Design class architectures visually, get evaluated on your OOP principles,
          trade-offs, and design patterns — with instant AI-powered feedback.
        </p>
        <div className="hero-cta">
          <button className="btn btn-primary btn-hero" onClick={onGetStarted}>
            Start Designing <ChevronRight size={18} />
          </button>
          <span className="hero-cta-note">5 curated LLD problems — no signup required</span>
        </div>

        {/* Diagram Preview Card */}
        <div className="hero-preview">
          <div className="hero-preview-bar">
            <span className="hero-preview-dot" style={{ background: '#f87171' }} />
            <span className="hero-preview-dot" style={{ background: '#fbbf24' }} />
            <span className="hero-preview-dot" style={{ background: '#4ade80' }} />
            <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              classDiagram
            </span>
          </div>
          <div className="hero-preview-body">
            <pre className="hero-code">{`classDiagram
  ParkingLot *-- ParkingFloor
  ParkingFloor *-- ParkingSpot
  ParkingSpot --> Vehicle
  ParkingLot --> PricingStrategy
  Ticket --> Vehicle
  PricingStrategy <|.. HourlyPricing
  ParkingLot : +assignSpot(v) Ticket
  ParkingSpot : +allocate(v)`}</pre>
            <div className="hero-preview-arrow">
              <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className="hero-diagram-mock">
              <div className="mock-class">
                <div className="mock-class-name">ParkingLot</div>
                <div className="mock-class-method">+assignSpot(v) Ticket</div>
              </div>
              <div className="mock-arrow">→</div>
              <div className="mock-class">
                <div className="mock-class-name">ParkingSpot</div>
                <div className="mock-class-method">+allocate(v)</div>
              </div>
              <div className="mock-arrow">→</div>
              <div className="mock-class">
                <div className="mock-class-name">Vehicle</div>
                <div className="mock-class-method">type: VehicleType</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="landing-section">
        <div className="landing-container">
          <div className="section-label">Why LLD Studio</div>
          <h2 className="landing-section-title">Everything you need to ace LLD interviews</h2>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problems ── */}
      <section className="landing-section landing-section-alt">
        <div className="landing-container">
          <div className="section-label">Problem Library</div>
          <h2 className="landing-section-title">5 curated real-world design problems</h2>
          <div className="problems-preview-list">
            {problems.map((p, i) => (
              <div key={i} className="problems-preview-item" onClick={onGetStarted}>
                <div>
                  <span className="problems-preview-title">{p.title}</span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                    {p.tags.map(t => (
                      <span key={t} className="tag">{t}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={`badge badge-${p.difficulty}`}>{p.difficulty}</span>
                  <ChevronRight size={18} style={{ color: 'var(--accent)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="landing-cta-section">
        <div className="landing-container" style={{ textAlign: 'center' }}>
          <h2 className="landing-cta-title">Ready to level up your LLD skills?</h2>
          <p className="landing-cta-sub">Pick any problem, design your system, get evaluated — all in your browser.</p>
          <button className="btn btn-primary btn-hero" onClick={onGetStarted}>
            View All Problems <ChevronRight size={18} />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="nav-brand">
            <div className="brand-icon" style={{ width: 26, height: 26 }}>
              <Layers size={14} strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 14 }}>LLD Studio</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
            Low Level System Design Practice & Evaluation Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
