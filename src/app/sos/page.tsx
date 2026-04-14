"use client";

import styles from "./page.module.css";
import { useState } from "react";
import Link from "next/link";

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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Add user message
    const userMsg: Message = { id: Date.now(), sender: 'user', text: input };
    
    // Simulate translation if not english (mock logic)
    if (input.toLowerCase().includes("ayuda") || input.toLowerCase().includes("fuego")) {
      userMsg.translation = "Help / Fire";
    }

    setMessages(prev => [...prev, userMsg]);
    setInput("");

    // 2. Simulate AI response / Automated action
    setTimeout(() => {
      let aiResponseText = "Help is on the way. Please stay calm. What is your room number?";
      let isCriticalAlert = false;

      if (userMsg.translation || input.toLowerCase().includes("fire") || input.toLowerCase().includes("smoke")) {
         aiResponseText = "FIRE DETECTED ON YOUR FLOOR. DO NOT USE ELEVATORS. Proceed to the East Stairwell immediately. Emergency services have been dispatched.";
         isCriticalAlert = true;
      }

      const aiMsg: Message = {
        id: Date.now() + 1,
        sender: 'system',
        text: aiResponseText,
        isAlert: isCriticalAlert
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1500);
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
                <h4><span className="pulse-dot" style={{ backgroundColor: 'currentColor', boxShadow: 'none' }} /> EVACUATION PROTOCOL</h4>
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
          <button className={styles.quickBtn} onClick={() => insertQuickAction("Ayuda por favor")}>Español SOS</button>
        </div>

        <form className={styles.inputBox} onSubmit={handleSend}>
          <input 
            type="text" 
            className={styles.textInput} 
            placeholder="Type your emergency..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className={styles.sendBtn} disabled={!input.trim()}>
            ↗
          </button>
        </form>
      </footer>
    </div>
  );
}
