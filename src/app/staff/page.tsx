"use client";

import styles from "./page.module.css";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { socket } from "../lib/socket";

interface Incident {
  id: number;
  type: string;
  location: string;
  time: string;
  severity: "critical" | "warning" | "info";
  desc?: string;
  aiData?: {
    translation?: string;
    summary?: string;
    protocol?: string[];
    threatType?: string;
  };
}

export default function StaffChannel() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [responded, setResponded] = useState<Set<number>>(new Set());
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.connect();

    socket.on("incident_history", (history: Incident[]) => {
      setIncidents(history);
    });

    socket.on("new_incident", (data: Incident) => {
      setIncidents(prev => [...prev, data]);
      // Scroll to bottom on new message
      setTimeout(() => {
        feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
      }, 100);
    });

    return () => {
      socket.off("incident_history");
      socket.off("new_incident");
      socket.disconnect();
    };
  }, []);

  const handleRespond = (id: number) => {
    setResponded(prev => new Set(prev).add(id));
    socket.emit("update_incident", { id, status: "acknowledged" });
  };

  const severityLabel = (s: string) => s === "critical" ? "🚨 CRITICAL ALERT" : s === "warning" ? "⚠️ WARNING" : "ℹ️ INFO";

  return (
    <div className={styles.channelPage}>
      {/* Channel Header */}
      <header className={styles.channelHeader}>
        <div className={styles.channelInfo}>
          <div className={styles.channelAvatar}>🚨</div>
          <div>
            <div className={styles.channelName}>Staff Emergency Channel</div>
            <div className={styles.channelSub}>
              <span className={styles.onlineDot} /> Beacon AI • {incidents.length} alerts
            </div>
          </div>
        </div>
        <div className={styles.channelActions}>
          <Link href="/sos" className={styles.channelLink}>Open SOS ↗</Link>
          <Link href="/" className={styles.channelLink}>← Home</Link>
        </div>
      </header>

      {/* Message Feed */}
      <div className={styles.messageFeed} ref={feedRef}>
        {incidents.length === 0 ? (
          <div className={styles.emptyFeed}>
            <div className={styles.emptyFeedIcon}>📡</div>
            <div className={styles.emptyFeedText}>
              Waiting for SOS signals... Open the Guest SOS Portal and send a message to see alerts appear here.
            </div>
          </div>
        ) : (
          <>
            <div className={styles.systemMsg}>
              🛡️ Beacon AI Channel — All emergency alerts will appear below
            </div>

            {incidents.map((incident) => (
              <div
                key={incident.id}
                className={`${styles.alertCard} ${
                  incident.severity === "critical" ? styles.alertCardCritical :
                  incident.severity === "warning" ? styles.alertCardWarning : styles.alertCardInfo
                }`}
              >
                {/* Sender line */}
                <div className={`${styles.alertSender} ${
                  incident.severity === "critical" ? styles.alertSenderCritical :
                  incident.severity === "warning" ? styles.alertSenderWarning : styles.alertSenderInfo
                }`}>
                  🤖 Beacon AI — {severityLabel(incident.severity)}
                  {responded.has(incident.id) && (
                    <span className={styles.respondedBadge}>✓ Responding</span>
                  )}
                  <span className={styles.alertSenderTime}>{incident.time}</span>
                </div>

                {/* Body */}
                <div className={styles.alertBody}>
                  <div className={styles.alertTitle}>
                    {incident.type}
                    <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontWeight: 400 }}>
                      at {incident.location}
                    </span>
                  </div>

                  {incident.aiData?.summary && (
                    <div className={styles.alertSummary}>{incident.aiData.summary}</div>
                  )}

                  {incident.aiData?.translation && (
                    <div className={styles.alertTranslation}>
                      🌐 {incident.aiData.translation}
                    </div>
                  )}

                  {incident.aiData?.protocol && incident.aiData.protocol.length > 0 && (
                    <ol className={styles.alertProtocol}>
                      {incident.aiData.protocol.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  )}
                </div>

                {/* Actions */}
                {!responded.has(incident.id) && (
                  <div className={styles.alertActions}>
                    <button
                      className={`${styles.respondBtn} ${styles.respondBtnPrimary}`}
                      onClick={() => handleRespond(incident.id)}
                    >
                      ✓ I&apos;m Responding
                    </button>
                    <button className={`${styles.respondBtn} ${styles.respondBtnDanger}`}>
                      📞 Call EMS
                    </button>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
