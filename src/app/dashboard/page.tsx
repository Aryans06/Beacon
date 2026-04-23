"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { socket } from "../lib/socket";
import dynamic from "next/dynamic";

// Dynamic import of MapComponent because Leaflet needs `window`
const DynamicMap = dynamic(() => import("../components/MapComponent"), { ssr: false });

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
  lat?: number;
  lng?: number;
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
/*  Location → Real Coordinates helper (Connaught Place, New Delhi)    */
/* ------------------------------------------------------------------ */
const locationMap: Record<string, { lat: number; lng: number }> = {
  lobby:     { lat: 28.6320, lng: 77.2185 }, // Center CP
  pool:      { lat: 28.6335, lng: 77.2170 }, // Inner circle North
  "412":     { lat: 28.6310, lng: 77.2200 }, // Radial road
  "305":     { lat: 28.6325, lng: 77.2210 }, // Outer circle
  "201":     { lat: 28.6305, lng: 77.2175 },
  east:      { lat: 28.6315, lng: 77.2225 }, // East side CP
  restaurant:{ lat: 28.6330, lng: 77.2190 },
  parking:   { lat: 28.6340, lng: 77.2200 },
};

function getCoordinatesForLocation(loc?: string): { lat: number; lng: number } {
  if (!loc) return { lat: 28.6320, lng: 77.2185 };
  const l = loc.toLowerCase();
  for (const [key, val] of Object.entries(locationMap)) {
    if (l.includes(key)) return { lat: val.lat, lng: val.lng };
  }
  // Random offset around Center of CP
  return { 
    lat: 28.6320 + (Math.random() - 0.5) * 0.005, 
    lng: 77.2185 + (Math.random() - 0.5) * 0.005 
  };
}

/* ------------------------------------------------------------------ */
/*  Initial seed data                                                  */
/* ------------------------------------------------------------------ */
const initialIncidents: Incident[] = [
  { id: 1, type: "Weapon Detected", location: "Lobby Entrance", time: "12:44:01", severity: "critical", lat: 28.6320, lng: 77.2185, status: "active",
    aiData: { threatType: "Security", severity: "critical", summary: "CCTV Camera L-04 detected a drawn firearm near main entrance.", protocol: ["Initiate Code Silver lockdown", "Dispatch armed response team Alpha", "Push silent alert to all ground floor staff", "Notify local PD (auto-dialed)"], translation: "AI Vision confidence: 96.2%" } },
  { id: 2, type: "Guest SOS (Translated)", location: "Room 412", time: "12:42:30", severity: "warning", lat: 28.6310, lng: 77.2200, status: "acknowledged",
    desc: "Medical issue reported",
    aiData: { threatType: "Medical", severity: "warning", room: "412", summary: "Guest reported severe chest pain. Translated from Spanish.", protocol: ["Dispatch on-site medic to Room 412", "Retrieve nearest AED from Floor 4 station", "Clear elevator 2 for EMS access"], translation: "\"Ayuda, tengo dolor en el pecho\" → Help, I have chest pain", instructions: "Stay calm. Medical help is being dispatched to Room 412." } },
  { id: 3, type: "Crowd Anomaly", location: "Pool Deck", time: "12:35:10", severity: "info", lat: 28.6335, lng: 77.2170, status: "resolved",
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

    // Load existing incidents from server memory
    socket.on("incident_history", (history: Incident[]) => {
      if (history && history.length > 0) {
        const mapped = history.map(d => {
          const coords = getCoordinatesForLocation(d.aiData?.room || d.location);
          return { ...d, lat: d.lat || coords.lat, lng: d.lng || coords.lng, status: d.status || "active" as const };
        });
        setIncidents(prev => {
          const existingIds = new Set(prev.map(i => i.id));
          const newOnes = mapped.filter(m => !existingIds.has(m.id));
          return [...newOnes.reverse(), ...prev];
        });
      }
    });

    // New live incidents
    socket.on("new_incident", (data: Incident) => {
      const coords = getCoordinatesForLocation(data.aiData?.room || data.location);
      const mappedData: Incident = { ...data, lat: coords.lat, lng: coords.lng, status: "active" };
      setIncidents(prev => {
        // Prevent duplicates
        if (prev.some(i => i.id === mappedData.id)) return prev;
        return [mappedData, ...prev];
      });
      setSelectedIncidentId(mappedData.id);

      if (data.severity === "critical") {
        setAlertFlash(true);
        setTimeout(() => setAlertFlash(false), 3000);
      }

      feedRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    });

    // Status updates from other views (staff channel, dispatch)
    socket.on("incident_updated", (data: { id: number; status: string }) => {
      setIncidents(prev => prev.map(i =>
        i.id === data.id ? { ...i, status: data.status as Incident["status"] } : i
      ));
    });

    return () => {
      clearInterval(timer);
      socket.off("incident_history");
      socket.off("new_incident");
      socket.off("incident_updated");
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
            <span className={styles.panelTitle}>Live Operations Map</span>
          </div>

          <div className={styles.mapContainer}>
            <div className={styles.blueprint}>
              {/* REAL MAP COMPONENT */}
              <DynamicMap 
                incidents={incidents.filter(i => i.status !== "resolved")} 
                selectedId={selectedIncidentId} 
                onSelect={setSelectedIncidentId} 
                center={[28.6320, 77.2185]} // Center on Connaught Place, New Delhi
              />
            </div>

            {/* Map legend */}
            <div className={styles.mapOverlay}>
              <div className={styles.legend}>
                <span><span style={{ color: "var(--critical)" }}>●</span> Critical</span>
                <span><span style={{ color: "var(--warning)" }}>●</span> Warning</span>
                <span><span style={{ color: "var(--info)" }}>●</span> Info</span>
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
