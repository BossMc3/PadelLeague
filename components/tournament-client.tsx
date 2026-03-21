"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { Copy, Trophy } from "lucide-react";
import confetti from "canvas-confetti";
import { StandingsTable } from "@/components/standings-table";
import { calculateStandings } from "@/lib/standings";
import { createBrowserSupabase } from "@/lib/supabase";
import type { Match, Player, Tournament } from "@/lib/types";

interface Props {
  spectator?: boolean;
}

export function TournamentClient({ spectator = false }: Props) {
  const params = useParams<{ id?: string | string[] }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [playerName, setPlayerName] = useState("");
  const resolvedTournamentId = Array.isArray(params.id) ? params.id[0] : params.id;
  console.log("ID Turneu detectat:", resolvedTournamentId);

  const loadAll = useCallback(async () => {
    if (!resolvedTournamentId) return;
    const [tRes, pRes, mRes] = await Promise.all([
      fetch("/api/tournaments"),
      fetch(`/api/tournaments/${resolvedTournamentId}/players`),
      fetch(`/api/tournaments/${resolvedTournamentId}/matches`),
    ]);

    const tournamentsRaw = await tRes.json();
    const playersRaw = await pRes.json();
    const matchesRaw = await mRes.json();
    const tournaments = Array.isArray(tournamentsRaw)
      ? (tournamentsRaw as Tournament[])
      : [];
    const playersData = Array.isArray(playersRaw) ? (playersRaw as Player[]) : [];
    const matchesData = Array.isArray(matchesRaw) ? (matchesRaw as Match[]) : [];

    setTournament(tournaments.find((item) => item.id === resolvedTournamentId) ?? null);
    setPlayers(playersData);
    setMatches(matchesData);
  }, [resolvedTournamentId]);

  useEffect(() => {
    if (!resolvedTournamentId) return;
    fetch("/api/tournaments")
      .then((response) => response.json())
      .then((tournamentsRaw: unknown) => {
        const tournaments = Array.isArray(tournamentsRaw)
          ? (tournamentsRaw as Tournament[])
          : [];
        setTournament(tournaments.find((item) => item.id === resolvedTournamentId) ?? null);
      });
    fetch(`/api/tournaments/${resolvedTournamentId}/players`)
      .then((response) => response.json())
      .then((data: unknown) =>
        setPlayers(Array.isArray(data) ? (data as Player[]) : [])
      );
    fetch(`/api/tournaments/${resolvedTournamentId}/matches`)
      .then((response) => response.json())
      .then((data: unknown) =>
        setMatches(Array.isArray(data) ? (data as Match[]) : [])
      );

    const supabase = createBrowserSupabase();
    const channel = supabase
      .channel(`matches-live-${resolvedTournamentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: `tournament_id=eq.${resolvedTournamentId}`,
        },
        () => {
          void loadAll();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [resolvedTournamentId, loadAll]);

  const groupedByRound = useMemo(() => {
    const safeMatches = Array.isArray(matches) ? matches : [];
    const map = new Map<number, Match[]>();
    for (const match of safeMatches || []) {
      const roundList = map.get(match.round) ?? [];
      roundList.push(match);
      map.set(match.round, roundList);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [matches]);
  const standings = useMemo(
    () =>
      calculateStandings(
        Array.isArray(players) ? players : [],
        Array.isArray(matches) ? matches : []
      ),
    [players, matches]
  );

  const finalMatchId = useMemo(() => {
    if (!matches || matches.length === 0) return null;
    const safeMatches = matches.filter((m) => m.status === "completed");
    if (safeMatches.length === 0) return null;

    const maxRound = Math.max(...safeMatches.map((m) => m.round));
    const lastMatch = safeMatches
      .filter((m) => m.round === maxRound)
      .sort((a, b) => b.match_number - a.match_number)[0];

    return lastMatch?.id ?? null;
  }, [matches]);

  function playerNameById(playerId: string | null) {
    if (!playerId) return "BYE / TBD";
    return players.find((player) => player.id === playerId)?.name ?? "Unknown";
  }

  async function handleAddPlayer() {
    console.log("ID turneu:", resolvedTournamentId);
    if (!playerName.trim()) return;
    if (!resolvedTournamentId) return;

    const response = await fetch(`/api/tournaments/${resolvedTournamentId}/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: playerName,
        tournament_id: resolvedTournamentId,
      }),
    });
    if (!response.ok) return;
    setPlayerName("");
    window.location.reload();
  }

  const handleStartTournament = async (e?: FormEvent) => {
    if (e) e.preventDefault(); // Oprește refresh-ul automat al formularului

    console.log("Se încearcă pornirea turneului pentru ID:", resolvedTournamentId);

    try {
      if (!resolvedTournamentId || !tournament) return;
      const response = await fetch(`/api/tournaments/${resolvedTournamentId}/matches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: tournament.type }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Eroare detaliată de la server:", errorData);
        alert("STOP! Eroare la pornire: " + (errorData.error || "Necunoscută"));
        return; // Oprim aici! Nu va mai face refresh dacă e eroare.
      }

      console.log("Turneu pornit cu succes!");
      window.location.reload();
    } catch (err) {
      console.error("Eroare de rețea:", err);
      alert("Eroare critică de rețea!");
    }
  };
  
  async function submitScore(matchId: string, score1: string, score2: string) {
    const s1 = parseInt(score1 || "0", 10);
    const s2 = parseInt(score2 || "0", 10);

    if (s1 === s2) {
      alert("Scorul nu poate fi egal! Într-un turneu de padel trebuie să existe un câștigător (ex: tie-break).");
      return;
    }

    const res = await fetch(`/api/matches/${matchId}/score`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score1, score2 }),
    });

    if (res.ok) {
      void confetti({
        particleCount: 150,
        spread: 70,
        colors: ["#9dfd24", "#ffffff"],
      });
      setTimeout(() => {
        void loadAll();
      }, 2000);
    } else {
      void loadAll();
    }
  }

  async function copyLink() {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/tournament/${resolvedTournamentId}`;
    await navigator.clipboard.writeText(url);
  }

  function shareWhatsapp() {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/tournament/${resolvedTournamentId}`;
    const tournamentName = tournament?.name ?? "Turneu";
    const message = `🏆 Urmărește turneul ${tournamentName} live pe PadelLeague! Vezi bracket-ul și clasamentul aici: ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <div className="glass-card p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[#9dfd24]">
          {spectator ? "Public Spectator View" : "Tournament Control"}
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <h2 className="text-3xl font-bold">{tournament?.name ?? "Tournament"}</h2>
          <div className="flex items-center gap-2">
            <button className="btn-muted !px-3 !py-2 text-xs" onClick={shareWhatsapp}>
              WhatsApp
            </button>
            <button className="btn-muted !px-3 !py-2 text-xs" onClick={() => void copyLink()}>
              <Copy size={14} />
              Copy Link
            </button>
          </div>
        </div>
      </div>

      {!spectator && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="glass-card p-5">
            <h3 className="text-lg font-semibold">Add player</h3>
            <div className="mt-3 flex gap-2">
              <input
                className="field"
                placeholder="Player name"
                value={playerName}
                onChange={(event) => setPlayerName(event.target.value)}
              />
              <button className="btn-accent" onClick={handleAddPlayer}>
                Add
              </button>
            </div>
          </div>
          <div className="glass-card p-5">
            <h3 className="text-lg font-semibold">Bracket</h3>
            <p className="mt-1 text-sm text-zinc-400">
              Start Tournament pentru generare automata de meciuri.
            </p>
            <button className="btn-accent mt-4" onClick={handleStartTournament}>
              Start Tournament
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <StandingsTable rows={standings} />

        <div className="glass-card overflow-x-auto p-5 lg:col-span-2">
          <h3 className="text-lg font-semibold">Bracket Live</h3>
          <div className="mt-4 flex min-w-max gap-4">
            {groupedByRound.map(([round, roundMatches]) => (
              <div key={round} className="w-72 space-y-3">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                  Round {round}
                </p>
                {roundMatches.map((match) => {
                  const s1 = Number(match.score1 ?? 0);
                  const s2 = Number(match.score2 ?? 0);
                  const isCompleted = match.status === "completed";
                  const winner1 = isCompleted && s1 > s2;
                  const winner2 = isCompleted && s2 > s1;

                  const isFinalMatch = match.id === finalMatchId;
                  const isChampionshipWinner1 = isFinalMatch && winner1;
                  const isChampionshipWinner2 = isFinalMatch && winner2;

                  return (
                    <div
                      key={match.id}
                      className="rounded-xl border border-white/10 bg-black/30 p-3"
                    >
                      <p className="text-xs text-zinc-500">Match #{match.match_number}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <p
                          className={`text-sm ${
                            isChampionshipWinner1
                              ? "font-bold text-yellow-500"
                              : winner1
                              ? "font-bold text-[#9dfd24]"
                              : ""
                          }`}
                        >
                          {isChampionshipWinner1 && "🏆 "}
                          {playerNameById(match.player1_id)}
                        </p>
                        {winner1 && !isChampionshipWinner1 && (
                          <Trophy size={14} className="text-[#9dfd24]" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <p
                          className={`text-sm ${
                            isChampionshipWinner2
                              ? "font-bold text-yellow-500"
                              : winner2
                              ? "font-bold text-[#9dfd24]"
                              : ""
                          }`}
                        >
                          {isChampionshipWinner2 && "🏆 "}
                          {playerNameById(match.player2_id)}
                        </p>
                        {winner2 && !isChampionshipWinner2 && (
                          <Trophy size={14} className="text-[#9dfd24]" />
                        )}
                      </div>
                      <p className="mt-1 text-xs text-zinc-400">
                        {match.score1 ?? "-"} : {match.score2 ?? "-"}
                      </p>
                      {!spectator && match.player1_id && match.player2_id && (
                        <ScoreEntry
                          matchId={match.id}
                          onSubmit={submitScore}
                          disabled={isCompleted}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            {groupedByRound.length === 0 && (
              <p className="text-sm text-zinc-400">
                Nu există meciuri generate încă. Adaugă jucători și apasă Start!
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ScoreEntry({
  matchId,
  onSubmit,
  disabled,
}: {
  matchId: string;
  onSubmit: (matchId: string, score1: string, score2: string) => Promise<void>;
  disabled: boolean;
}) {
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");

  return (
    <div className="mt-2 flex items-center gap-2">
      <input
        className="field !w-14 !px-2 !py-1 text-center"
        value={score1}
        type="number"
        min={0}
        disabled={disabled}
        onChange={(event) => setScore1(event.target.value)}
      />
      <input
        className="field !w-14 !px-2 !py-1 text-center"
        value={score2}
        type="number"
        min={0}
        disabled={disabled}
        onChange={(event) => setScore2(event.target.value)}
      />
      <button
        className="btn-muted !px-2 !py-1 text-xs"
        disabled={disabled}
        onClick={() => void onSubmit(matchId, score1, score2)}
      >
        Save
      </button>
    </div>
  );
}
