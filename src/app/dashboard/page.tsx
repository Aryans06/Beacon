"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { socket } from "../lib/socket";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface Incident {
  id: number;
  type: string;
  location: string;
  time: string;
  severity: "critical" | "warning" | "info";
  desc?: string;
  x?: number;
  y?: number;
  status?: "active" | "acknowledged" | "resolved";
  aiData?: {
    translation?: string;
    severity?: string;
    room?: string;
    threatType?: string;
    summary?: string;
    protocol?: string[];
    instructions?: string;
  };
}

/* ------------------------------------------------------------------ */
/*  Location → coordinate helper                                       */
/* ------------------------------------------------------------------ */
const locationMap: Record<string, { x: number; y: number; zone: string }> = {
  lobby:     { x: 50, y: 78, zone: "Main Lobby" },
  pool:      { x: 18, y: 72, zone: "Pool Deck" },
  "412":     { x: 18, y: 18, zone: "Room 412" },
  "305":     { x: 50, y: 18, zone: "Room 305" },
  "201":     { x: 35, y: 42, zone: "Room 201" },
  east:      { x: 80, y: 45, zone: "East Wing" },
  restaurant:{ x: 80, y: 78, zone: "Restaurant" },
  parking:   { x: 80, y: 18, zone: "Parking Deck" },
};

function getCoordinatesForLocation(loc?: string): { x: number; y: number } {
  if (!loc) return { x: 50, y: 50 };
  const l = loc.toLowerCase();
  for (const [key, val] of Object.entries(locationMap)) {
    if (l.includes(key)) return { x: val.x, y: val.y };
  }
  return { x: 35 + Math.random() * 30, y: 35 + Math.random() * 30 };
}

/* ------------------------------------------------------------------ */
/*  Initial seed data                                                  */
/* ------------------------------------------------------------------ */
const initialIncidents: Incident[] = [
  { id: 1, type: "Weapon Detected", location: "Lobby Entrance", time: "12:44:01", severity: "critical", x: 50, y: 78, status: "active",
    aiData: { threatType: "Security", severity: "critical", summary: "CCTV Camera L-04 detected a drawn firearm near main entrance.", protocol: ["Initiate Code Silver lockdown", "Dispatch armed response team Alpha", "Push silent alert to all ground floor staff", "Notify local PD (auto-dialed)"], translation: "AI Vision confidence: 96.2%" } },
  { id: 2, type: "Guest SOS (Translated)", location: "Room 412", time: "12:42:30", severity: "warning", x: 18, y: 18, status: "acknowledged",
    desc: "Medical issue reported",
    aiData: { threatType: "Medical", severity: "warning", room: "412", summary: "Guest reported severe chest pain. Translated from Spanish.", protocol: ["Dispatch on-site medic to Room 412", "Retrieve nearest AED from Floor 4 station", "Clear elevator 2 for EMS access"], translation: "\"Ayuda, tengo dolor en el pecho\" → Help, I have chest pain", instructions: "Stay calm. Medical help is being dispatched to Room 412." } },
  { id: 3, type: "Crowd Anomaly", location: "Pool Deck", time: "12:35:10", severity: "info", x: 18, y: 72, status: "resolved",
    aiData: { threatType: "Other", severity: "info", summary: "Unusual clustering detected near pool area. Likely a wedding event.", protocol: ["Monitor for 15 minutes", "No action required if event is authorized"] } }
];

/* ================================================================== */
/*  Dashboard Component                                                */
/* ================================================================== */
export default function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [currentTime, setCurrentTime] = useState("");
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(1);
  const [alertFlash, setAlertFlash] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  // Stats
  const criticalCount = incidents.filter(i => i.severity === "critical" && i.status !== "resolved").length;
  const warningCount = incidents.filter(i => i.severity === "warning" && i.status !== "resolved").length;
  const resolvedCount = incidents.filter(i => i.status === "resolved").length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    }, 1000);

    socket.connect();

    socket.on("new_incident", (data: Incident) => {
      const coords = getCoordinatesForLocation(data.aiData?.room || data.location);
      const mappedData: Incident = { ...data, x: coords.x, y: coords.y, status: "active" };
      setIncidents(prev => [mappedData, ...prev]);
      setSelectedIncidentId(mappedData.id);

      // Flash the screen border on critical
      if (data.severity === "critical") {
        setAlertFlash(true);
        setTimeout(() => setAlertFlash(false), 3000);
      }

      // Scroll feed to top
      feedRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    });

    return () => {
      clearInterval(timer);
      socket.off("new_incident");
      socket.disconnect();
    };
  }, []);

  /* --- Actions --- */
  const handleAcknowledge = (id: number) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: "acknowledged" } : i));
  };

  const handleResolve = (id: number) => {
    setIncidents(prev => prev.map(i => i.id === id ? { ...i, status: "resolved" } : i));
  };

  const severityIcon = (s: string) => {
    if (s === "critical") return "🔴";
    if (s === "warning") return "🟡";
    return "🔵";
  };

  const statusBadge = (status?: string) => {
    if (status === "resolved") return <span className={styles.badgeResolved}>Resolved</span>;
    if (status === "acknowledged") return <span className={styles.badgeAck}>ACK</span>;
    return <span className={styles.badgeLive}>LIVE</span>;
  };

  /* ---------------------------------------------------------------- */
  /*  RENDER                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className={`${styles.dashboard} ${alertFlash ? styles.alertFlash : ""}`}>
      {/* ===================== TOP BAR ===================== */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>🛡️</div>
          <span className={styles.brandName}>Beacon</span>
          <span className={styles.brandSub}>Command Center</span>
        </div>

        {/* Quick stats pills */}
        <div className={styles.statsPills}>
          <div className={`${styles.pill} ${styles.pillCritical}`}>
            <span className={styles.pillCount}>{criticalCount}</span> Critical
          </div>
          <div className={`${styles.pill} ${styles.pillWarning}`}>
            <span className={styles.pillCount}>{warningCount}</span> Warning
          </div>
          <div className={`${styles.pill} ${styles.pillResolved}`}>
            <span className={styles.pillCount}>{resolvedCount}</span> Resolved
          </div>
        </div>

        {/* System status */}
        <div className={styles.sysStatus}>
          <div className={styles.statusItem}>
            <span className={`${styles.statusDot} ${styles.statusActive}`} /> AI Engine
          </div>
          <div className={styles.statusItem}>
            <span className={`${styles.statusDot} ${styles.statusActive}`} /> Sockets
          </div>
          <div className={styles.statusItem}>
            <span className={`${styles.statusDot} ${criticalCount > 0 ? styles.statusCritical : styles.statusActive}`} />
            {criticalCount > 0 ? "ALERT" : "Clear"}
          </div>
        </div>

        <div className={styles.actions}>
          <span className={styles.clock}>{currentTime}</span>
          <Link href="/sos" className={styles.sosLink}>Open SOS ↗</Link>
          <Link href="/" className={styles.exitLink}>Exit</Link>
        </div>
      </header>

      {/* ===================== MAIN WORKSPACE ===================== */}
      <main className={styles.workspace}>

        {/* -------- LEFT: Incident Feed -------- */}
        <aside className={`${styles.panel} ${styles.feedPanel}`}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>
              <span className={styles.liveDot} /> Incident Feed
            </span>
            <span className={styles.incidentCount}>{incidents.length}</span>
          </div>
          <div className={styles.feedContent} ref={feedRef}>
            {incidents.map((incident) => (
              <div
                key={incident.id}
                onClick={() => setSelectedIncidentId(incident.id)}
                className={`${styles.feedItem} ${
                  incident.severity === "critical" ? styles.feedItemCritical :
                  incident.severity === "warning" ? styles.feedItemWarning : styles.feedItemInfo
                } ${selectedIncidentId === incident.id ? styles.feedItemSelected : ""}
                  ${incident.status === "resolved" ? styles.feedItemResolved : ""}`}
              >
                <div className={styles.itemHeader}>
                  <div className={styles.itemLeft}>
                    <span className={styles.itemIcon}>{severityIcon(incident.severity)}</span>
                    <span className={styles.itemType}>{incident.type}</span>
                  </div>
                  <div className={styles.itemRight}>
                    {statusBadge(incident.status)}
                    <span className={styles.itemTime}>{incident.time}</span>
                  </div>
                </div>
                <div className={styles.itemBody}>
                  <span className={styles.itemLoc}>📍 {incident.location}</span>
                  {incident.aiData?.summary && (
                    <p className={styles.itemSummary}>{incident.aiData.summary}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* -------- CENTER: Threat Map -------- */}
        <section className={`${styles.panel} ${styles.mapPanel}`}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>Threat Map — Floor 1</span>
          </div>

          <div className={styles.mapContainer}>
            <div className={styles.blueprint}>
              <svg className={styles.floorplanSvg} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
                    <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(0, 229, 255, 0.04)" strokeWidth="0.3" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />

                {/* ---- Rooms ---- */}
                {/* Room 412 */}
                <rect x="5" y="5" width="25" height="25" rx="1" fill="rgba(15, 26, 54, 0.5)" stroke="rgba(120, 150, 255, 0.15)" strokeWidth="0.4" />
                <text x="17.5" y="14" fill="rgba(120,150,255,0.3)" fontSize="2.5" textAnchor="middle" fontFamily="monospace">RM 412</text>
                <rect x="7" y="17" width="8" height="5" rx="0.5" fill="none" stroke="rgba(120,150,255,0.08)" strokeWidth="0.2" />
                <rect x="18" y="17" width="5" height="5" rx="0.5" fill="none" stroke="rgba(120,150,255,0.08)" strokeWidth="0.2" />

                {/* Room 305 */}
                <rect x="38" y="5" width="25" height="25" rx="1" fill="rgba(15, 26, 54, 0.5)" stroke="rgba(120, 150, 255, 0.15)" strokeWidth="0.4" />
                <text x="50.5" y="14" fill="rgba(120,150,255,0.3)" fontSize="2.5" textAnchor="middle" fontFamily="monospace">RM 305</text>
                <rect x="40" y="17" width="8" height="5" rx="0.5" fill="none" stroke="rgba(120,150,255,0.08)" strokeWidth="0.2" />

                {/* Parking / East Wing */}
                <rect x="70" y="5" width="25" height="25" rx="1" fill="rgba(15, 26, 54, 0.3)" stroke="rgba(120, 150, 255, 0.1)" strokeWidth="0.4" />
                <text x="82.5" y="18" fill="rgba(120,150,255,0.25)" fontSize="2" textAnchor="middle" fontFamily="monospace">PARKING</text>

                {/* Hallway */}
                <rect x="5" y="33" width="90" height="8" rx="0.5" fill="rgba(15, 26, 54, 0.2)" stroke="rgba(120, 150, 255, 0.08)" strokeWidth="0.3" />
                <text x="50" y="38" fill="rgba(120,150,255,0.15)" fontSize="1.8" textAnchor="middle" fontFamily="monospace">── MAIN CORRIDOR ──</text>

                {/* East Wing */}
                <rect x="70" y="33" width="25" height="55" rx="1" fill="rgba(15, 26, 54, 0.25)" stroke="rgba(120, 150, 255, 0.1)" strokeWidth="0.4" />
                <text x="82.5" y="60" fill="rgba(120,150,255,0.2)" fontSize="2" textAnchor="middle" fontFamily="monospace" transform="rotate(90 82.5 60)">EAST WING</text>

                {/* Restaurant */}
                <rect x="70" y="65" width="25" height="28" rx="1" fill="rgba(15, 26, 54, 0.4)" stroke="rgba(120, 150, 255, 0.12)" strokeWidth="0.4" />
                <text x="82.5" y="80" fill="rgba(120,150,255,0.25)" fontSize="2" textAnchor="middle" fontFamily="monospace">RESTAURANT</text>
                {/* Tables */}
                <circle cx="75" cy="75" r="1.5" fill="none" stroke="rgba(120,150,255,0.08)" strokeWidth="0.2" />
                <circle cx="80" cy="73" r="1.5" fill="none" stroke="rgba(120,150,255,0.08)" strokeWidth="0.2" />
                <circle cx="85" cy="76" r="1.5" fill="none" stroke="rgba(120,150,255,0.08)" strokeWidth="0.2" />

                {/* Pool Deck */}
                <rect x="5" y="45" width="25" height="48" rx="1" fill="rgba(0, 229, 255, 0.03)" stroke="rgba(0, 229, 255, 0.12)" strokeWidth="0.4" />
                <text x="17.5" y="55" fill="rgba(0,229,255,0.25)" fontSize="2.2" textAnchor="middle" fontFamily="monospace">POOL</text>
                <ellipse cx="17.5" cy="72" rx="8" ry="12" fill="rgba(0, 229, 255, 0.04)" stroke="rgba(0, 229, 255, 0.15)" strokeWidth="0.3" />
                <path d="M 12 68 Q 17.5 72, 23 68" fill="none" stroke="rgba(0, 229, 255, 0.12)" strokeWidth="0.2" />
                <path d="M 12 73 Q 17.5 77, 23 73" fill="none" stroke="rgba(0, 229, 255, 0.1)" strokeWidth="0.2" />

                {/* Lobby */}
                <rect x="35" y="45" width="30" height="48" rx="1" fill="rgba(15, 26, 54, 0.6)" stroke="rgba(0, 229, 255, 0.2)" strokeWidth="0.5" />
                <text x="50" y="60" fill="rgba(0,229,255,0.35)" fontSize="3" textAnchor="middle" fontFamily="monospace" fontWeight="bold">LOBBY</text>
                {/* Entrance markers */}
                <line x1="45" y1="93" x2="55" y2="93" stroke="rgba(0,229,255,0.3)" strokeWidth="0.8" />
                <text x="50" y="97" fill="rgba(0,229,255,0.2)" fontSize="1.5" textAnchor="middle" fontFamily="monospace">MAIN ENTRANCE</text>

                {/* Room 201 */}
                <rect x="35" y="33" width="12" height="8" rx="0.5" fill="rgba(15, 26, 54, 0.35)" stroke="rgba(120, 150, 255, 0.1)" strokeWidth="0.3" />
                <text x="41" y="38" fill="rgba(120,150,255,0.2)" fontSize="1.8" textAnchor="middle" fontFamily="monospace">201</text>

                {/* Emergency exits */}
                <rect x="1" y="90" width="3" height="6" rx="0.5" fill="rgba(0, 230, 118, 0.15)" stroke="var(--success)" strokeWidth="0.3" />
                <text x="2.5" y="98" fill="rgba(0,230,118,0.3)" fontSize="1.2" textAnchor="middle" fontFamily="monospace">EXIT</text>

                <rect x="96" y="90" width="3" height="6" rx="0.5" fill="rgba(0, 230, 118, 0.15)" stroke="var(--success)" strokeWidth="0.3" />
                <text x="97.5" y="98" fill="rgba(0,230,118,0.3)" fontSize="1.2" textAnchor="middle" fontFamily="monospace">EXIT</text>
              </svg>

              {/* Dynamic Pins */}
              {incidents.filter(i => i.x && i.y && i.status !== "resolved").map(incident => (
                <div
                  key={`pin-${incident.id}`}
                  onClick={() => setSelectedIncidentId(incident.id)}
                  className={`${styles.mapPin} ${
                    incident.severity === "critical" ? styles.pinCritical :
                    incident.severity === "warning" ? styles.pinWarning : styles.pinInfo
                  } ${selectedIncidentId === incident.id ? styles.pinSelected : ""}`}
                  style={{ top: `${incident.y}%`, left: `${incident.x}%` }}
                  title={`${incident.type} — ${incident.location}`}
                >
                  {selectedIncidentId === incident.id && (
                    <div className={styles.pinLabel}>{incident.type}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Map legend */}
            <div className={styles.mapOverlay}>
              <div className={styles.legend}>
                <span><span style={{ color: "var(--critical)" }}>●</span> Critical</span>
                <span><span style={{ color: "var(--warning)" }}>●</span> Warning</span>
                <span><span style={{ color: "var(--info)" }}>●</span> Info</span>
                <span><span style={{ color: "var(--success)" }}>■</span> Exit</span>
              </div>
            </div>
          </div>
        </section>

        {/* -------- RIGHT: AI Analysis Panel -------- */}
        <aside className={`${styles.panel} ${styles.detailsPanel}`}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>🤖 AI Analysis</span>
          </div>

          {selectedIncident ? (
            <div className={styles.detailsContent}>
              {/* Event header */}
              <div className={styles.detailCard}>
                <div className={styles.detailCardHeader}>
                  <span>{severityIcon(selectedIncident.severity)}</span>
                  <span className={styles.detailEventName} style={{ color: selectedIncident.severity === "critical" ? "var(--critical)" : selectedIncident.severity === "warning" ? "var(--warning)" : "var(--info)" }}>
                    {selectedIncident.type}
                  </span>
                </div>
                <div className={styles.detailMeta}>
                  <span>📍 {selectedIncident.location}</span>
                  <span>🕐 {selectedIncident.time}</span>
                </div>
                <div className={styles.detailStatus}>
                  {statusBadge(selectedIncident.status)}
                </div>
              </div>

              {/* AI Summary */}
              {selectedIncident.aiData?.summary && (
                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>AI Summary</div>
                  <p className={styles.detailText}>{selectedIncident.aiData.summary}</p>
                </div>
              )}

              {/* Translation */}
              {selectedIncident.aiData?.translation && (
                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>🌐 Translation / Source</div>
                  <p className={styles.detailTranslation}>{selectedIncident.aiData.translation}</p>
                </div>
              )}

              {/* Protocol */}
              {selectedIncident.aiData?.protocol && (
                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>🎯 Recommended Protocol</div>
                  <ol className={styles.protocolList}>
                    {selectedIncident.aiData.protocol.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Action buttons */}
              {selectedIncident.status !== "resolved" && (
                <div className={styles.detailActions}>
                  {selectedIncident.status !== "acknowledged" && (
                    <button className={styles.btnAck} onClick={() => handleAcknowledge(selectedIncident.id)}>
                      ✓ Acknowledge
                    </button>
                  )}
                  <button className={styles.btnResolve} onClick={() => handleResolve(selectedIncident.id)}>
                    ✕ Resolve
                  </button>
                </div>
              )}
              {selectedIncident.status === "resolved" && (
                <div className={styles.resolvedBanner}>
                  ✅ This incident has been resolved
                </div>
              )}
            </div>
          ) : (
            <div className={styles.detailsEmpty}>
              Select an incident to view AI analysis
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
