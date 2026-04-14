import styles from "./page.module.css";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className={styles.landing}>
      {/* -------- NAVBAR -------- */}
      <nav className={styles.nav} id="navbar">
        <div className={styles["nav-brand"]}>
          <div className={styles["nav-brand-icon"]} />
          <span className={styles["nav-brand-name"]}>Beacon</span>
        </div>
        <ul className={styles["nav-links"]}>
          <li>
            <a href="#features">Features</a>
          </li>
          <li>
            <a href="#how-it-works">How It Works</a>
          </li>
          <li>
            <Link href="/dashboard" className={`btn btn-primary ${styles["nav-cta"]}`}>
              Launch Dashboard
            </Link>
          </li>
        </ul>
      </nav>

      {/* -------- HERO -------- */}
      <section className={styles.hero} id="hero">
        {/* Radar background animation */}
        <div className={styles["radar-container"]}>
          <div className={styles["radar-ring"]} />
          <div className={styles["radar-ring"]} />
          <div className={styles["radar-ring"]} />
          <div className={styles["radar-sweep"]} />
        </div>

        <div className={styles["hero-content"]}>
          <div className={styles["hero-badge"]}>
            <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'pulseDot 2s ease-in-out infinite' }} />
            Powered by Google AI
          </div>

          <h1>
            Intelligent Crisis Response{" "}
            <span className={styles["gradient-text"]}>
              in Real Time
            </span>
          </h1>

          <p className={styles["hero-subtitle"]}>
            Beacon instantly detects threats, bridges language barriers with
            AI translation, and synchronizes guests, staff &amp; first
            responders on a single command map — so no one is left in the
            dark.
          </p>

          <div className={styles["hero-actions"]}>
            <Link href="/dashboard" className="btn btn-primary">
              🛡️ Open Command Center
            </Link>
            <Link href="/sos" className="btn btn-critical">
              🚨 Guest SOS Portal
            </Link>
          </div>
        </div>
      </section>

      {/* -------- FEATURES -------- */}
      <section className={styles.features} id="features">
        <div className={styles["features-header"]}>
          <span className="label">Core Capabilities</span>
          <h2>Three Pillars of Protection</h2>
        </div>

        <div className={styles["features-grid"]}>
          {/* Card 1: AI Detection */}
          <div className={`glass ${styles["feature-card"]}`}>
            <div className={`${styles["feature-icon"]} ${styles["feature-icon-detect"]}`}>
              🔍
            </div>
            <h3>AI Threat Detection</h3>
            <p>
              Gemini 1.5 Pro continuously analyzes simulated surveillance
              feeds to automatically detect weapons, smoke, or crowd
              anomalies — triggering instant alerts without human
              intervention.
            </p>
          </div>

          {/* Card 2: Communication Bridge */}
          <div className={`glass ${styles["feature-card"]}`}>
            <div className={`${styles["feature-icon"]} ${styles["feature-icon-bridge"]}`}>
              🌐
            </div>
            <h3>Multilingual SOS Bridge</h3>
            <p>
              Distressed guests type in any language. Beacon instantly
              translates, extracts room numbers and severity, and pipes
              structured alerts to the command dashboard — no language
              barrier survives.
            </p>
          </div>

          {/* Card 3: Dynamic Map */}
          <div className={`glass ${styles["feature-card"]}`}>
            <div className={`${styles["feature-icon"]} ${styles["feature-icon-map"]}`}>
              🗺️
            </div>
            <h3>Dynamic Threat Map</h3>
            <p>
              A live, interactive floor plan updated in real-time. Blocked
              exits turn red, safe routes glow green, and every SOS pin
              drops exactly where help is needed — giving first responders
              the God&apos;s-Eye view.
            </p>
          </div>
        </div>
      </section>

      {/* -------- CTA -------- */}
      <section className={styles["cta-section"]} id="how-it-works">
        <h2>
          Ready to See It in Action?
        </h2>
        <p>
          Launch the command center to explore the full crisis simulation
          dashboard, or open the SOS portal to experience the guest view.
        </p>
        <div className={styles["hero-actions"]}>
          <Link href="/dashboard" className="btn btn-primary">
            Launch Dashboard →
          </Link>
          <Link href="/sos" className="btn btn-ghost">
            Try Guest SOS
          </Link>
        </div>
      </section>

      {/* -------- FOOTER -------- */}
      <footer className={styles.footer}>
        <p>
          Built with 🤍 for the Google AI Solutions Challenge •{" "}
          <span className={styles["footer-brand"]}>Beacon</span> © 2026
        </p>
      </footer>
    </div>
  );
}
