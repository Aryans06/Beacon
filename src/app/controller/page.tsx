"use client";

import styles from "./page.module.css";
import { useState, useEffect } from "react";
import Link from "next/link";
import { socket } from "../lib/socket";

export default function Controller() {
  const [threatType, setThreatType] = useState("Fire");
  const [location, setLocation] = useState("Lobby");
  const [severity, setSeverity] = useState("critical");
  const [customDesc, setCustomDesc] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      let desc = customDesc;
      let protocol = [];
      let summary = "";

      if (threatType === "Fire") {
        desc = desc || "Simulated smoke detected in the specified zone.";
        summary = `Fire alarm triggered at ${location}`;
        protocol = [
          "Evacuate area immediately",
          "Dispatch fire response team",
          "Trigger emergency sprinklers in sector"
        ];
      } else if (threatType === "Medical") {
        desc = desc || "Guest reported chest pains.";
        summary = `Medical emergency at ${location}`;
        protocol = [
          "Dispatch on-site medic",
          "Clear pathways for EMS",
          "Retrieve nearest AED"
        ];
      } else if (threatType === "Weapon") {
        desc = desc || "CCTV detected a drawn firearm.";
        summary = `Active weapon detected at ${location}`;
        protocol = [
          "Initiate Code Silver lockdown",
          "Dispatch armed security Gamma",
          "Notify local PD immediately"
        ];
      } else {
        desc = desc || "System anomaly detected.";
        summary = `Anomaly at ${location}`;
        protocol = ["Investigate immediately"];
      }

      // Emit specific event for simulation that the dashboard can interpret
      socket.emit("trigger_simulation", {
        id: Date.now(),
        type: `${threatType} Detection (Simulated)`,
        location,
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        severity,
        desc,
        aiData: {
          severity,
          threatType,
          room: location.includes("Room") ? location.replace("Room ", "") : "Unknown",
          summary,
          protocol,
        }
      });
      
      // Visual feedback
      setTimeout(() => setIsSending(false), 500);
      setCustomDesc("");
      
    } catch (err) {
      console.error(err);
      setIsSending(false);
    }
  };

  return (
    <div className={styles.container}>
      <Link href="/" style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', textDecoration: 'none' }}>
        ← Back to Home
      </Link>
      
      <div className={styles.card}>
        <h1 className={styles.title}>🕹️ Demo Controller</h1>
        <p className={styles.subtitle}>
          Use this panel during your pitch to manually fire simulated events to the Command Dashboard.
        </p>

        <form onSubmit={handleSimulate}>
          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Threat Type</label>
              <select 
                className={styles.select} 
                value={threatType} 
                onChange={(e) => setThreatType(e.target.value)}
              >
                <option value="Fire">🔥 Fire / Smoke</option>
                <option value="Weapon">🔫 Weapon Detection</option>
                <option value="Medical">⚕️ Medical Emergency</option>
                <option value="Crowd">👥 Crowd Anomaly</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Severity</label>
              <select 
                className={styles.select} 
                value={severity} 
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option value="critical">Critical (Red)</option>
                <option value="warning">Warning (Yellow)</option>
                <option value="info">Info (Blue)</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Location</label>
            <input 
              type="text" 
              className={styles.input} 
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Lobby Entrance, Room 412"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Custom Description (Optional)</label>
            <input 
              type="text" 
              className={styles.input} 
              value={customDesc} 
              onChange={(e) => setCustomDesc(e.target.value)}
              placeholder="Leave blank for auto-generated description"
            />
          </div>

          <div className={styles.actions}>
            <Link href="/dashboard" target="_blank" className="btn btn-ghost">
              Open Dashboard ↗
            </Link>
            <button type="submit" className="btn btn-primary" disabled={isSending}>
              {isSending ? "Firing..." : "Fire Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
