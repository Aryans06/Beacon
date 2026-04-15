"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { useState, useEffect } from "react";
import { socket } from "../lib/socket";

interface Incident {
  id: number;
  type: string;
  location: string;
  time: string;
  severity: "critical" | "warning" | "info";
  desc?: string;
  x?: number;
  y?: number;
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

const initialIncidents: Incident[] = [
  { id: 1, type: "Weapon Detected", location: "Lobby Entrance", time: "12:44:01", severity: "critical", x: 50, y: 80 },
  { id: 2, type: "Guest SOS (Translated)", location: "Room 412", time: "12:42:30", severity: "warning", desc: "Medical issue reported. NLP extracted: 'heart pain'.", x: 20, y: 30 },
  { id: 3, type: "Crowd Anomaly", location: "Pool Deck", time: "12:35:10", severity: "info" }
];

// Helper to get static coordinates for known locations
function getCoordinatesForLocation(loc?: string): { x: number, y: number } {
  if (!loc) return { x: 50, y: 50 };
  const l = loc.toLowerCase();
  if (l.includes("lobby")) return { x: 50, y: 80 };
  if (l.includes("pool")) return { x: 20, y: 75 };
  if (l.includes("412")) return { x: 20, y: 20 };
  if (l.includes("305")) return { x: 50, y: 20 };
  if (l.includes("east")) return { x: 80, y: 50 };
  return { x: 40 + Math.random() * 20, y: 40 + Math.random() * 20 }; // Fallback central area
}

export default function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [currentTime, setCurrentTime] = useState("");
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(1);

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);

    socket.connect();

    socket.on("new_incident", (data: Incident) => {
      // Map coords based on extracted location
      const coords = getCoordinatesForLocation(data.aiData?.room || data.location);
      const mappedData = { ...data, x: coords.x, y: coords.y };
      setIncidents((prev) => [mappedData, ...prev]);
      setSelectedIncidentId(mappedData.id);
    });

    return () => {
      clearInterval(timer);
      socket.off("new_incident");
      socket.disconnect();
    };
  }, []);

  return (
    <div className={styles.dashboard}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>🛡️</div>
          <span className={styles.brandName}>Beacon Command Center</span>
        </div>

        <div className={styles.sysStatus}>
          <div className={styles.statusItem}>
            <span className={`${styles.statusDot} ${styles.statusActive}`} /> Gemini Vision
          </div>
          <div className={styles.statusItem}>
            <span className={`${styles.statusDot} ${styles.statusActive}`} /> Translation Engine
          </div>
          <div className={styles.statusItem}>
            <span className={`${styles.statusDot} ${styles.statusCritical}`} /> Active Alert
          </div>
        </div>

        <div className={styles.actions}>
          <span className="mono" style={{ alignSelf: 'center', marginRight: '16px', color: 'var(--accent)' }}>
            {currentTime}
          </span>
          <Link href="/" className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
            Exit
          </Link>
        </div>
      </header>

      <main className={styles.workspace}>
        <aside className={`${styles.panel} ${styles.feedPanel}`}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>🔴 Live Incident Feed</span>
            <span className="badge badge-critical" style={{ fontSize: '0.6rem' }}>{incidents.length} Active</span>
          </div>
          <div className={styles.feedContent}>
            {incidents.map((incident) => (
              <div 
                key={incident.id} 
                onClick={() => setSelectedIncidentId(incident.id)}
                className={`${styles.feedItem} ${
                  incident.severity === 'critical' ? styles.feedItemCritical : 
                  incident.severity === 'warning' ? styles.feedItemWarning : ''
                } ${selectedIncidentId === incident.id ? styles.feedItemActive : ''}`}
                style={selectedIncidentId === incident.id ? { borderColor: 'var(--accent)', background: 'rgba(0, 229, 255, 0.05)' } : {}}
              >
                <div className={styles.itemHeader}>
                  <span className={styles.itemType}>{incident.type}</span>
                  <span className={styles.itemTime}>{incident.time}</span>
                </div>
                <div className={styles.itemDesc}>
                  <strong>Location:</strong> {incident.location}
                  {incident.desc && <><br /><em>{incident.desc}</em></>}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className={`${styles.panel} ${styles.mapPanel}`}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>🗺️ Threat Map : Alpha Sector</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="badge badge-info" style={{ background: 'transparent', cursor: 'pointer' }}>Floor 1</button>
              <button className="badge" style={{ background: 'transparent', cursor: 'pointer', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>Floor 2</button>
            </div>
          </div>
          
          <div className={styles.mapContainer}>
            <div className={styles.blueprint}>
              {/* Detailed SVG Floorplan */}
              <svg className={styles.floorplanSvg} viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="4" height="4" patternUnits="userSpaceOnUse">
                    <path d="M 4 0 L 0 0 0 4" fill="none" stroke="rgba(0, 229, 255, 0.05)" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
                
                {/* Rooms and Corridors */}
                {/* Room 412 (Top Left) */}
                <rect x="5" y="5" width="30" height="30" fill="rgba(15, 26, 54, 0.4)" stroke="var(--glass-border)" strokeWidth="0.5" />
                <text x="20" y="20" fill="var(--text-muted)" fontSize="3" textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">ROOM 412</text>

                {/* Room 305 (Top Middle) */}
                <rect x="40" y="5" width="20" height="30" fill="rgba(15, 26, 54, 0.4)" stroke="var(--glass-border)" strokeWidth="0.5" />
                <text x="50" y="20" fill="var(--text-muted)" fontSize="3" textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">ROOM 305</text>

                {/* East Wing (Top Right to Bottom Right) */}
                <rect x="65" y="5" width="30" height="70" fill="rgba(15, 26, 54, 0.2)" stroke="var(--glass-border)" strokeWidth="0.5" />
                <text x="80" y="40" fill="var(--text-muted)" fontSize="3" textAnchor="middle" dominantBaseline="middle" fontFamily="monospace" transform="rotate(90 80 40)">EAST WING CORRIDOR</text>

                {/* Pool Deck (Bottom Left) */}
                <rect x="5" y="50" width="30" height="40" fill="rgba(0, 229, 255, 0.05)" stroke="var(--glass-border)" strokeWidth="0.5" />
                <path d="M 10 80 Q 20 85, 30 80 Q 20 75, 10 80" fill="none" stroke="rgba(0, 229, 255, 0.3)" strokeWidth="0.2" />
                <text x="20" y="70" fill="var(--text-muted)" fontSize="3" textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">POOL DECK</text>

                {/* Main Lobby (Bottom Middle) */}
                <rect x="40" y="50" width="20" height="40" fill="rgba(15, 26, 54, 0.6)" stroke="var(--accent)" strokeWidth="0.5" />
                <text x="50" y="75" fill="var(--accent)" fontSize="3" textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">LOBBY</text>
                
                {/* Connecting Hallway */}
                <rect x="35" y="40" width="30" height="5" fill="none" stroke="var(--glass-border)" strokeWidth="0.5" />
              </svg>

              {incidents.filter(i => i.x && i.y).map(incident => (
                <div 
                  key={`pin-${incident.id}`} 
                  onClick={() => setSelectedIncidentId(incident.id)}
                  className={`${styles.mapPin} ${incident.severity === 'critical' ? styles.pinCritical : incident.severity === 'warning' ? styles.pinWarning : ''}`} 
                  style={{ 
                    top: `${incident.y}%`, 
                    left: `${incident.x}%`,
                    transform: selectedIncidentId === incident.id ? 'translate(-50%, -50%) scale(1.5)' : 'translate(-50%, -50%)',
                    zIndex: selectedIncidentId === incident.id ? 10 : 1
                  }} 
                  title={incident.type}
                />
              ))}
            </div>

            <div className={styles.mapOverlay}>
              <div className="glass" style={{ padding: '8px 12px', display: 'flex', gap: '16px', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--critical)' }}>●</span> Threat Zone</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--warning)' }}>●</span> SOS Signal</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}><span style={{ color: 'var(--success)' }}>--</span> Safe Route</span>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT: Selected Incident Details / AI Analysis */}
        <aside className={`${styles.panel} ${styles.detailsPanel}`}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>🤖 AI Analysis</span>
          </div>
          <div className={styles.detailsContent}>
            
            <div className={styles.detailGroup}>
              <div className={styles.detailLabel}>Selected Event</div>
              <div className={styles.detailValue} style={{ color: selectedIncident?.severity === 'critical' ? 'var(--critical)' : 'var(--warning)', fontWeight: 600 }}>
                {selectedIncident?.type}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Location: {selectedIncident?.location}
              </div>
            </div>

            <div className={styles.detailGroup}>
              <div className={styles.detailLabel}>Gemini Confidence Score</div>
              <div className={styles.detailValue} style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                {selectedIncident?.aiData ? "94.8%" : "88.5%"}
              </div>
            </div>

            <div className={styles.detailGroup}>
              <div className={styles.detailLabel}>AI Recommended Protocol</div>
              <div className={styles.detailValue} style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                 {selectedIncident?.aiData?.protocol ? (
                   <ul style={{ paddingLeft: '16px', marginTop: '8px' }}>
                     {selectedIncident.aiData.protocol.map((p: string, idx: number) => (
                       <li key={idx} style={{ marginBottom: '8px' }}>{p}</li>
                     ))}
                   </ul>
                 ) : (
                   <>
                    1. Immediate lockdown of East Wing doors.<br/><br/>
                    2. Dispatch armed security team Alpha to Lobby Entrance.<br/><br/>
                    3. Push silent emergency notification to all ground floor staff.
                   </>
                 )}
              </div>
            </div>

            <div className={styles.detailGroup}>
              <div className={styles.detailLabel}>Auto-Translation</div>
              <div className={styles.detailValue} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                "{selectedIncident?.aiData?.translation || selectedIncident?.desc}"
              </div>
            </div>

            <button className="btn btn-critical" style={{ width: '100%', marginTop: '16px', padding: '10px' }}>
              Execute Protocol
            </button>
            <button className="btn btn-ghost" style={{ width: '100%', marginTop: '8px', padding: '10px' }}>
              Override / Dismiss
            </button>

          </div>
        </aside>

      </main>
    </div>
  );
}
