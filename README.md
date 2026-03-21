# 🎾 PadelLeague - TourneyOS

O platformă completă pentru gestionarea turneelor și ligilor de padel, creată pentru a elimina haosul din grupurile de WhatsApp și tabelele manuale.

## ✨ Funcționalități Principale (TourneyOS Level)
- **Generare Automată de Bracket:** Creează meciuri instantaneu prin tragere la sorți la pornirea turneului.
- **Algoritm de Ranking ELO:** Calculează automat nivelul de performanță al jucătorilor după fiecare meci.
- **Validare Sportivă:** Sistemul previne introducerea scorurilor de egalitate, respectând regulamentul oficial (tie-break).
- **Live Standings:** Clasament în timp real bazat pe victorii, seturi și puncte ELO.
- **User Experience Pro:** Animații de succes cu confetti și evidențierea campionului cu trofeu aurit (🏆).
- **Spectator Mode & Share:** Butoane dedicate pentru share pe WhatsApp și link public pentru spectatori.

## 🛠️ Tech Stack
- **Frontend:** Next.js 15 (App Router), Tailwind CSS
- **Backend & Database:** Supabase (PostgreSQL)
- **Real-time & Logic:** React Hooks & Custom ELO Logic
- **UX Enhancements:** Canvas-confetti, Lucide React icons

## 🚀 Cum se rulează local
1. Clonează repository-ul.
2. Rulează `npm install` pentru a instala dependențele.
3. Configurează fișierul `.env.local` cu credențialele tale Supabase.
4. Rulează `npm run dev` și deschide `http://localhost:3000`.

---
*Proiect realizat pentru Challenge 3 - PadelLeague.*
