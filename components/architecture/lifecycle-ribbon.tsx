/**
 * <LifecycleRibbon> — full-width architecture diagram for /about/architecture.
 *
 * The "story" version of what the landing teaser hints at. Traces one
 * domain event (ExpenseCreated) from a user tap all the way to two
 * downstream consumers, including the transactional outbox detour through
 * Postgres. Every label here is real — event class names match
 * Finance.Domain.Events; consumer behaviors match what's wired up.
 *
 * Numbered steps below the diagram annotate each hop with a short
 * paragraph. The diagram itself is pure SVG so it scales and screenshots
 * cleanly; the annotations are HTML for typographic control.
 *
 * Typography is sized for editorial weight — labels are 17pt inside the
 * viewBox so they render at a comfortable read at typical widths.
 */

const INK = "var(--ink)";
const INK_2 = "var(--ink-2)";
const INK_3 = "var(--ink-3)";
const PAPER = "var(--paper)";
const RED = "var(--red)";
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

function Node({
  x,
  y,
  w,
  h,
  label,
  sub,
  accent = false,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  accent?: boolean;
}) {
  const stroke = accent ? RED : INK;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={accent ? h / 2 : 4}
        fill={PAPER}
        stroke={stroke}
        strokeWidth={2.25}
      />
      <text
        x={x + w / 2}
        y={sub ? y + h / 2 - 2 : y + h / 2 + 6}
        textAnchor="middle"
        fontFamily={MONO}
        fontSize={17}
        fontWeight={700}
        fill={stroke}
        style={{ letterSpacing: "0.08em" }}
      >
        {label}
      </text>
      {sub && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 18}
          textAnchor="middle"
          fontFamily={MONO}
          fontSize={12}
          fill={INK_3}
          style={{ letterSpacing: "0.06em" }}
        >
          {sub}
        </text>
      )}
    </g>
  );
}

function ArrowH({
  x1,
  x2,
  y,
  label,
  dashed = false,
  accent = false,
}: {
  x1: number;
  x2: number;
  y: number;
  label?: string;
  dashed?: boolean;
  accent?: boolean;
}) {
  const head = 8;
  const stroke = accent ? RED : INK;
  return (
    <g>
      {label && (
        <text
          x={(x1 + x2) / 2}
          y={y - 12}
          textAnchor="middle"
          fontFamily={MONO}
          fontSize={12}
          fontWeight={700}
          fill={accent ? RED : INK_3}
          style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}
        >
          {label}
        </text>
      )}
      <line
        x1={x1}
        y1={y}
        x2={x2 - head}
        y2={y}
        stroke={stroke}
        strokeWidth={2}
        strokeDasharray={dashed ? "6 4" : undefined}
      />
      <polygon
        points={`${x2},${y} ${x2 - head},${y - head / 1.6} ${x2 - head},${y + head / 1.6}`}
        fill={stroke}
      />
    </g>
  );
}

function ArrowPath({
  points,
  label,
  labelXY,
  dashed = false,
  accent = false,
}: {
  points: [number, number][];
  label?: string;
  labelXY?: [number, number];
  dashed?: boolean;
  accent?: boolean;
}) {
  const head = 8;
  const stroke = accent ? RED : INK;
  // `points` is the caller's segment polyline; this component is only
  // ever called with ≥2 points (the arrow head needs the last two), so
  // the non-null assertions are sound. Skip rendering instead of
  // crashing if a caller ever violates that.
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  if (!last || !prev) return null;
  const [px, py] = last;
  const [qx, qy] = prev;
  const dx = px - qx;
  const dy = py - qy;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const lineEndX = px - ux * head;
  const lineEndY = py - uy * head;
  const polyPoints =
    points
      .slice(0, -1)
      .map(([x, y]) => `${x},${y}`)
      .join(" ") + ` ${lineEndX},${lineEndY}`;
  const perpX = -uy;
  const perpY = ux;
  const baseX = px - ux * head;
  const baseY = py - uy * head;
  const aX = baseX + perpX * (head / 1.8);
  const aY = baseY + perpY * (head / 1.8);
  const bX = baseX - perpX * (head / 1.8);
  const bY = baseY - perpY * (head / 1.8);
  return (
    <g>
      {label && labelXY && (
        <text
          x={labelXY[0]}
          y={labelXY[1]}
          textAnchor="middle"
          fontFamily={MONO}
          fontSize={12}
          fontWeight={700}
          fill={accent ? RED : INK_3}
          style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}
        >
          {label}
        </text>
      )}
      <polyline
        points={polyPoints}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeDasharray={dashed ? "6 4" : undefined}
      />
      <polygon points={`${px},${py} ${aX},${aY} ${bX},${bY}`} fill={stroke} />
    </g>
  );
}

const STEPS = [
  {
    n: "01",
    title: "You tap “Add expense”",
    body: "The browser fires an HTTP POST to /api/expenses. Nginx forwards it to the Finance service — no other service is involved in the request thread.",
  },
  {
    n: "02",
    title: "Finance writes in one transaction",
    body: "The handler inserts the Expense aggregate AND an outbox row (the serialized ExpenseCreated event) in the same Postgres transaction. If either fails, both roll back — the bus never sees a phantom event.",
  },
  {
    n: "03",
    title: "OutboxPublisher dispatches",
    body: "A background poller in Finance picks up unpublished outbox rows and hands them to RabbitMQ. The publish is decoupled from the user request — the user already got their 201.",
  },
  {
    n: "04",
    title: "RabbitMQ fans out",
    body: "A topic exchange routes the message to every queue bound to finance.expense.recorded. Each consuming service has its own queue, prefixed with the service name so they don’t compete.",
  },
  {
    n: "05",
    title: "Household appends to the activity feed",
    body: "Household’s consumer checks HouseholdId; if the expense is household-scoped, it writes a row to the activity feed and marks the event processed (idempotency table). If not, it drops the message.",
  },
  {
    n: "06",
    title: "Notifications fans out to members",
    body: "Notifications looks up every member of the household, inserts a Notification row per member, and emits a push. No shared library — both consumers declare matching types in Finance.Domain.Events.",
  },
];

export function LifecycleRibbon() {
  return (
    <figure className="flex flex-col gap-8">
      <div className="overflow-x-auto">
        <svg
          viewBox="0 0 1480 500"
          role="img"
          aria-labelledby="lifecycle-ribbon-title lifecycle-ribbon-desc"
          className="h-auto w-full min-w-[760px]"
          style={{ background: PAPER }}
        >
          <title id="lifecycle-ribbon-title">Lifecycle of an ExpenseCreated domain event</title>
          <desc id="lifecycle-ribbon-desc">
            A user tap travels through Nginx to the Finance service, which writes an Expense and an
            outbox row in one Postgres transaction. The OutboxPublisher dispatches the event to
            RabbitMQ, which fans out to Household and Notifications consumers.
          </desc>

          {/* Step numbers above each major column. The 05/06 kicker sits
              at x=1100 — clear of HOUSEHOLD (x=1200-1450) which extends
              upward into the kicker row. */}
          {[
            { x: 85, label: "01" },
            { x: 410, label: "02" },
            { x: 630, label: "03" },
            { x: 880, label: "04" },
            { x: 1100, label: "05 / 06" },
          ].map((s) => (
            <text
              key={s.label}
              x={s.x}
              y={36}
              textAnchor="middle"
              fontFamily={MONO}
              fontSize={13}
              fontWeight={700}
              fill={RED}
              style={{ letterSpacing: "0.22em" }}
            >
              No. {s.label}
            </text>
          ))}

          {/* ── Top row: request path ──────────────────────────── */}
          <Node x={30} y={70} w={110} h={64} label="BROWSER" sub="you" />
          <ArrowH x1={140} x2={230} y={102} label="HTTP" />
          <Node x={230} y={70} w={110} h={64} label="NGINX" sub=":443" />
          <ArrowH x1={340} x2={430} y={102} label="ROUTE" />
          <Node x={430} y={70} w={150} h={64} label="FINANCE" sub="POST /expenses" />
          <ArrowH x1={580} x2={670} y={102} label="OUTBOX TX" dashed />
          <Node x={670} y={70} w={170} h={64} label="OUTBOX" sub="publisher (poll)" />
          <ArrowH x1={840} x2={940} y={102} label="PUBLISH" accent />
          <Node x={940} y={70} w={220} h={64} label="RABBITMQ" sub="topic exchange" accent />

          {/* Consumers on the right, stacked */}
          <Node x={1200} y={20} w={250} h={56} label="HOUSEHOLD" sub="activity-feed consumer" />
          <Node x={1200} y={130} w={250} h={56} label="NOTIFICATIONS" sub="fanout consumer" />

          {/* -- Finance -> Postgres (write) -- */}
          <Node x={430} y={290} w={150} h={64} label="POSTGRES" sub="expense + outbox" />
          <ArrowPath
            points={[
              [505, 134],
              [505, 290],
            ]}
            label="INSERT (one tx)"
            labelXY={[600, 220]}
          />

          {/* -- Postgres -> OutboxPublisher (poll, dashed) -- */}
          <ArrowPath
            points={[
              [580, 320],
              [755, 320],
              [755, 134],
            ]}
            label="poll unsent"
            labelXY={[670, 312]}
            dashed
          />

          {/* -- RabbitMQ -> two consumers (fan out, accent) -- */}
          <ArrowPath
            points={[
              [1160, 90],
              [1185, 90],
              [1185, 48],
              [1200, 48],
            ]}
            accent
          />
          <ArrowPath
            points={[
              [1160, 114],
              [1185, 114],
              [1185, 158],
              [1200, 158],
            ]}
            accent
          />

          {/* Event name floating under the bus */}
          <text
            x={1050}
            y={210}
            textAnchor="middle"
            fontFamily={MONO}
            fontSize={14}
            fontWeight={700}
            fill={RED}
            style={{ letterSpacing: "0.08em" }}
          >
            finance.expense.recorded
          </text>
          <text
            x={1050}
            y={230}
            textAnchor="middle"
            fontFamily={MONO}
            fontSize={12}
            fill={INK_3}
            style={{ letterSpacing: "0.06em" }}
          >
            Finance.Domain.Events.ExpenseCreated
          </text>

          {/* Faint axis labels at the bottom */}
          <line
            x1={30}
            y1={460}
            x2={1290}
            y2={460}
            stroke={INK}
            strokeOpacity={0.15}
            strokeWidth={1}
          />
          <text
            x={200}
            y={482}
            textAnchor="middle"
            fontFamily={MONO}
            fontSize={11}
            fontWeight={700}
            fill={INK_3}
            style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}
          >
            {"<-- request thread -->"}
          </text>
          <text
            x={660}
            y={482}
            textAnchor="middle"
            fontFamily={MONO}
            fontSize={11}
            fontWeight={700}
            fill={INK_3}
            style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}
          >
            {"<-- background dispatch -->"}
          </text>
          <text
            x={1120}
            y={482}
            textAnchor="middle"
            fontFamily={MONO}
            fontSize={11}
            fontWeight={700}
            fill={INK_3}
            style={{ letterSpacing: "0.18em", textTransform: "uppercase" }}
          >
            {"<-- independent consumers -->"}
          </text>
        </svg>
      </div>

      <figcaption className="sr-only">
        Lifecycle of one ExpenseCreated event, end to end. Step annotations below.
      </figcaption>

      {/* Step annotations — body type, two-column on wide screens */}
      <ol className="grid grid-cols-1 gap-x-10 gap-y-7 border-t border-[color:var(--rule-soft)] pt-4 md:grid-cols-2">
        {STEPS.map((s) => (
          <li key={s.n} className="flex gap-5">
            <span
              className="font-700 shrink-0 pt-1 font-mono text-sm uppercase tracking-[0.18em]"
              style={{ color: RED, minWidth: "3rem" }}
              aria-hidden="true"
            >
              No. {s.n}
            </span>
            <div>
              <h3 className="ed-h4 mb-2 leading-tight">{s.title}</h3>
              <p
                style={{
                  fontFamily: "var(--ff-body)",
                  fontSize: "1rem",
                  lineHeight: 1.55,
                  color: INK_2,
                }}
              >
                {s.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </figure>
  );
}
