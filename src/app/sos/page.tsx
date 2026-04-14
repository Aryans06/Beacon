"use client";

import styles from "./page.module.css";
import { useState, useEffect } from "react";
import Link from "next/link";
import { socket } from "../lib/socket";

interface Message {
  id: number;
  sender: 'system' | 'user';
  text: string;
  translation?: string;
  isAlert?: boolean;
}

export default function SOSPortal() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'system',
      text: "Beacon Emergency AI is active. How can we help you? (You can type in any language)."
    }
  ]);
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAnalyzing) return;

    const currentInput = input;

    // 1. Add user message
    const userMsg: Message = { id: Date.now(), sender: 'user', text: currentInput };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsAnalyzing(true);

    // 2. Show "analyzing" indicator
    const analyzingMsg: Message = {
      id: Date.now() + 1,
      sender: 'system',
      text: "🔄 Analyzing your message with Gemini AI..."
    };
    setMessages(prev => [...prev, analyzingMsg]);

    // 3. Call Gemini AI Analysis
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const analysis = await response.json();

      // Remove the "analyzing" message
      setMessages(prev => prev.filter(m => m.id !== analyzingMsg.id));

      // 4. Emit enriched event to Dashboard
      socket.emit("sos_alert", {
        id: Date.now(),
        type: (analysis.threatType || "Other") + " Alert",
        location: analysis.room && analysis.room !== "Unknown" ? `Room ${analysis.room}` : "Lobby / Common Area",
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        severity: analysis.severity || "warning",
        desc: analysis.summary || currentInput,
        aiData: analysis
      });

      // 5. Add AI response to chat
      const aiMsg: Message = {
        id: Date.now() + 2,
        sender: 'system',
        text: analysis.instructions || "Help is on the way. Please stay calm.",
        isAlert: analysis.severity === 'critical'
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (err) {
      console.error("AI Analysis failed:", err);

      // Remove the "analyzing" message
      setMessages(prev => prev.filter(m => m.id !== analyzingMsg.id));

      // Fallback: emit basic event and show generic response
      socket.emit("sos_alert", {
        id: Date.now(),
        type: "Guest SOS",
        location: "Unknown",
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        severity: "warning",
        desc: currentInput
      });

      const fallbackMsg: Message = {
        id: Date.now() + 2,
        sender: 'system',
        text: "Your signal has been received. Help is being dispatched. Please stay where you are."
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const insertQuickAction = (text: string) => {
    setInput(text);
  };

  return (
    <div className={styles.sosContainer}>
      {/* --- HEADER --- */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>🚨</div>
          <span className={styles.brandName}>Beacon SOS</span>
        </div>
        <Link href="/" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none' }}>
          Cancel
        </Link>
      </header>

      {/* --- CHAT AREA --- */}
      <main className={styles.chatArea}>
        {messages.map((msg) => {
          
          if (msg.isAlert) {
            return (
              <div key={msg.id} className={styles.safetyAlert}>
                <h4>⚠️ EVACUATION PROTOCOL</h4>
                <p>{msg.text}</p>
              </div>
            );
          }

          return (
            <div 
              key={msg.id} 
              className={`${styles.message} ${msg.sender === 'system' ? styles.msgSystem : styles.msgUser}`}
            >
              {msg.text}
              {msg.translation && (
                <span className={styles.translationNote}>
                  Translated: {msg.translation}
                </span>
              )}
            </div>
          );
        })}
      </main>

      {/* --- INPUT AREA --- */}
      <footer className={styles.inputArea}>
        <div className={styles.quickActions}>
          <button className={styles.quickBtn} onClick={() => insertQuickAction("I need medical help")}>Medical Issue</button>
          <button className={styles.quickBtn} onClick={() => insertQuickAction("There is a fire / smoke")}>Fire/Smoke</button>
          <button className={styles.quickBtn} onClick={() => insertQuickAction("I am trapped in my room")}>Trapped</button>
          <button className={styles.quickBtn} onClick={() => insertQuickAction("Ayuda por favor, hay fuego en mi cuarto 305")}>Español SOS</button>
        </div>

        <form className={styles.inputBox} onSubmit={handleSend}>
          <input 
            type="text" 
            className={styles.textInput} 
            placeholder={isAnalyzing ? "Analyzing..." : "Type your emergency..."} 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isAnalyzing}
          />
          <button type="submit" className={styles.sendBtn} disabled={!input.trim() || isAnalyzing}>
            ↗
          </button>
        </form>
      </footer>
    </div>
  );
}
