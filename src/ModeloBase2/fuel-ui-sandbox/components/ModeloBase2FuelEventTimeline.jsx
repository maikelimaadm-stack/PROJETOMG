/**
 * ModeloBase2FuelEventTimeline — dev-only sandbox timeline of local fuel events,
 * rendered from `viewModel.timeline`. Presentational; props-driven. NO backend/
 * fetch/Prisma/runtimeBridge/storage; no side effects. Never mounted in the app by
 * this slice.
 *
 * @param {Object} props
 * @param {{ events: Array<{ eventId: string, eventType: string, sequence?: number, createdAt?: string }> }} props.timeline
 */
export function ModeloBase2FuelEventTimeline({ timeline }) {
  const events = timeline && Array.isArray(timeline.events) ? timeline.events : [];

  if (events.length === 0) {
    return <div className="mb2-fuel-timeline mb2-fuel-timeline--empty">Sem eventos locais ainda.</div>;
  }

  return (
    <ol className="mb2-fuel-timeline">
      {events.map((ev) => (
        <li key={ev.eventId} className="mb2-fuel-timeline__item" data-event={ev.eventType}>
          <span className="mb2-fuel-timeline__seq">#{ev.sequence}</span>
          <span className="mb2-fuel-timeline__type">{ev.eventType}</span>
          {ev.createdAt ? <span className="mb2-fuel-timeline__at">{ev.createdAt}</span> : null}
        </li>
      ))}
    </ol>
  );
}

export default ModeloBase2FuelEventTimeline;
