"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Plus, Trophy } from "lucide-react";
import type { Tournament, TournamentType } from "@/lib/types";

export default function Home() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<TournamentType>("single_elimination");
  const [error, setError] = useState("");

  async function loadTournaments() {
    const response = await fetch("/api/tournaments");
    const data = await response.json();
    setTournaments(data);
  }

  useEffect(() => {
    fetch("/api/tournaments")
      .then((response) => response.json())
      .then((data) => setTournaments(data as Tournament[]));
  }, []);

  async function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (!name.trim()) {
      setError("Te rugam sa introduci un nume!");
      return;
    }

    setError("");
    const response = await fetch("/api/tournaments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Sends exact schema expected by tournaments table: name + type.
      body: JSON.stringify({ name: name.trim(), type }),
    });
    if (!response.ok) {
      setError("Nu s-a putut salva turneul. Incearca din nou.");
      return;
    }

    setName("");
    setType("single_elimination");
    setShowModal(false);
    void loadTournaments();
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <div className="glass-card p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[#9dfd24]">
          Management Turnee
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-bold">PadelLeague Dashboard</h2>
          <button
            className="btn-accent"
            onClick={() => {
              setShowModal(true);
              setError("");
            }}
          >
            <Plus size={16} />
            Creeaza Turneu
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {tournaments.map((tournament) => (
          <article key={tournament.id} className="glass-card p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{tournament.name}</h3>
                <p className="text-sm text-zinc-400">
                  {tournament.type === "single_elimination"
                    ? "Single Elimination"
                    : "Round Robin"}
                </p>
              </div>
              <Trophy className="text-[#9dfd24]" size={18} />
            </div>
            <div className="flex gap-2">
              <Link className="btn-muted" href={`/tournaments/${tournament.id}`}>
                Organizer
              </Link>
              <Link className="btn-accent" href={`/tournament/${tournament.id}`}>
                Spectator
              </Link>
            </div>
          </article>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-20 grid place-items-center bg-black/70 p-4">
          <div className="glass-card w-full max-w-md p-6">
            <h3 className="text-xl font-semibold">Creeaza Turneu</h3>
            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <input
                className="w-full rounded-xl border border-[#9dfd24]/70 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-zinc-400 outline-none focus:border-[#9dfd24] focus:ring-2 focus:ring-[#9dfd24]/30"
                placeholder="Nume turneu"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <select
                className="field"
                value={type}
                onChange={(event) => setType(event.target.value as TournamentType)}
              >
                <option value="single_elimination">Single Elimination</option>
                <option value="round_robin">Round Robin</option>
              </select>
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
              <div className="mt-5 flex justify-end gap-2">
                <button
                  className="btn-muted"
                  type="button"
                  onClick={() => setShowModal(false)}
                >
                  Anuleaza
                </button>
                <button className="btn-accent" type="submit">
                  Salveaza
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
