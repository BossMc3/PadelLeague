# 🎾 PadelLeague - TourneyOS (v1.0)

**PadelLeague** is the architectural foundation of our sports management ecosystem. It is a **"Fast-Entry"** platform (no login required), specifically designed to eliminate the chaos of WhatsApp groups and manual spreadsheets during rapid-fire padel tournaments.

> [!IMPORTANT]
> **💡 Background Note:** This project serves as the primary engine for sports logic and ranking algorithms, forming the core logic basis for the more complex architecture later developed in the collaborative **"League"** project.

---

### ✨ Key Features (TourneyOS Core)

* **🔄 Automatic Bracket Generation:** Creates tournament matches instantly via random draw at the push of a button.
* **📊 ELO Ranking Algorithm:** Automatically calculates players' performance levels after each match, ensuring a dynamic and fair leaderboard.
* **⚖️ Sports Validation (Tie-Break Engine):** The system enforces compliance with official padel rules, preventing the entry of tie scores (e.g., forcing results like 7-6 via tie-break).
* **🏆 Live Standings:** Real-time rankings based on wins, sets won, and accumulated ELO points.
* **🎉 Visual Experience (UX Pro):** Instant user feedback through success animations (**Canvas-Confetti**) and visual highlighting of the champion with the **Golden Trophy (🏆)**.
* **📱 Spectator Mode:** Quick access to results and the ability to share live scores directly via WhatsApp.

---

### 🛠️ Tech Stack

* **Frontend & Logic:** Next.js 15 (App Router), TypeScript.
* **Database & Persistence:** Supabase (PostgreSQL Cloud).
* **Real-time Engine:** Custom React Hooks for instant score synchronization.
* **UI/UX:** Tailwind CSS & Lucide React Icons.

---

### 🚀 How to Run Locally

1. **Clone** the repository.
2. **Install** dependencies:
   ```bash
   npm install
3. **Configure** your .env.local file with your Supabase credentials.
4.  **Run** the development server:
     ```bash
     npm run dev
  5. **Open** in your browser: http://localhost:3000

Built as the main logic project for Challenge 3 - PadelLeague.
   
