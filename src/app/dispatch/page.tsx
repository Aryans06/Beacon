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
  aiData?: {
    translation?: string;
    summary?: string;
    protocol?: string[];
    threatType?: string;
    instructions?: string;
  };
}

export default function DispatchPage() {
  const [queue, setQueue] = useState<Incident[]>([]);
  const [accepted, setAccepted] = useState(false);

  // The current alert = first in queue
  const current = queue[0] || null;
  const pendingCount = queue.length;

  useEffect(() => {
    socket.connect();

    socket.on("incident_history", (history: Incident[]) => {
      // Only show unresolved ones
      setQueue(history.filter(i => i.severity !== "info").reverse());
    });

    socket.on("new_incident", (data: Incident) => {
      setQueue(prev => [data, ...prev]);
      setAccepted(false); // Reset if a new one comes in
    });

    return () => {
      socket.off("incident_history");
      socket.off("new_incident");
      socket.disconnect();
    };
  }, []);

  const handleAccept = () => {
    setAccepted(true);
    if (current) {
      socket.emit("update_incident", { id: current.id, status: "acknowledged" });
    }
  };

  const handleNext = () => {
    setAccepted(false);
    setQueue(prev => prev.slice(1));
  };

  const handleDismiss = () => {
    setQueue(prev => prev.slice(1));
  };

  return (
    <div className={styles.dispatchPage}>
      {/* No active alerts — idle state */}
      {!current && (
        <div className={styles.idleState}>
          <div className={styles.idleIcon}>✓</div>
          <div className={styles.idleTitle}>All Clear</div>
          <div className={styles.idleSub}>
            No active dispatches. You'll be alerted immediately when a new emergency comes in.
          </div>
          <div className={styles.idleStatus}>
            <span className={styles.idleStatusDot} /> Connected to Beacon
          </div>
          <Link href="/" className={styles.navLink}>← Home</Link>
        </div>
      )}

      {/* Active alert — full screen takeover */}
      {current && !accepted && (
        <div className={`${styles.alertState} ${
          current.severity === "critical" ? styles.alertStateCritical :
          current.severity === "warning" ? styles.alertStateWarning : styles.alertStateInfo
        }`}>
          {/* Queue indicator */}
          {pendingCount > 1 && (
            <div className={styles.queueBadge}>{pendingCount - 1} more pending</div>
          )}

          {/* Header */}
          <div className={styles.alertHeader}>
            <div className={`${styles.alertSeverity} ${
              current.severity === "critical" ? styles.alertSeverityCritical :
              current.severity === "warning" ? styles.alertSeverityWarning : styles.alertSeverityInfo
            }`}>
              {current.severity === "critical" ? "🚨 CRITICAL" : current.severity === "warning" ? "⚠️ WARNING" : "ℹ️ INFO"}
            </div>
            <div className={styles.alertType}>{current.type}</div>
            <div className={styles.alertLocation}>📍 {current.location}</div>
            <div className={styles.alertTime}>{current.time}</div>
          </div>

          {/* Content */}
          <div className={styles.alertContent}>
            {current.aiData?.summary && (
              <div className={styles.infoCard}>
                <div className={styles.infoLabel}>🤖 AI Analysis</div>
                <div className={styles.infoValue}>{current.aiData.summary}</div>
              </div>
            )}

            {current.aiData?.translation && (
              <div className={styles.translationCard}>
                <div className={styles.infoLabel}>🌐 Translation</div>
                <div className={styles.translationValue}>{current.aiData.translation}</div>
              </div>
            )}

            {current.aiData?.protocol && current.aiData.protocol.length > 0 && (
              <div className={styles.protocolCard}>
                <div className={styles.infoLabel}>🎯 Protocol</div>
                <ol className={styles.protocolList}>
                  {current.aiData.protocol.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={styles.alertFooter}>
            <button
              className={`${styles.acceptBtn} ${
                current.severity === "critical" ? styles.acceptBtnCritical :
                current.severity === "warning" ? styles.acceptBtnWarning : styles.acceptBtnInfo
              }`}
              onClick={handleAccept}
            >
              Accept & Respond
            </button>
            <button className={styles.secondaryBtn} onClick={handleDismiss}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Accepted confirmation */}
      {current && accepted && (
        <div className={styles.acceptedOverlay}>
          <div className={styles.acceptedIcon}>🚑</div>
          <div className={styles.acceptedTitle}>Dispatched</div>
          <div className={styles.acceptedSub}>
            You are now responding to <strong>{current.type}</strong> at <strong>{current.location}</strong>. Staff channel has been notified.
          </div>
          <button className={styles.acceptedBtn} onClick={handleNext}>
            {pendingCount > 1 ? `Next Alert (${pendingCount - 1} pending)` : "Return to Standby"}
          </button>
        </div>
      )}
    </div>
  );
}
