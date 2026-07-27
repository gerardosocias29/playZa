/**
 * Availability maths shared by the Check Availability UI.
 *
 * Mirrors the server-side conflict rules in
 * App\Http\Controllers\User\ReservationController::occupiedIntervals().
 * Keep the two in step — the client uses this to grey out slots and warn early,
 * the server uses its own copy as the authority.
 */

export const formatYMD = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

export const addDays = (dateStr, n) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return formatYMD(new Date(y, m - 1, d + n));
};

export const daysBetween = (a, b) => {
    const [y1, m1, d1] = a.split('-').map(Number);
    const [y2, m2, d2] = b.split('-').map(Number);
    return Math.round((new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / 86400000);
};

export const prettyDate = (dateStr, withYear = false) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        ...(withYear ? { year: 'numeric' } : {}),
    });
};

export const toMinutes = (time) => {
    const parts = String(time ?? '').split(':');
    return (Number(parts[0]) || 0) * 60 + (Number(parts[1]) || 0);
};

/** Absolute hour (may exceed 24 when overnight) -> "9:00 AM". */
export const hourLabel = (absHour, tagNextDay = false) => {
    const h = ((absHour % 24) + 24) % 24;
    const suffix = h < 12 ? 'AM' : 'PM';
    return `${h % 12 || 12}:00 ${suffix}${tagNextDay ? ' (+1 day)' : ''}`;
};

export const padTime = (absHour) => `${String(((absHour % 24) + 24) % 24).padStart(2, '0')}:00`;

/**
 * Minute windows a booking occupies *within* one calendar day, accounting for
 * multi-day ranges and overnight wraps.
 *
 * @returns {Array<{s: number, e: number}>}
 */
export const windowsOnDate = (item, dateStr) => {
    const first = item.reservation_date ?? item.date;
    if (!first) return [];
    const last = item.end_date ?? first;

    const startMin = toMinutes(item.start_time);
    let endMin = toMinutes(item.end_time);
    if (endMin === 0) endMin = 1440; // "00:00" as an end means midnight
    const wraps = endMin <= startMin;
    const spanEnd = wraps ? endMin + 1440 : endMin;

    const out = [];
    if (dateStr >= first && dateStr <= last) {
        out.push({ s: startMin, e: Math.min(spanEnd, 1440) });
    }
    if (wraps) {
        const previous = addDays(dateStr, -1);
        if (previous >= first && previous <= last) {
            out.push({ s: 0, e: spanEnd - 1440 });
        }
    }
    return out.filter((w) => w.e > w.s);
};

/**
 * Busy windows on one date for one facility, from reservations and blocked
 * schedule rows.
 *
 * @returns {Array<{s: number, e: number, type: 'taken'|'blocked'}>}
 */
export const busyWindowsFor = (facilityId, dateStr, reservations = [], schedules = []) => {
    const out = [];
    const sameFacility = (row) => String(row.facility_id ?? row.facilityId) === String(facilityId);

    reservations.forEach((r) => {
        if (!sameFacility(r)) return;
        if (r.status !== 'approved' && r.status !== 'pending') return;
        windowsOnDate(r, dateStr).forEach((w) => out.push({ ...w, type: 'taken' }));
    });

    schedules.forEach((s) => {
        if (!sameFacility(s)) return;
        if (s.status === 'available') return;
        windowsOnDate({ ...s, reservation_date: s.date }, dateStr).forEach((w) =>
            out.push({ ...w, type: 'blocked' })
        );
    });

    return out;
};

/**
 * How booked a day is, for the calendar dots.
 *
 * @returns {'past'|'open'|'limited'|'full'}
 */
export const dayLevelFor = (dateStr, busy, today, currentHour) => {
    if (dateStr < today) return 'past';

    const dayStart = dateStr === today ? Math.min(currentHour + 1, 24) * 60 : 0;
    if (dayStart >= 1440) return 'full';

    let covered = 0;
    let cursor = dayStart;
    [...busy]
        .map((w) => ({ s: Math.max(w.s, dayStart), e: w.e }))
        .filter((w) => w.e > w.s)
        .sort((a, b) => a.s - b.s)
        .forEach((w) => {
            if (w.e <= cursor) return;
            covered += w.e - Math.max(w.s, cursor);
            cursor = Math.max(cursor, w.e);
        });

    if (1440 - dayStart - covered <= 0) return 'full';
    return covered > 0 ? 'limited' : 'open';
};

/* ---------- calendar range picking ---------- */

/**
 * State machine behind the date-range calendar. Handles both gestures:
 * press-and-slide across days, and click-first-day then click-last-day.
 *
 * `anchor` is where a press began, `moved` marks a real drag (vs a plain click),
 * and `pendingStart` remembers a lone first click awaiting its partner.
 *
 * @typedef {{startDate: string, endDate: string, anchor: ?string,
 *            moved: boolean, dragging: boolean, pendingStart: ?string}} Selection
 */

export const newSelection = (dateStr) => ({
    startDate: dateStr,
    endDate: dateStr,
    anchor: null,
    moved: false,
    dragging: false,
    pendingStart: null,
});

/** Pointer pressed on a day. */
export const selectionBegin = (sel, dateStr, multi) => {
    if (!multi) {
        return { ...newSelection(dateStr) };
    }
    const chaining = sel.pendingStart && dateStr > sel.pendingStart;
    return {
        ...sel,
        startDate: chaining ? sel.pendingStart : dateStr,
        endDate: dateStr,
        anchor: dateStr,
        moved: false,
        dragging: true,
    };
};

/** Pointer slid onto a day while still held down. */
export const selectionExtend = (sel, dateStr, today) => {
    if (!sel.dragging || !sel.anchor) return sel;
    if (dateStr < today || dateStr === sel.endDate) return sel;

    const [from, to] = dateStr < sel.anchor ? [dateStr, sel.anchor] : [sel.anchor, dateStr];
    return { ...sel, moved: true, startDate: from, endDate: to };
};

/** Pointer released anywhere. */
export const selectionFinish = (sel) => {
    const completed = sel.moved || Boolean(sel.pendingStart && sel.anchor && sel.anchor > sel.pendingStart);
    return {
        ...sel,
        pendingStart: completed ? null : sel.anchor,
        dragging: false,
        anchor: null,
        moved: false,
    };
};

/**
 * First clash between a selection and existing bookings, or null when clear.
 * `endAbsHour` may exceed 24 to express an overnight finish.
 *
 * @returns {{date: string, type: 'taken'|'blocked'}|null}
 */
export const findConflict = ({ dates, startHour, endAbsHour, facilityId, reservations, schedules }) => {
    if (endAbsHour <= startHour) return null;

    for (const dateStr of dates) {
        const selStart = startHour * 60;
        const selEnd = endAbsHour * 60;

        const probes = [
            { date: dateStr, s: selStart, e: Math.min(selEnd, 1440) },
            ...(selEnd > 1440 ? [{ date: addDays(dateStr, 1), s: 0, e: selEnd - 1440 }] : []),
        ];

        for (const probe of probes) {
            if (probe.e <= probe.s) continue;
            const hit = busyWindowsFor(facilityId, probe.date, reservations, schedules).find(
                (w) => probe.s < w.e && probe.e > w.s
            );
            if (hit) return { date: probe.date, type: hit.type };
        }
    }
    return null;
};
