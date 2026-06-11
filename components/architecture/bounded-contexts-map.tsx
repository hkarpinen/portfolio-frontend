/**
 * <BoundedContextsMap> — DDD/IDesign view of the system for /about/architecture.
 *
 * Five services around the RabbitMQ spine. Each context shows what it OWNS
 * (real aggregates from src/Domain/Aggregates/) and what it PUBLISHES.
 * Notifications hangs off the bus as a pure consumer.
 *
 * Layout: top row -> 160px gap -> bus -> 140px gap -> bottom row. Labels for
 * each connector are anchored at the MIDPOINT of the connector line and
 * sit in the gap between box and bus — never inside a box.
 *
 * Companion to <LifecycleRibbon>; both live on /about/architecture.
 */

const INK = "var(--ink)";
const INK_2 = "var(--ink-2)";
const INK_3 = "var(--ink-3)";
const PAPER = "var(--paper)";
const PAPER_2 = "var(--paper-2)";
const RED = "var(--red)";
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
const SERIF = 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';

/** Layout constants — single source of truth. */
const VB_W = 1340;
const VB_H = 880;
const BOX_W = 320;
const BOX_H = 200;
const HEADER_H = 36;
const TOP_BOX_Y = 60;
const BUS_Y = 420;
const BUS_H = 60;
const BOTTOM_BOX_Y = 620;
// Horizontal x for each box's left edge
const LEFT_X = 60;
const RIGHT_X = VB_W - BOX_W - LEFT_X; // 960

function DomainBox({
  x,
  y,
  service,
  owns,
  drawnAround,
}: {
  x: number;
  y: number;
  service: string;
  owns: string[];
  drawnAround: string;
}) {
  return (
    <g>
      {/* outer frame */}
      <rect x={x} y={y} width={BOX_W} height={BOX_H} fill={PAPER} stroke={INK} strokeWidth={2.25} />
      {/* header band */}
      <rect x={x} y={y} width={BOX_W} height={HEADER_H} fill={INK} />
      <text
        x={x + 16}
        y={y + HEADER_H / 2 + 5}
        fontFamily={MONO}
        fontSize={15}
        fontWeight={700}
        fill={PAPER}
        style={{ letterSpacing: "0.22em", textTransform: "uppercase" }}
      >
        {service}
      </text>

      {/* OWNS kicker */}
      <text
        x={x + 16}
        y={y + HEADER_H + 24}
        fontFamily={MONO}
        fontSize={11}
        fontWeight={700}
        fill={RED}
        style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}
      >
        Owns
      </text>

      {/* aggregate list */}
      {owns.map((agg, i) => (
        <text
          key={agg}
          x={x + 16}
          y={y + HEADER_H + 46 + i * 19}
          fontFamily={MONO}
          fontSize={13}
          fontWeight={500}
          fill={INK}
        >
          {agg}
        </text>
      ))}

      {/* footer rule + "drawn around" italic */}
      <line
        x1={x + 16}
        y1={y + BOX_H - 34}
        x2={x + BOX_W - 16}
        y2={y + BOX_H - 34}
        stroke={INK}
        strokeOpacity={0.15}
        strokeWidth={1}
      />
      <text
        x={x + 16}
        y={y + BOX_H - 14}
        fontFamily={SERIF}
        fontSize={13}
        fontStyle="italic"
        fill={INK_2}
      >
        drawn around{" "}
        <tspan fontWeight={700} fill={INK} fontStyle="italic">
          {drawnAround}
        </tspan>
      </text>
    </g>
  );
}

/**
 * Vertical-only arrow with labels in the GAP between endpoints.
 * Labels anchored at the midpoint of the line, never at the endpoints.
 */
function VerticalConnector({
  x,
  yStart,
  yEnd,
  events,
  direction,
  labelAnchor = "start",
}: {
  x: number;
  yStart: number;
  yEnd: number;
  events: string[];
  direction: "publish" | "consume";
  /** "start" = labels render to the RIGHT of the line. "end" = LEFT. */
  labelAnchor?: "start" | "end";
}) {
  const head = 8;
  const stroke = direction === "publish" ? RED : INK;
  const goingDown = yEnd > yStart;

  // Line: from yStart to (yEnd - head) so the arrowhead sits at yEnd
  const tipY = yEnd;
  const lineEndY = goingDown ? yEnd - head : yEnd + head;

  const arrowhead = goingDown
    ? `${x},${tipY} ${x - head / 1.6},${tipY - head} ${x + head / 1.6},${tipY - head}`
    : `${x},${tipY} ${x - head / 1.6},${tipY + head} ${x + head / 1.6},${tipY + head}`;

  // Label block: vertically centered on the midpoint of the line
  const midY = (yStart + yEnd) / 2;
  const VERB_FONT = 11;
  const VERB_TO_EVENT_GAP = 8;
  const EVENT_FONT = 13;
  const LINE_HEIGHT = 18;
  const verbLineH = VERB_FONT + 4;
  const eventsBlockH = events.length > 0 ? VERB_TO_EVENT_GAP + events.length * LINE_HEIGHT : 0;
  const totalBlockH = verbLineH + eventsBlockH;
  const blockTop = midY - totalBlockH / 2;
  const verbBaselineY = blockTop + VERB_FONT;

  const verb = direction === "publish" ? "publishes" : "consumes";
  const labelOffsetX = labelAnchor === "start" ? 12 : -12;
  const labelX = x + labelOffsetX;

  return (
    <g>
      <line
        x1={x}
        y1={yStart}
        x2={x}
        y2={lineEndY}
        stroke={stroke}
        strokeWidth={2}
        strokeDasharray={direction === "consume" ? "6 4" : undefined}
      />
      <polygon points={arrowhead} fill={stroke} />

      <text
        x={labelX}
        y={verbBaselineY}
        textAnchor={labelAnchor}
        fontFamily={MONO}
        fontSize={VERB_FONT}
        fontWeight={700}
        fill={direction === "publish" ? RED : INK_3}
        style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}
      >
        {verb}
      </text>
      {events.map((evt, i) => (
        <text
          key={evt}
          x={labelX}
          y={verbBaselineY + VERB_TO_EVENT_GAP + (i + 1) * LINE_HEIGHT}
          textAnchor={labelAnchor}
          fontFamily={MONO}
          fontSize={EVENT_FONT}
          fill={INK_2}
        >
          {evt}
        </text>
      ))}
    </g>
  );
}

export function BoundedContextsMap() {
  // Connector x-positions chosen to keep label blocks inside box width.
  // Left-side connectors: anchor="start", labels extend rightward.
  // Right-side connectors: anchor="end", labels extend leftward.
  const LEFT_CONN_X = LEFT_X + 80; // 140 — leaves ~180px of label room
  const RIGHT_CONN_X = RIGHT_X + BOX_W - 80; // 1220 — labels extend leftward

  return (
    <figure className="flex flex-col gap-8">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          role="img"
          aria-labelledby="contexts-map-title contexts-map-desc"
          className="h-auto w-full min-w-[760px]"
          style={{ background: PAPER }}
        >
          <title id="contexts-map-title">Bounded contexts and the RabbitMQ spine</title>
          <desc id="contexts-map-desc">
            Five services arranged around a central RabbitMQ bus. Identity and Household across the
            top; Finance and Forum across the bottom; Notifications hanging off the bus as a pure
            consumer. Each service shows its aggregates and the events it publishes.
          </desc>

          {/* Section kicker */}
          <text
            x={VB_W / 2}
            y={36}
            textAnchor="middle"
            fontFamily={MONO}
            fontSize={13}
            fontWeight={700}
            fill={RED}
            style={{ letterSpacing: "0.28em", textTransform: "uppercase" }}
          >
            Five bounded contexts · one message spine
          </text>

          {/* ── Top row ─────────────────────────────────────────── */}
          <DomainBox
            x={LEFT_X}
            y={TOP_BOX_Y}
            service="Identity"
            owns={["User", "UserRole", "Contact"]}
            drawnAround="who you are"
          />
          <DomainBox
            x={RIGHT_X}
            y={TOP_BOX_Y}
            service="Household"
            owns={["Household", "Membership", "Chore", "CalendarEvent"]}
            drawnAround="people who share a home"
          />

          {/* ── Central bus ─────────────────────────────────────── */}
          <rect
            x={LEFT_X}
            y={BUS_Y}
            width={VB_W - 2 * LEFT_X}
            height={BUS_H}
            rx={BUS_H / 2}
            fill={PAPER_2}
            stroke={RED}
            strokeWidth={2.5}
          />
          <text
            x={VB_W / 2}
            y={BUS_Y + BUS_H / 2 + 8}
            textAnchor="middle"
            fontFamily={MONO}
            fontSize={22}
            fontWeight={700}
            fill={RED}
            style={{ letterSpacing: "0.36em" }}
          >
            R A B B I T M Q
          </text>

          {/* -- Top boxes -> bus (publish, downward) -- */}
          <VerticalConnector
            x={LEFT_CONN_X}
            yStart={TOP_BOX_Y + BOX_H}
            yEnd={BUS_Y}
            events={["UserRegistered", "UserProfileUpdated", "UserBanned"]}
            direction="publish"
            labelAnchor="start"
          />
          <VerticalConnector
            x={RIGHT_CONN_X}
            yStart={TOP_BOX_Y + BOX_H}
            yEnd={BUS_Y}
            events={["MemberJoined", "MemberLeft", "OwnershipTransferred"]}
            direction="publish"
            labelAnchor="end"
          />

          {/* ── Bottom row ─────────────────────────────────────── */}
          <DomainBox
            x={LEFT_X}
            y={BOTTOM_BOX_Y}
            service="Finance"
            owns={[
              "Expense  ·  ExpenseSplit",
              "IncomeSource",
              "FinancialConnection",
              "FinancialTransaction",
            ]}
            drawnAround="money"
          />
          <DomainBox
            x={RIGHT_X}
            y={BOTTOM_BOX_Y}
            service="Forum"
            owns={[
              "Thread  ·  Comment  ·  Vote",
              "Community  ·  Membership",
              "ModerationLog  ·  Report",
            ]}
            drawnAround="public speech"
          />

          {/* -- Bottom boxes -> bus (publish, upward) -- */}
          <VerticalConnector
            x={LEFT_CONN_X}
            yStart={BOTTOM_BOX_Y}
            yEnd={BUS_Y + BUS_H}
            events={["ExpenseCreated", "ExpenseSplitPaid", "IncomeSourceCreated"]}
            direction="publish"
            labelAnchor="start"
          />
          <VerticalConnector
            x={RIGHT_CONN_X}
            yStart={BOTTOM_BOX_Y}
            yEnd={BUS_Y + BUS_H}
            events={["ThreadCreated", "CommentCreated", "VoteCast"]}
            direction="publish"
            labelAnchor="end"
          />

          {/* ── Notifications — hangs off the bus, consumer-only ─ */}
          <g>
            <rect
              x={(VB_W - BOX_W) / 2}
              y={BOTTOM_BOX_Y}
              width={BOX_W}
              height={BOX_H}
              fill={PAPER}
              stroke={INK}
              strokeWidth={2.25}
              strokeDasharray="6 4"
            />
            <rect
              x={(VB_W - BOX_W) / 2}
              y={BOTTOM_BOX_Y}
              width={BOX_W}
              height={HEADER_H}
              fill={INK}
            />
            <text
              x={(VB_W - BOX_W) / 2 + 16}
              y={BOTTOM_BOX_Y + HEADER_H / 2 + 5}
              fontFamily={MONO}
              fontSize={15}
              fontWeight={700}
              fill={PAPER}
              style={{ letterSpacing: "0.22em" }}
            >
              NOTIFICATIONS
            </text>
            <text
              x={(VB_W - BOX_W) / 2 + 16}
              y={BOTTOM_BOX_Y + HEADER_H + 24}
              fontFamily={MONO}
              fontSize={11}
              fontWeight={700}
              fill={RED}
              style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}
            >
              Consumes only
            </text>
            <text
              x={(VB_W - BOX_W) / 2 + 16}
              y={BOTTOM_BOX_Y + HEADER_H + 56}
              fontFamily={SERIF}
              fontSize={13}
              fontStyle="italic"
              fill={INK_2}
            >
              No aggregates. A pure projector —
            </text>
            <text
              x={(VB_W - BOX_W) / 2 + 16}
              y={BOTTOM_BOX_Y + HEADER_H + 76}
              fontFamily={SERIF}
              fontSize={13}
              fontStyle="italic"
              fill={INK_2}
            >
              fans out push notifications from
            </text>
            <text
              x={(VB_W - BOX_W) / 2 + 16}
              y={BOTTOM_BOX_Y + HEADER_H + 96}
              fontFamily={SERIF}
              fontSize={13}
              fontStyle="italic"
              fill={INK_2}
            >
              every other service&apos;s events.
            </text>
          </g>

          {/* -- Bus -> Notifications (consume, dashed, downward) -- */}
          <VerticalConnector
            x={VB_W / 2}
            yStart={BUS_Y + BUS_H}
            yEnd={BOTTOM_BOX_Y}
            events={[]}
            direction="consume"
            labelAnchor="start"
          />

          {/* ── Footnote axis (well below bottom boxes) ───────── */}
          <text
            x={LEFT_X}
            y={VB_H - 10}
            fontFamily={MONO}
            fontSize={11}
            fontWeight={700}
            fill={INK_3}
            style={{ letterSpacing: "0.16em", textTransform: "uppercase" }}
          >
            Solid arrows publish · dashed arrows consume · two more services (Geography, Math) live
            off-bus
          </text>
        </svg>
      </div>

      {/* Legend / takeaways below the diagram */}
      <div className="grid grid-cols-1 gap-x-10 gap-y-6 border-t border-[color:var(--rule-soft)] pt-4 md:grid-cols-3">
        <div>
          <p
            className="font-700 mb-2 font-mono text-sm uppercase tracking-[0.18em]"
            style={{ color: RED }}
          >
            Volatility, not function
          </p>
          <p
            style={{
              fontFamily: "var(--ff-body)",
              fontSize: "1rem",
              lineHeight: 1.55,
              color: INK_2,
            }}
          >
            Each box is drawn around a thing that&apos;s likely to change together — not a noun.
            Finance owns the rules of money; Household owns the people who share it. They never
            touch each other&apos;s tables.
          </p>
        </div>
        <div>
          <p
            className="font-700 mb-2 font-mono text-sm uppercase tracking-[0.18em]"
            style={{ color: RED }}
          >
            One database per context
          </p>
          <p
            style={{
              fontFamily: "var(--ff-body)",
              fontSize: "1rem",
              lineHeight: 1.55,
              color: INK_2,
            }}
          >
            Every service has its own Postgres schema and its own outbox. Cross-service reads are
            forbidden — if Forum needs a display name, it keeps a projection populated by Identity
            events.
          </p>
        </div>
        <div>
          <p
            className="font-700 mb-2 font-mono text-sm uppercase tracking-[0.18em]"
            style={{ color: RED }}
          >
            No integration-event layer
          </p>
          <p
            style={{
              fontFamily: "var(--ff-body)",
              fontSize: "1rem",
              lineHeight: 1.55,
              color: INK_2,
            }}
          >
            Consumers bind to the publisher&apos;s own domain event types (e.g.{" "}
            <code style={{ wordBreak: "break-word" }}>Finance.Domain.Events.ExpenseCreated</code>) —
            no shared contracts NuGet, no mapping shim. The bus carries the real thing.
          </p>
        </div>
      </div>
    </figure>
  );
}
