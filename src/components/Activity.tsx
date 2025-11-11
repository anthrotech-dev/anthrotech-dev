import { useState, useEffect, useMemo } from 'react';

export type ActivityHeatmapProps = {
    id: string;
};

type ActivityMap = Record<string, number>;
interface ActivityData {
    id: string,
    user_id: string,
    timestamp: string,
    type: string
    body: string
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKS = 53; // GitHub shows ~53 weeks
const CELL = 12; // px size per day square
const GAP = 2; // px gap between squares/columns
const TOP = 24; // space for month labels
const LEFT_LABEL_PAD = 16; // space for weekday labels

// GitHub-like green palette
const PALETTE = ["#ebedf0", "#965ED1", "#7333B8", "#5426A3", "#2000B1"]; // 0..4

// Helper: format date to YYYY-MM-DD in local time
function fmt(d: Date) {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const da = `${d.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${da}`;
}


// Start from the nearest previous Sunday to (today - 52 weeks)
function computeStartDate(today: Date) {
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // strip time
    const start = new Date(end.getTime() - (WEEKS - 1) * 7 * DAY_MS);
    // shift back to Sunday
    const dow = start.getDay(); // 0=Sun
    start.setDate(start.getDate() - dow);
    return start;
}


function getMonthLabel(d: Date) {
    return d.toLocaleString(undefined, { month: "short" });
}


function getColorLevel(v: number, max: number) {
    if (!v || v <= 0) return 0;
    if (max <= 1) return 4; // all active -> darkest
    // Quantize into 4 bins (1..4)
    const q = Math.ceil((v / max) * 4);
    return Math.min(4, Math.max(1, q));
}

export default function ActivityHeatmap({ id }: ActivityHeatmapProps) {

    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedActivity, setSelectedActivity] = useState<ActivityData[] | null>(null);
    const [data, setData] = useState<ActivityMap>({});

    useEffect(() => {
        const ac = new AbortController();
        async function run() {
            try {
                const res = await fetch(`https://activity.anthrotech.dev/${encodeURIComponent(id)}`,
                { signal: ac.signal, headers: { Accept: "application/json" } });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json: ActivityMap = await res.json();
                setData(json || {});
            } catch (e: any) {
                if (e.name === "AbortError") return;
                console.error("Failed to fetch activity data:", e);
            }
        }
        run();
        return () => ac.abort();
    }, [id]);

    useEffect(() => {
        if (!selectedDate) {
            setSelectedActivity(null);
            return;
        }
        const ac = new AbortController();
        async function run() {
            try {
                const res = await fetch(`https://activity.anthrotech.dev/${encodeURIComponent(id)}/${encodeURIComponent(selectedDate!)}`,
                { signal: ac.signal, headers: { Accept: "application/json" } });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json: ActivityData[] = await res.json();
                setSelectedActivity(json || []);
            } catch (e: any) {
                if (e.name === "AbortError") return;
                console.error("Failed to fetch activity data for date:", e);
            }
        }
        run();
        return () => ac.abort();
    }, [selectedDate]);


    const today = useMemo(() => new Date(), []);
    const startDate = useMemo(() => computeStartDate(today), [today]);


    // Build a 53x7 matrix of dates
    const weeks = useMemo(() => {
        const columns: Date[][] = [];
        let d = new Date(startDate);
        for (let w = 0; w < WEEKS; w++) {
            const col: Date[] = [];
            for (let i = 0; i < 7; i++) {
                col.push(new Date(d));
                d = new Date(d.getTime() + DAY_MS);
            }
            columns.push(col);
        }
        return columns;
    }, [startDate]);


    // Compute max count for scaling
    const max = useMemo(() => {
        let m = 0;
        for (const k in data) m = Math.max(m, data[k] || 0);
        return m;
    }, [data]);


    // Month labels: when the first day of a column is a new month (compared to previous column)
        const monthLabels = useMemo(() => {
        const labels: { x: number; text: string }[] = [];
        let prevMonth = -1;
        weeks.forEach((col, w) => {
            const first = col[0];
            const month = first.getMonth();
            if (month !== prevMonth) {
                labels.push({ x: LEFT_LABEL_PAD + w * (CELL + GAP), text: getMonthLabel(first) });
                prevMonth = month;
            }
        });
        return labels;
    }, [weeks]);


    const width = LEFT_LABEL_PAD + WEEKS * (CELL + GAP);
    const height = TOP + 7 * (CELL + GAP);

    return (
        <div>
            <svg width={width} height={height} role="img" aria-label={`Activity for ${id}`}>
                {/* Month labels */}
                {monthLabels.map((m, i) => (
                    <text key={i} x={m.x} y={12} fontSize={10} fill="#666">{m.text}</text>
                ))}


                {/* Weekday labels (Mon/Wed/Fri to avoid clutter) */}
                {([1, 3, 5] as const).map((dow) => (
                    <text key={dow} x={0} y={TOP + dow * (CELL + GAP) + 8} fontSize={10} fill="#666">
                        {new Date(2025, 0, dow + 5).toLocaleString(undefined, { weekday: "short" }).slice(0, 2)}
                    </text>
                ))}

                {/* Heatmap cells */}
                <g transform={`translate(${LEFT_LABEL_PAD}, ${TOP})`}>
                {weeks.map((col, w) => (
                    <g key={w} transform={`translate(${w * (CELL + GAP)}, 0)`}>
                    {col.map((d, i) => {
                        const key = fmt(d);
                        const v = data[key] || 0;
                        const lvl = getColorLevel(v, max);
                        const color = PALETTE[lvl];
                        const isFuture = d > today;
                        return (
                            <rect
                                key={i}
                                x={0}
                                y={i * (CELL + GAP)}
                                width={CELL}
                                height={CELL}
                                rx={2}
                                ry={2}
                                fill={isFuture ? "#f5f5f5" : color}
                                stroke="#e5e7eb"
                                strokeWidth={1}
                                onClick={() => {
                                    setSelectedDate(key);
                                }}
                            >
                                <title>
                                {`${key}: ${v} activit${v === 1 ? "y" : "ies"}`}
                                </title>
                            </rect>
                        );
                    })}
                    </g>
                ))}
                </g>
            </svg>
            {selectedActivity && (
                <div
                    style={{ marginBottom: "1em" }}
                >
                    <h3>Activities on {selectedDate}:</h3>
                    <ul>
                        {selectedActivity.map((act, idx) => (
                            <li key={idx}>
                                <strong>{act.type}</strong> at {new Date(act.timestamp).toLocaleTimeString()}: {act.body}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );


}
