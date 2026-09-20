import { Link } from "react-router-dom";
import "../App.css";

const features = [
  {
    title: "One clear next step",
    text: "No decision fatigue. Just today's task, waiting for you.",
  },
  {
    title: "Manageable tasks",
    text: "Big goals broken into steps small enough to actually finish.",
  },
  {
    title: "A way back, not a guilt trip",
    text: "Miss a week? Pick up exactly where you stopped — no backlog dumped on you.",
  },
  {
    title: "Reminders you control",
    text: "You decide when we reach out, and how often. Never more.",
  },
];

export default function Landing() {
  return (
    <div className="ss-landing">
      <header className="ss-landing__nav">
        <div className="ss-landing__nav-inner">
          <span className="ss-landing__brand">StudySteady</span>
          <div className="ss-landing__nav-actions">
            <Link to="/login" className="ss-auth-link">
              Log in
            </Link>
            <Link to="/signup" className="ss-btn-primary ss-btn-primary--compact">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <section className="ss-landing__hero">
        <div className="ss-landing__hero-inner">
          <p className="ss-landing__eyebrow">For learners who keep getting interrupted</p>
          <h1 className="ss-landing__title">Small steps. Steady progress.</h1>
          <p className="ss-landing__subtitle">
            StudySteady helps you plan realistically, know exactly what to do next, and get
            back on track — no matter how many times life gets in the way.
          </p>

          <div className="ss-landing__cta-row">
            <Link to="/signup" className="ss-btn-primary">
              Get started free
            </Link>
            <Link to="/login" className="ss-btn-secondary">
              Log in
            </Link>
          </div>

          <div className="ss-landing__hero-trail" aria-hidden="true">
            <span className="ss-trail__stone ss-trail__stone--done" />
            <span className="ss-trail__gap" />
            <span className="ss-trail__stone ss-trail__stone--done" />
            <span className="ss-trail__gap" />
            <span className="ss-trail__stone ss-trail__stone--done" />
            <span className="ss-trail__gap" />
            <span className="ss-trail__stone ss-trail__stone--today" />
            <span className="ss-trail__gap" />
            <span className="ss-trail__stone" />
            <span className="ss-trail__gap" />
            <span className="ss-trail__stone" />
          </div>
        </div>
      </section>

      <section className="ss-landing__stats">
        <div className="ss-landing__stats-inner">
          <div className="ss-landing__stat">
            <div className="ss-landing__stat-num">82%</div>
            <div className="ss-landing__stat-label">of learners struggle to stay consistent</div>
          </div>
          <div className="ss-landing__stat">
            <div className="ss-landing__stat-num">71%</div>
            <div className="ss-landing__stat-label">say seeing progress keeps them going</div>
          </div>
          <div className="ss-landing__stat">
            <div className="ss-landing__stat-num">67%</div>
            <div className="ss-landing__stat-label">just want to know what to do next</div>
          </div>
        </div>
      </section>

      <section className="ss-landing__features">
        <div className="ss-landing__features-inner">
          {features.map((f) => (
            <div key={f.title} className="ss-landing__feature-card">
              <span className="ss-landing__feature-dot" aria-hidden="true" />
              <h3 className="ss-landing__feature-title">{f.title}</h3>
              <p className="ss-landing__feature-text">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ss-landing__cta-banner">
        <div className="ss-landing__cta-banner-inner">
          <h2>Ready to stay on track?</h2>
          <p>Build consistency one small step at a time.</p>
          <Link to="/signup" className="ss-btn-primary">
            Create your account
          </Link>
        </div>
      </section>

      <footer className="ss-landing__footer">
        <span>StudySteady — Small steps. Steady progress.</span>
      </footer>
    </div>
  );
}
