import React, { useEffect, useMemo, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    addDays,
    busyWindowsFor,
    dayLevelFor,
    daysBetween,
    findConflict,
    formatYMD,
    hourLabel,
    newSelection,
    padTime,
    prettyDate,
    selectionBegin,
    selectionExtend,
    selectionFinish,
} from '@/lib/availability';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const EVENT_TYPES = ['Graduation', 'Meeting', 'Wedding', 'Birthday', 'Others'];

const MODES = [
    { id: 'single', label: 'Single day', desc: 'One date' },
    { id: 'range', label: 'Multiple days', desc: 'Same time, date range' },
    { id: 'overnight', label: 'Overnight', desc: 'Crosses midnight' },
];

export default function AvailabilityModal({
    isOpen,
    onClose,
    facility,
    facilities = [],
    reservations = [],
    schedules = [],
    user = null,
}) {
    const { errors = {} } = usePage().props;

    const today = formatYMD(new Date());
    const currentHour = new Date().getHours();

    const [mode, setMode] = useState('single');
    const [facilityId, setFacilityId] = useState(facility?.id ?? null);
    const [startHour, setStartHour] = useState(8);
    const [endAbsHour, setEndAbsHour] = useState(17); // absolute hours from start-day midnight
    const [viewMonth, setViewMonth] = useState(() => new Date());
    const [selection, setSelection] = useState(() => newSelection(today));
    const { startDate, endDate } = selection;
    const [eventType, setEventType] = useState(EVENT_TYPES[1]);
    const [customEventName, setCustomEventName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const facilityList = facilities.length > 0 ? facilities : facility ? [facility] : [];
    const activeFacility =
        facilityList.find((f) => String(f.id) === String(facilityId)) || facility || facilityList[0] || null;

    /* ---------- busy data for the active facility ---------- */

    const busyOnDate = useMemo(
        () => (dateStr) =>
            activeFacility ? busyWindowsFor(activeFacility.id, dateStr, reservations, schedules) : [],
        [activeFacility?.id, reservations, schedules]
    );

    const dayLevel = (dateStr) => dayLevelFor(dateStr, busyOnDate(dateStr), today, currentHour);

    /* ---------- selection ---------- */

    const selectedDates = useMemo(() => {
        if (mode !== 'range') return [startDate];
        const span = Math.max(0, daysBetween(startDate, endDate));
        return Array.from({ length: span + 1 }, (_, i) => addDays(startDate, i));
    }, [mode, startDate, endDate]);

    const hoursPerDay = Math.max(0, endAbsHour - startHour);
    const totalHours = hoursPerDay * selectedDates.length;

    // First conflict between the current selection and existing bookings, if any.
    const conflict = useMemo(() => {
        if (!activeFacility || hoursPerDay <= 0) return null;
        return findConflict({
            dates: selectedDates,
            startHour,
            endAbsHour,
            facilityId: activeFacility.id,
            reservations,
            schedules,
        });
    }, [activeFacility?.id, selectedDates, startHour, endAbsHour, reservations, schedules, hoursPerDay]);

    const startsInPast = startDate === today && startHour <= currentHour;
    const canSubmit = Boolean(
        user && activeFacility && hoursPerDay > 0 && !conflict && !startsInPast && !submitting
    );

    /* ---------- effects ---------- */

    useEffect(() => {
        if (!isOpen) return;
        const initial = currentHour >= 22 ? addDays(today, 1) : today;
        setMode('single');
        setFacilityId(facility?.id ?? facilityList[0]?.id ?? null);
        setSelection(newSelection(initial));
        setStartHour(initial === today ? Math.min(currentHour + 1, 22) : 8);
        setEndAbsHour(initial === today ? Math.min(currentHour + 3, 24) : 17);
        setViewMonth(new Date());
        setCustomEventName('');
    }, [isOpen, facility?.id]);

    // Coming back to today from a future date can leave the start on an hour
    // that has already passed — nudge it forward so the select stays in sync.
    useEffect(() => {
        if (startDate !== today || startHour > currentHour) return;
        const next = Math.min(currentHour + 1, 23);
        setStartHour(next);
        setEndAbsHour((prev) => (mode === 'overnight' ? prev : prev <= next ? Math.min(next + 2, 24) : prev));
    }, [startDate, startHour, currentHour, today, mode]);

    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKeyDown);
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previous;
        };
    }, [isOpen, onClose]);

    const switchMode = (next) => {
        setMode(next);
        setSelection((sel) => newSelection(sel.startDate));
        if (next === 'overnight') {
            setStartHour(20);
            setEndAbsHour(27); // 3 AM next day
        } else {
            setStartHour(8);
            setEndAbsHour(17);
        }
    };

    /*
     * Range picking supports both gestures: press and slide across the days, or
     * click the first day then click the last. The state machine itself lives in
     * lib/availability.js so it can be tested without a browser.
     */
    const multiDay = mode === 'range';

    const beginSelect = (dateStr) => setSelection((sel) => selectionBegin(sel, dateStr, multiDay));
    const extendSelect = (dateStr) => setSelection((sel) => selectionExtend(sel, dateStr, today));

    useEffect(() => {
        if (!selection.dragging) return;
        const finish = () => setSelection(selectionFinish);
        window.addEventListener('pointerup', finish);
        window.addEventListener('pointercancel', finish);
        return () => {
            window.removeEventListener('pointerup', finish);
            window.removeEventListener('pointercancel', finish);
        };
    }, [selection.dragging]);

    const handleSubmit = () => {
        if (!canSubmit) return;
        setSubmitting(true);

        router.post(
            route('reservations.store'),
            {
                facility_id: activeFacility.id,
                reservation_date: startDate,
                end_date: mode === 'range' ? endDate : startDate,
                start_time: padTime(startHour),
                end_time: padTime(endAbsHour),
                duration_hours: totalHours,
                event_type: activeFacility.requires_event_type ? eventType : null,
                custom_event_name:
                    activeFacility.requires_event_type && eventType === 'Others' ? customEventName.trim() : null,
            },
            {
                preserveScroll: true,
                onSuccess: onClose,
                onFinish: () => setSubmitting(false),
            }
        );
    };

    /* ---------- calendar cells ---------- */

    const calendarDays = useMemo(() => {
        const year = viewMonth.getFullYear();
        const month = viewMonth.getMonth();
        const leading = new Date(year, month, 1).getDay();
        const total = new Date(year, month + 1, 0).getDate();

        return [
            ...Array.from({ length: leading }, () => null),
            ...Array.from({ length: total }, (_, i) => ({
                day: i + 1,
                dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
            })),
        ];
    }, [viewMonth]);

    const shiftMonth = (delta) => {
        setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
    };

    /* ---------- time options ---------- */

    const startOptions = Array.from({ length: 24 }, (_, h) => h).filter(
        (h) => !(startDate === today && h <= currentHour)
    );

    const endOptions =
        mode === 'overnight'
            ? Array.from({ length: 12 }, (_, i) => 25 + i) // 1 AM .. 12 PM next day
            : Array.from({ length: 24 - startHour }, (_, i) => startHour + 1 + i);

    if (!isOpen || !activeFacility) return null;

    const serverError = errors.start_time || errors.event_type || errors.reservation_date || errors.end_date;
    const timelineFrom = mode === 'overnight' ? 12 : 0;
    const timelineTo = mode === 'overnight' ? 36 : 24;
    const timelineSpan = timelineTo - timelineFrom;
    const ticks = mode === 'overnight' ? [12, 18, 24, 30, 36] : [0, 6, 12, 18, 24];

    const timelineWindows = busyOnDate(startDate)
        .map((w) => ({ ...w, s: w.s / 60, e: w.e / 60 }))
        .concat(
            busyOnDate(addDays(startDate, 1)).map((w) => ({
                ...w,
                s: w.s / 60 + 24,
                e: w.e / 60 + 24,
            }))
        )
        .filter((w) => w.e > timelineFrom && w.s < timelineTo);

    return (
        <div
            className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Check facility availability"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl max-h-[94vh] flex flex-col bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <header className="shrink-0 border-b border-slate-200 px-6 py-5 flex items-start justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0077CC]">
                            Check Availability
                        </p>
                        <h2 className="mt-1 text-xl font-title font-black text-[#0b1c30] truncate">
                            {activeFacility.name}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                        {facilityList.length > 1 && (
                            <div className="flex gap-1.5 flex-wrap">
                                {facilityList.map((f) => {
                                    const isActive = String(f.id) === String(activeFacility.id);
                                    return (
                                        <button
                                            key={f.id}
                                            type="button"
                                            onClick={() => setFacilityId(f.id)}
                                            className={`px-3 h-8 rounded-full border text-xs font-bold transition-colors ${
                                                isActive
                                                    ? 'border-[#0b1c30] bg-[#0b1c30] text-white'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                            }`}
                                        >
                                            {f.name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="h-8 w-8 shrink-0 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-[#0b1c30] hover:bg-slate-50 transition-colors flex items-center justify-center"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Mode switcher */}
                <div className="shrink-0 border-b border-slate-200 px-6 py-3.5">
                    <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-2xl max-w-lg">
                        {MODES.map((m) => {
                            const isActive = mode === m.id;
                            return (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => switchMode(m.id)}
                                    className={`py-2 px-1 rounded-xl flex flex-col items-center gap-0.5 transition-colors ${
                                        isActive ? 'bg-white shadow-sm' : 'hover:bg-white/60'
                                    }`}
                                >
                                    <span className={`text-xs font-black ${isActive ? 'text-[#0b1c30]' : 'text-slate-500'}`}>
                                        {m.label}
                                    </span>
                                    <span className={`text-[10px] font-medium ${isActive ? 'text-slate-500' : 'text-slate-400'}`}>
                                        {m.desc}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-[300px_minmax(0,1fr)]">
                    {/* Calendar */}
                    <div className="p-5 border-b md:border-b-0 md:border-r border-slate-200">
                        <span className="block text-[10.5px] font-black uppercase tracking-wider text-slate-500 mb-3">
                            {mode === 'range' ? 'Select Date Range' : mode === 'overnight' ? 'Start Date' : 'Select Date'}
                        </span>

                        <div className="flex items-center justify-between mb-2.5">
                            <button
                                type="button"
                                onClick={() => shiftMonth(-1)}
                                className="h-7 w-7 rounded-lg border border-slate-200 bg-white text-[#0b1c30] hover:bg-slate-50 transition-colors"
                            >
                                ‹
                            </button>
                            <span className="text-sm font-black text-[#0b1c30]">
                                {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                            </span>
                            <button
                                type="button"
                                onClick={() => shiftMonth(1)}
                                className="h-7 w-7 rounded-lg border border-slate-200 bg-white text-[#0b1c30] hover:bg-slate-50 transition-colors"
                            >
                                ›
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-1">
                            {DOW.map((d, i) => (
                                <span key={i} className="text-center text-[10px] font-black text-slate-400 py-1">
                                    {d}
                                </span>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-1 select-none">
                            {calendarDays.map((cell, idx) => {
                                if (!cell) return <span key={`blank-${idx}`} className="aspect-square" />;

                                const level = dayLevel(cell.dateStr);
                                const isPast = level === 'past';
                                const isSelected = cell.dateStr === startDate || cell.dateStr === endDate;
                                const inRange =
                                    mode === 'range' && cell.dateStr > startDate && cell.dateStr < endDate;
                                const isToday = cell.dateStr === today;

                                let tone = 'text-[#0b1c30] hover:bg-[#0077CC]/10';
                                if (isPast) tone = 'text-slate-300 cursor-not-allowed';
                                else if (isSelected) tone = 'bg-[#0077CC] text-white';
                                else if (inRange) tone = 'bg-[#0077CC]/10 text-[#0b1c30]';

                                const dotColor = isSelected
                                    ? 'bg-white'
                                    : level === 'full'
                                      ? 'bg-slate-300'
                                      : level === 'limited'
                                        ? 'bg-amber-500'
                                        : 'bg-emerald-500';

                                return (
                                    <button
                                        key={cell.dateStr}
                                        type="button"
                                        disabled={isPast}
                                        onPointerDown={(e) => {
                                            // Keep the pointer's events on this element so a slide
                                            // across the grid keeps firing onPointerEnter.
                                            e.currentTarget.releasePointerCapture?.(e.pointerId);
                                            beginSelect(cell.dateStr);
                                        }}
                                        onPointerEnter={() => extendSelect(cell.dateStr)}
                                        className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-bold transition-colors border touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-[#0077CC] focus-visible:ring-offset-1 ${
                                            isToday && !isSelected ? 'border-[#0077CC]' : 'border-transparent'
                                        } ${tone}`}
                                    >
                                        {cell.day}
                                        {!isPast && <span className={`w-1 h-1 rounded-full mt-0.5 ${dotColor}`} />}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex gap-3 mt-3 flex-wrap">
                            {[
                                ['bg-emerald-500', 'Open'],
                                ['bg-amber-500', 'Limited'],
                                ['bg-slate-300', 'Full'],
                            ].map(([dot, label]) => (
                                <span key={label} className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-500">
                                    <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                                    {label}
                                </span>
                            ))}
                        </div>

                        {mode === 'range' && (
                            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                                <p className="text-[11px] font-bold text-slate-500">
                                    {selectedDates.length === 1
                                        ? 'Drag across the days, or tap the last day.'
                                        : `${selectedDates.length} days selected`}
                                </p>
                                <p className="text-xs font-black text-[#0b1c30] mt-0.5">
                                    {prettyDate(startDate)}
                                    {endDate !== startDate ? ` – ${prettyDate(endDate)}` : ''}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Time panel */}
                    <div className="p-5 sm:p-6">
                        <p className="text-[13px] font-bold text-slate-500 mb-4">
                            {mode === 'range' ? (
                                <>
                                    Same time on <b className="text-[#0b1c30]">{selectedDates.length} day{selectedDates.length === 1 ? '' : 's'}</b>
                                    {', '}
                                    {prettyDate(startDate)}
                                    {endDate !== startDate ? ` to ${prettyDate(endDate)}` : ''}
                                </>
                            ) : mode === 'overnight' ? (
                                <>
                                    Starts <b className="text-[#0b1c30]">{prettyDate(startDate, true)}</b> and runs past midnight.
                                </>
                            ) : (
                                <>
                                    Booking for <b className="text-[#0b1c30]">{prettyDate(startDate, true)}</b>
                                </>
                            )}
                        </p>

                        <span className="block text-[10.5px] font-black uppercase tracking-wider text-slate-500 mb-2.5">
                            Start Time → End Time
                        </span>

                        <div className="flex items-center gap-3">
                            <select
                                value={startHour}
                                onChange={(e) => {
                                    const next = Number(e.target.value);
                                    setStartHour(next);
                                    if (mode !== 'overnight' && endAbsHour <= next) {
                                        setEndAbsHour(Math.min(next + 2, 24));
                                    }
                                }}
                                className="flex-1 min-w-0 rounded-xl border-slate-200 bg-white text-sm font-black text-[#0b1c30] focus:border-[#0077CC] focus:ring-[#0077CC]"
                            >
                                {startOptions.length > 0 ? (
                                    startOptions.map((h) => (
                                        <option key={h} value={h}>
                                            {hourLabel(h)}
                                        </option>
                                    ))
                                ) : (
                                    <option value={startHour}>No hours left today</option>
                                )}
                            </select>

                            <span className="text-slate-300 font-bold shrink-0">→</span>

                            <select
                                value={endAbsHour}
                                onChange={(e) => setEndAbsHour(Number(e.target.value))}
                                className="flex-1 min-w-0 rounded-xl border-slate-200 bg-white text-sm font-black text-[#0b1c30] focus:border-[#0077CC] focus:ring-[#0077CC]"
                            >
                                {endOptions.map((h) => (
                                    <option key={h} value={h}>
                                        {hourLabel(h, h > 24)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <span className="inline-block mt-3 px-3 py-1.5 rounded-full bg-[#0077CC]/10 text-[#0077CC] text-xs font-black">
                            {hoursPerDay}h per day
                            {mode === 'range' && selectedDates.length > 1 ? ` · ${totalHours}h total` : ''}
                        </span>

                        {/* Timeline */}
                        <div className="mt-7">
                            <div className="relative h-[52px] rounded-xl bg-white border border-slate-200 mt-7 overflow-visible">
                                {timelineWindows.map((w, i) => {
                                    const left = ((Math.max(w.s, timelineFrom) - timelineFrom) / timelineSpan) * 100;
                                    const width =
                                        ((Math.min(w.e, timelineTo) - Math.max(w.s, timelineFrom)) / timelineSpan) * 100;
                                    return (
                                        <div
                                            key={i}
                                            title={w.type === 'blocked' ? 'Closed for maintenance' : 'Already reserved'}
                                            className="absolute top-0 bottom-0"
                                            style={{
                                                left: `${left}%`,
                                                width: `${width}%`,
                                                ...(w.type === 'blocked'
                                                    ? {
                                                          background:
                                                              'repeating-linear-gradient(45deg,#FDECC8,#FDECC8 6px,#F6DFB4 6px,#F6DFB4 10px)',
                                                      }
                                                    : { background: '#E2E8F0' }),
                                            }}
                                        />
                                    );
                                })}

                                {hoursPerDay > 0 && (
                                    <div
                                        className={`absolute -top-1 -bottom-1 rounded-lg border-2 ${
                                            conflict ? 'border-rose-500 bg-rose-500/15' : 'border-[#0077CC] bg-[#0077CC]/15'
                                        }`}
                                        style={{
                                            left: `${((startHour - timelineFrom) / timelineSpan) * 100}%`,
                                            width: `${(hoursPerDay / timelineSpan) * 100}%`,
                                        }}
                                    >
                                        <span
                                            className={`absolute -top-6 left-0 text-[11px] font-black whitespace-nowrap ${
                                                conflict ? 'text-rose-600' : 'text-[#0077CC]'
                                            }`}
                                        >
                                            {hourLabel(startHour)}
                                        </span>
                                        <span
                                            className={`absolute -bottom-6 right-0 text-[11px] font-black whitespace-nowrap ${
                                                conflict ? 'text-rose-600' : 'text-[#0077CC]'
                                            }`}
                                        >
                                            {hourLabel(endAbsHour, endAbsHour > 24)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between mt-7">
                                {ticks.map((t) => (
                                    <span key={t} className="text-[9.5px] font-bold text-slate-400">
                                        {hourLabel(t, t >= 24)}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 flex-wrap mt-4">
                            {[
                                ['bg-white border-slate-200', 'Open'],
                                ['bg-[#0077CC]/15 border-[#0077CC]', 'Selected'],
                                ['bg-slate-200 border-slate-300', 'Taken'],
                                ['border-[#F0B872]', 'Blocked'],
                            ].map(([tone, label]) => (
                                <span key={label} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                                    <span
                                        className={`w-2.5 h-2.5 rounded border ${tone}`}
                                        style={
                                            label === 'Blocked'
                                                ? {
                                                      background:
                                                          'repeating-linear-gradient(45deg,#FDECC8,#FDECC8 2px,#F6D9A8 2px,#F6D9A8 4px)',
                                                  }
                                                : undefined
                                        }
                                    />
                                    {label}
                                </span>
                            ))}
                        </div>

                        {conflict && (
                            <div className="flex items-start gap-2 mt-4 px-3 py-2.5 rounded-xl border border-[#F0B872] bg-amber-50 text-xs font-bold text-amber-700">
                                <span>⚠</span>
                                <span>
                                    {prettyDate(conflict.date)} overlaps a{' '}
                                    {conflict.type === 'blocked' ? 'blocked' : 'reserved'} slot — adjust the time or pick
                                    another date.
                                </span>
                            </div>
                        )}

                        {startsInPast && !conflict && (
                            <div className="mt-4 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-500">
                                That start time has already passed today.
                            </div>
                        )}

                        {serverError && (
                            <div className="mt-4 px-3 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700">
                                {serverError}
                            </div>
                        )}

                        {activeFacility.requires_event_type && (
                            <div className="mt-6">
                                <span className="block text-[10.5px] font-black uppercase tracking-wider text-slate-500 mb-2.5">
                                    What is this booking for?
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {EVENT_TYPES.map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setEventType(type)}
                                            className={`px-3.5 h-9 rounded-xl border text-xs font-extrabold transition-colors ${
                                                eventType === type
                                                    ? 'border-[#0077CC] bg-[#0077CC] text-white'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                                {eventType === 'Others' && (
                                    <input
                                        type="text"
                                        value={customEventName}
                                        onChange={(e) => setCustomEventName(e.target.value)}
                                        placeholder="Name your event"
                                        className="mt-3 w-full rounded-xl border-slate-200 bg-white text-sm font-bold text-[#0b1c30] placeholder:font-medium placeholder:text-slate-400 focus:border-[#0077CC] focus:ring-[#0077CC]"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <footer className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-[13px] font-bold text-slate-500 min-w-0">
                        {hoursPerDay > 0 ? (
                            <>
                                <b className="text-[#0b1c30]">
                                    {prettyDate(startDate)}
                                    {mode === 'range' && endDate !== startDate ? ` – ${prettyDate(endDate)}` : ''}
                                </b>{' '}
                                · {hourLabel(startHour)} – {hourLabel(endAbsHour, endAbsHour > 24)}
                                {mode === 'range' && selectedDates.length > 1 ? ` · ${totalHours}h total` : ''}
                            </>
                        ) : (
                            'Pick a time to continue'
                        )}
                    </div>

                    {user ? (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            className="h-12 px-6 rounded-xl bg-[#0b1c30] hover:bg-[#132c4a] text-white text-sm font-extrabold shadow-md transition-all active:scale-[0.99] disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 shrink-0"
                        >
                            {submitting ? 'Sending…' : 'Request Booking'}
                            <span className="text-[#add911]">→</span>
                        </button>
                    ) : (
                        <Link
                            href="/login"
                            className="h-12 px-6 rounded-xl bg-[#0b1c30] hover:bg-[#132c4a] text-white text-sm font-extrabold shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
                        >
                            Sign in to book <span className="text-[#add911]">→</span>
                        </Link>
                    )}
                </footer>
            </div>
        </div>
    );
}
