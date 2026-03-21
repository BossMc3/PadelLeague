import type { StandingRow } from "@/lib/standings";

export function StandingsTable({ rows }: { rows: StandingRow[] }) {
  return (
    <div className="glass-card p-5 lg:col-span-1">
      <h3 className="text-lg font-semibold">Standings Live</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-zinc-400">
            <tr>
              <th className="pb-2">Jucator</th>
              <th className="pb-2">V</th>
              <th className="pb-2">I</th>
              <th className="pb-2">Seturi</th>
              <th className="pb-2">ELO</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.playerId} className="border-t border-white/10">
                <td className="py-2">{row.name}</td>
                <td className="py-2">{row.wins}</td>
                <td className="py-2">{row.losses}</td>
                <td className="py-2">{row.setsWon}</td>
                <td className="py-2 font-semibold text-[#9dfd24]">{row.elo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
