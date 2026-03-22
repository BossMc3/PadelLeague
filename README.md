🎾 PadelLeague - TourneyOS (v1.0)
PadelLeague is the foundation of our sports management system. It is a "Fast-Entry" platform (no login required), created specifically to eliminate the chaos of WhatsApp groups and manual spreadsheets during quick padel tournaments.

💡 Background Note: This project serves as the main engine for sports logic and the ranking algorithm, forming the basis for the more complex architecture later developed in the “League” project.

✨ Key Features (TourneyOS Core)
Automatic Bracket Generation: Creates matches instantly via random draw at the start of the tournament.

ELO Ranking Algorithm: Automatically calculates players’ performance levels after each match, ensuring a fair ranking.

Sports Validation (Tie-Break Engine): The system enforces compliance with official rules, preventing the entry of tie scores (e.g., enforces results such as 7-6).

Live Standings: Real-time rankings based on wins, sets won, and accumulated ELO points.

Visual Experience (UX Pro): Instant feedback through success animations (Canvas-Confetti) and visual highlighting of the champion with the Golden Trophy (🏆).

Spectator Mode: Quick access to results and the ability to share scores directly on WhatsApp.

🛠️ Tech Stack
Frontend & Logic: Next.js 15 (App Router), TypeScript.

Database & Persistence: Supabase (PostgreSQL Cloud).

Real-time Engine: Custom React Hooks for instant score synchronization.

UI/UX: Tailwind CSS & Lucide React Icons.

🚀 How to Run Locally
Clone the repository.

Run `npm install` to install dependencies.

Configure the `.env.local` file with your Supabase credentials.

Run `npm run dev` and open http://localhost:3000.

Built as the main logic project for Challenge 3 - PadelLeague.
