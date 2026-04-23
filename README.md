# 🛡️ Beacon

**AI-Powered Crisis Response Platform for Hospitality**

*Built for the Google AI Solutions Challenge*

Beacon is an intelligent emergency response system designed to drastically reduce response times during crises. By combining real-time communication bridges with Google's Gemini generative AI, Beacon automates the translation, threat-categorization, and protocol generation of unstructured distress signals.

---

## ✨ Key Features

*   **Real-Time Synchronization:** A custom Node.js and Socket.io architecture ensures zero-latency data broadcasts. When a guest hits SOS, all responder screens update instantly.
*   **Gemini 2.5 Flash Engine:** All incoming distress signals are instantly processed by Gemini for:
    *   **Auto-Translation:** Breaks language barriers in panic scenarios.
    *   **Severity Scoring:** Automatically tags events as Critical, Warning, or Info.
    *   **Protocol Generation:** Outputs actionable, step-by-step resolution checklists.
*   **Interactive Command Map:** A live, dynamic `react-leaflet` Command Center. It maps emergencies to real-world coordinates with pulsing custom radar animations.
*   **4 Distinct Views:**
    *   `🚨 Guest SOS Portal` - Mobile-first interface for requesting help.
    *   `🛡️ Command Center` - Strategic map overview for security staff.
    *   `📡 Staff Channel` - WhatsApp-styled group feed with response actions.
    *   `🚑 Dispatch Pager` - Immersive, full-screen takeover view for first responders.
    *   *Plus, a hidden `/controller` for live demo simulations.*

---

## 🛠️ Technology Stack

*   **Framework:** Next.js (App Router), React, TypeScript
*   **Real-time Engine:** Custom Node.js Server, Socket.io
*   **AI Integration:** `@google/generative-ai` (Gemini 2.5 Flash API)
*   **Web Mapping:** Leaflet, React-Leaflet, CartoDB/Stadia Maps
*   **Styling:** Pure CSS Modules (Dark Glassmorphic UI)

---

## 🚀 QuickStart & Installation

### 1. Requirements
Ensure you have Node.js (`v18+`) installed on your system.

### 2. Environment Variables
You must provide a Google Gemini API key. Create a `.env.local` file in the root directory:
```env
# .env.local
GOOGLE_API_KEY="your_api_key_here"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start the Application
**CRITICAL:** Do *not* run standard `npm run dev`. Because of the custom WebSockets, you must run the custom server script.

```bash
# This spins up next.js AND the socket cluster
node server.js
```
The app will be available at `http://localhost:3000`.

---

## 💻 Testing the Live Demo

To test the socket flow and see the AI in action:
1. Open `http://localhost:3000/dashboard` (Command Center) in one tab.
2. Open `http://localhost:3000/staff` (Staff Feed) in another tab.
3. Open `http://localhost:3000/sos` (Guest Portal) on your phone or a side-window.
4. From the SOS portal, type something like *"Ayuda, hay un hombre con un arma"* (Help, there's a man with a gun) and hit send. 
5. Watch the AI auto-translate, map it to the Command Center, and broadcast it to the staff feed in under 1 second!

---

*Beacon is currently in v3.0 stable development phase for demo purposes.*
