import { TournamentClient } from "@/components/tournament-client";

export default async function OrganizerTournamentPage(
  props: { params: Promise<{ id: string }> }
) {
  await props.params;
  return <TournamentClient />;
}
