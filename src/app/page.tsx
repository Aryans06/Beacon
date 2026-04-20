import styles from "./page.module.css";
import Link from "next/link";
import TypewriterText from "./components/TypewriterText";

export default function LandingPage() {
  return (
    <div className={styles.landing}>
      {/* ==================== NAVBAR ==================== */}
      <nav className={styles.nav} id="navbar">
        <div className={styles.navBrand}>
          <div className={styles.navBrandIcon}>🛡️</div>
          <span className={styles.navBrandName}>Beacon</span>
        </div>
        <ul className={styles.navLinks}>
          <li>
            <a href="#features" className={styles.navLink}>Features</a>
          </li>
          <li>
            <a href="#how-it-works" className={styles.navLink}>How It Works</a>
          </li>
          <li>
            <a href="#cta" className={styles.navLink}>Demo</a>
          </li>
          <li>
            <Link href="/dashboard" className={styles.navCta}>
              Launch Dashboard
            </Link>
          </li>
        </ul>
      </nav>

      {/* ==================== HERO ==================== */}
      <section className={styles.hero} id="hero">
        {/* Ambient glow orbs */}
        <div className={styles.heroGlow}>
          <div className={`${styles.glowOrb} ${styles.glowOrb1}`} />
          <div className={`${styles.glowOrb} ${styles.glowOrb2}`} />
          <div className={`${styles.glowOrb} ${styles.glowOrb3}`} />
        </div>

        {/* Radar background */}
        <div className={styles.radarContainer}>
          <div className={styles.radarRing} />
          <div className={styles.radarRing} />
          <div className={styles.radarRing} />
          <div className={styles.radarRing} />
          <div className={styles.radarSweep} />
          <div className={styles.radarCenter} />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.pulseDot} />
            Powered by Google Gemini AI
          </div>

          <h1 className={styles.heroTitle}>
            Crisis Response{" "}
            <span className={styles.gradientText}>
              <TypewriterText 
                phrases={["Reimagined", "Synchronized", "Accelerated", "Intelligent"]} 
              />
            </span>
            <br />
            for Hospitality
          </h1>

          <p className={styles.heroSubtitle}>
            Beacon instantly detects threats via AI vision, bridges language
            barriers with real-time translation, and synchronizes guests, staff
            &amp; first responders on a unified command map.
          </p>

          <div className={styles.heroActions}>
            <Link href="/sos" className={styles.btnCritical}>
              🚨 Guest SOS Portal
            </Link>
            <Link href="/staff" className={styles.btnPrimary}>
              📡 Staff Alert Channel
            </Link>
          </div>

          {/* Trust stats */}
          <div className={styles.heroTrust}>
            <div className={styles.trustItem}>
              <span className={styles.trustValue}>&lt;3s</span>
              <span className={styles.trustLabel}>Detection Time</span>
            </div>
            <div className={styles.trustDivider} />
            <div className={styles.trustItem}>
              <span className={styles.trustValue}>40+</span>
              <span className={styles.trustLabel}>Languages</span>
            </div>
            <div className={styles.trustDivider} />
            <div className={styles.trustItem}>
              <span className={styles.trustValue}>100%</span>
              <span className={styles.trustLabel}>Real-Time Sync</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== LIVE TICKER ==================== */}
      <div className={styles.ticker}>
        <div className={styles.tickerInner}>
          <div className={styles.tickerLabel}>
            <span className={styles.tickerDot} />
            SYSTEM STATUS
          </div>
          <div className={styles.tickerMessages}>
            <span className={styles.tickerMsg}>
              ✓ AI Vision Engine: Online &nbsp;&nbsp;│&nbsp;&nbsp;
              ✓ Translation Service: Active (42 languages) &nbsp;&nbsp;│&nbsp;&nbsp;
              ✓ WebSocket Cluster: 0ms latency &nbsp;&nbsp;│&nbsp;&nbsp;
              ✓ Threat Map: Nominal &nbsp;&nbsp;│&nbsp;&nbsp;
              ⚡ Last Drill: 2m ago — All Clear
            </span>
          </div>
        </div>
      </div>

      {/* ==================== FEATURES ==================== */}
      <section className={styles.features} id="features">
        <div className={styles.featuresHeader}>
          <div className={styles.sectionLabel}>
            <span className={styles.sectionLabelLine} />
            Core Capabilities
            <span className={styles.sectionLabelLine} />
          </div>
          <h2 className={styles.featuresTitle}>Three Pillars of Protection</h2>
          <p className={styles.featuresSubtitle}>
            Each module works independently, but together they form an
            unbreakable chain of crisis intelligence.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {/* Card 1: AI Detection */}
          <div className={styles.featureCard}>
            <span className={styles.featureNumber}>01</span>
            <div className={`${styles.featureIcon} ${styles.featureIconDetect}`}>
              🔍
            </div>
            <h3 className={styles.featureCardTitle}>AI Threat Detection</h3>
            <p className={styles.featureCardDesc}>
              Gemini 1.5 Pro continuously analyzes simulated surveillance feeds
              to automatically detect weapons, smoke, or crowd anomalies —
              triggering instant alerts without human intervention.
            </p>
            <div className={styles.featureTags}>
              <span className={styles.featureTag}>Gemini 1.5 Pro</span>
              <span className={styles.featureTag}>Multimodal</span>
              <span className={styles.featureTag}>Real-Time</span>
            </div>
          </div>

          {/* Card 2: Communication Bridge */}
          <div className={styles.featureCard}>
            <span className={styles.featureNumber}>02</span>
            <div className={`${styles.featureIcon} ${styles.featureIconBridge}`}>
              🌐
            </div>
            <h3 className={styles.featureCardTitle}>Multilingual SOS Bridge</h3>
            <p className={styles.featureCardDesc}>
              Distressed guests type in any language. Beacon instantly
              translates, extracts room numbers and severity, and pipes
              structured alerts to the command dashboard.
            </p>
            <div className={styles.featureTags}>
              <span className={styles.featureTag}>Google Translate</span>
              <span className={styles.featureTag}>NLP</span>
              <span className={styles.featureTag}>Entity Extraction</span>
            </div>
          </div>

          {/* Card 3: Dynamic Map */}
          <div className={styles.featureCard}>
            <span className={styles.featureNumber}>03</span>
            <div className={`${styles.featureIcon} ${styles.featureIconMap}`}>
              🗺️
            </div>
            <h3 className={styles.featureCardTitle}>Dynamic Threat Map</h3>
            <p className={styles.featureCardDesc}>
              A live, interactive floor plan updated in real-time. Blocked exits
              turn red, safe routes glow green, and every SOS pin drops exactly
              where help is needed.
            </p>
            <div className={styles.featureTags}>
              <span className={styles.featureTag}>WebSockets</span>
              <span className={styles.featureTag}>SVG Maps</span>
              <span className={styles.featureTag}>Live Pins</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className={styles.howItWorks} id="how-it-works">
        <div className={styles.howItWorksHeader}>
          <div className={styles.sectionLabel}>
            <span className={styles.sectionLabelLine} />
            Architecture
            <span className={styles.sectionLabelLine} />
          </div>
          <h2 className={styles.featuresTitle}>From Threat to Response in Seconds</h2>
          <p className={styles.featuresSubtitle}>
            Beacon&apos;s pipeline ensures zero information loss from detection
            to coordination.
          </p>
        </div>

        <div className={styles.flowContainer}>
          <div className={styles.flowStep}>
            <div className={`${styles.flowStepNumber} ${styles.flowStepNumber1}`}>1</div>
            <h4 className={styles.flowStepTitle}>Detect</h4>
            <p className={styles.flowStepDesc}>
              AI vision identifies the anomaly from camera feeds or guest SOS input.
            </p>
            <div className={styles.flowConnector}>→</div>
          </div>

          <div className={styles.flowStep}>
            <div className={`${styles.flowStepNumber} ${styles.flowStepNumber2}`}>2</div>
            <h4 className={styles.flowStepTitle}>Classify</h4>
            <p className={styles.flowStepDesc}>
              Gemini extracts severity, location, and threat type into structured data.
            </p>
            <div className={styles.flowConnector}>→</div>
          </div>

          <div className={styles.flowStep}>
            <div className={`${styles.flowStepNumber} ${styles.flowStepNumber3}`}>3</div>
            <h4 className={styles.flowStepTitle}>Broadcast</h4>
            <p className={styles.flowStepDesc}>
              WebSockets push alerts to all connected dashboards and guest devices instantly.
            </p>
            <div className={styles.flowConnector}>→</div>
          </div>

          <div className={styles.flowStep}>
            <div className={`${styles.flowStepNumber} ${styles.flowStepNumber4}`}>4</div>
            <h4 className={styles.flowStepTitle}>Coordinate</h4>
            <p className={styles.flowStepDesc}>
              The command map updates live, routing responders and guiding evacuations.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== CTA ==================== */}
      <section className={styles.ctaSection} id="cta">
        <div className={styles.ctaCard}>
          <h2 className={styles.ctaTitle}>
            Ready to See It In Action?
          </h2>
          <p className={styles.ctaSubtitle}>
            Experience every interface of the Beacon platform — from the guest&apos;s
            phone to the responder&apos;s pager.
          </p>
          <div className={styles.heroActions}>
            <Link href="/sos" className={styles.btnCritical}>
              🚨 Guest SOS
            </Link>
            <Link href="/staff" className={styles.btnPrimary}>
              📡 Staff Channel
            </Link>
            <Link href="/dispatch" className={styles.btnGhost}>
              🚑 Dispatch View
            </Link>
            <Link href="/report" className={styles.btnGhost}>
              📋 AI Reports
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className={styles.footer}>
        <p>
          Built with 🤍 for Google AI Solutions Challenge •{" "}
          <span className={styles.footerBrand}>Beacon</span> © 2026
        </p>
        <ul className={styles.footerLinks}>
          <li><a href="#features">Features</a></li>
          <li><a href="#how-it-works">Architecture</a></li>
          <li><a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a></li>
        </ul>
      </footer>
    </div>
  );
}
