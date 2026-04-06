import eventsJson from "../data/events.json";

export type GameEvent = (typeof eventsJson)[number];

export const EVENTS: GameEvent[] = eventsJson;
