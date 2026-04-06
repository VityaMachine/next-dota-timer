import type { TimingState } from "@/lib/timings/timingsTypes";
import { EventCard } from "@/components";
import styles from "./EventsList.module.css";

type EventsListProps = {
  events: TimingState[];
};

export default function EventsList({ events }: EventsListProps) {
  if (events.length === 0) {
    return <p className={styles.empty}>Наразі активних подій немає.</p>;
  }

  return (
    <section className={styles.list}>
      {events.map((event) => {
        const eventKey = `${event.id}-${event.currentSpawnTime ?? event.nextSpawnTime ?? "none"}`;

        return <EventCard key={eventKey} event={event} />;
      })}
    </section>
  );
}
