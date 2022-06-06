import { setHost } from "./persistence";

export const HOST_KEY = "host";
const DEBUG = false;
export const determineHost = ({
  mounted,
  remoteParticipants,
  localParticipant,
  currentHost,
}: {
  mounted: RealtimeKeyValues;
  remoteParticipants: Participant[];
  localParticipant: Participant;
  currentHost: Participant | null;
}) => {
  const mountedIds = Object.keys(mounted).filter((p) => mounted[p]);
  const connectedAndMounted = [...remoteParticipants, localParticipant].filter(
    (p) => mountedIds.includes(p.id)
  );
  const ordered = [...connectedAndMounted].sort((a, b) =>
    a.id.localeCompare(b.id)
  );
  const keepHost =
    currentHost && ordered.map((p) => p.id).includes(currentHost.id);

  if (DEBUG) {
    console[keepHost ? "log" : "warn"](
      `Mounted: ${mountedIds.join(", ")}`,
      `\nEligible participants: ${JSON.stringify(
        ordered.map((p) => ({ id: p.id, name: p.name }))
      )}`,
      `\nCurrent host: ${JSON.stringify(currentHost)}`,
      `\nChange host: ${keepHost ? "No" : "Yes"}`
    );
  }

  if (keepHost) {
    return currentHost;
  }
  const newHost = ordered[0];
  if (DEBUG && !newHost) console.log("There is no eligible host");

  if (newHost && newHost.id === localParticipant.id) {
    setHost(localParticipant);
  }
  return ordered[0];
};
