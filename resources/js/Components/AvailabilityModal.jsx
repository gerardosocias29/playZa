import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
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
import { formatSlotLabel } from '@/lib/timeSlots';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const EVENT_TYPES = [
    'Graduation',
    'Meeting',
    'Meeting de Avance',
    'Wedding',
    'Birthday',
    'Intramurals',
    'Sports Tournament',
    'Others',
];

export default function AvailabilityModal({
    isOpen,
    onClose,
    facility,
    facilities = [],
    reservations = [],
    schedules = [],
    user = null,
    initialFacilityId = null,
    initialBookingData = null,
}) {
    const { auth, errors = {} } = usePage().props;
    const currentUser = user || auth?.user || null;

    const today = formatYMD(new Date());
    const currentHour = new Date().getHours();

    const [mode, setMode] = useState('single');
    const isRangeEnabled = false;
    const [facilityId, setFacilityId] = useState(initialFacilityId ?? facility?.id ?? null);
    const [startHour, setStartHour] = useState(8);
    const [endAbsHour, setEndAbsHour] = useState(9); // absolute hours from start-day midnight
    const [viewMonth, setViewMonth] = useState(() => new Date());
    const [selection, setSelection] = useState(() => newSelection(today));
    const { startDate, endDate } = selection;
    const [eventType, setEventType] = useState(EVENT_TYPES[1]);
    const [customEventName, setCustomEventName] = useState('');
    const [organizationOrSchool, setOrganizationOrSchool] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const timelineRef = React.useRef(null);
    const wasOpenRef = React.useRef(false);
    const [dragMode, setDragMode] = useState(null); // null | 'move' | 'left' | 'right'
    const [dragOffset, setDragOffset] = useState(0);

    const facilityList = facilities.length > 0 ? facilities : facility ? [facility] : [];
    const activeFacility =
        facilityList.find((f) => String(f.id) === String(facilityId)) || facility || facilityList[0] || null;

    const facilityOpenH = parseInt((activeFacility?.opening_time || '08:00').split(':')[0], 10);
    const facilityCloseH = parseInt((activeFacility?.closing_time || '22:00').split(':')[0], 10);

    const handleFacilityChange = (newId) => {
        setFacilityId(newId);
        const targetFac = facilityList.find(f => String(f.id) === String(newId));
        if (targetFac) {
            const nextOpen = parseInt((targetFac.opening_time || '08:00').split(':')[0], 10);
            const nextClose = parseInt((targetFac.closing_time || '22:00').split(':')[0], 10);
            const minStart = startDate === today ? Math.max(nextOpen, currentHour + 1) : nextOpen;
            const newStart = Math.min(Math.max(startHour, minStart), nextClose - 1);
            const maxDur = targetFac.max_hours || 2;
            const newEnd = Math.min(newStart + maxDur, nextClose);
            setStartHour(newStart);
            setEndAbsHour(newEnd);
            if (targetFac.event_options && targetFac.event_options.length > 0) {
                setEventType(targetFac.event_options[0]);
            }
        }
    };

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
    }, [activeFacility, hoursPerDay, selectedDates, startHour, endAbsHour, reservations, schedules]);

    const serverError = errors.facility_id || errors.reservation_date || errors.start_time || errors.end_time;

    const maxHours = activeFacility?.max_hours || null;
    const exceedsMaxHours = Boolean(maxHours && hoursPerDay > maxHours);

    const startsInPast = startDate === today && startHour <= currentHour;
    const canSubmit = Boolean(
        currentUser && activeFacility && hoursPerDay > 0 && !exceedsMaxHours && !conflict && !startsInPast && !submitting
    );

    /* ---------- effects ---------- */

    const facilityMaxHours = activeFacility?.max_hours || null;

    useEffect(() => {
        if (!isOpen) {
            wasOpenRef.current = false;
            return;
        }

        // Only run full reset when modal is opened freshly, NOT when user changes facility dropdown!
        if (!wasOpenRef.current) {
            wasOpenRef.current = true;

            if (initialBookingData) {
                if (initialBookingData.facilityId) setFacilityId(initialBookingData.facilityId);
                if (initialBookingData.date) {
                    setSelection(newSelection(initialBookingData.date));
                    const parts = initialBookingData.date.split('-');
                    if (parts.length === 3) {
                        setViewMonth(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1));
                    }
                }
                if (initialBookingData.startHour !== undefined) setStartHour(initialBookingData.startHour);
                if (initialBookingData.endAbsHour !== undefined) setEndAbsHour(initialBookingData.endAbsHour);
                if (initialBookingData.eventType) setEventType(initialBookingData.eventType);
                if (initialBookingData.customEventName) setCustomEventName(initialBookingData.customEventName);
                if (initialBookingData.organization_or_school) setOrganizationOrSchool(initialBookingData.organization_or_school);
                if (initialBookingData.contact_person) setContactPerson(initialBookingData.contact_person);
                if (initialBookingData.contact_number) setContactNumber(initialBookingData.contact_number);
                return;
            }

            const initial = currentHour >= (facilityCloseH - 1) ? addDays(today, 1) : today;
            const defaultDur = facilityMaxHours ? Math.min(2, facilityMaxHours) : 2;
            const start = initial === today ? Math.min(Math.max(currentHour + 1, facilityOpenH), facilityCloseH - 1) : facilityOpenH;
            setMode('single');
            setFacilityId(initialFacilityId ?? facility?.id ?? facilityList[0]?.id ?? null);
            setSelection(newSelection(initial));
            setStartHour(start);
            setEndAbsHour(Math.min(start + defaultDur, facilityCloseH));
            setViewMonth(new Date());
            setCustomEventName('');
            setOrganizationOrSchool('');
            setContactPerson('');
            setContactNumber('');
        }
    }, [isOpen, initialFacilityId, facility?.id, initialBookingData]);

    // Coming back to today from a future date can leave the start on an hour
    // that has already passed — nudge it forward so the select stays in sync.
    useEffect(() => {
        if (startDate !== today || startHour > currentHour) return;
        const next = Math.min(Math.max(currentHour + 1, facilityOpenH), facilityCloseH - 1);
        const defaultDur = facilityMaxHours ? Math.min(2, facilityMaxHours) : 2;
        setStartHour(next);
        setEndAbsHour(Math.min(next + defaultDur, facilityCloseH));
    }, [startDate, today, currentHour, facilityOpenH, facilityCloseH, facilityMaxHours]);

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
        if (next === 'single') {
            setMode('single');
            setSelection((sel) => newSelection(sel.startDate));
            const defaultDur = facilityMaxHours ? Math.min(2, facilityMaxHours) : 2;
            setStartHour(8);
            setEndAbsHour(8 + defaultDur);
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
                organization_or_school: organizationOrSchool.trim() || null,
                contact_person: contactPerson.trim() || null,
                contact_number: contactNumber.trim() || null,
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

    const startOptions = Array.from({ length: Math.max(1, facilityCloseH - facilityOpenH) }, (_, i) => facilityOpenH + i).filter(
        (h) => !(startDate === today && h <= currentHour)
    );

    const maxAllowedHours = facilityMaxHours || (facilityCloseH - facilityOpenH);
    const maxEndHourVal = Math.min(facilityCloseH, startHour + maxAllowedHours);

    const endOptions = Array.from({ length: Math.max(0, maxEndHourVal - startHour) }, (_, i) => startHour + 1 + i);

    const timelineFrom = facilityOpenH;
    const timelineTo = facilityCloseH;
    const timelineSpan = Math.max(1, timelineTo - timelineFrom);
    const ticks = [facilityOpenH, Math.round((facilityOpenH + facilityCloseH) / 2), facilityCloseH];

    const minStartHour = startDate === today ? Math.min(Math.max(currentHour + 1, facilityOpenH), facilityCloseH - 1) : timelineFrom;
    const maxEndHour = timelineTo;

    useEffect(() => {
        if (!dragMode) return;

        const handlePointerMove = (e) => {
            if (!timelineRef.current) return;
            const rect = timelineRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const ratio = Math.max(0, Math.min(1, x / rect.width));
            const hourPos = timelineFrom + ratio * timelineSpan;

            const currentDur = Math.max(1, endAbsHour - startHour);
            const dur = facilityMaxHours ? Math.min(currentDur, facilityMaxHours) : currentDur;

            const maxAllowedEnd = facilityMaxHours ? Math.min(maxEndHour, startHour + facilityMaxHours) : maxEndHour;
            const minAllowedStart = facilityMaxHours ? Math.max(minStartHour, endAbsHour - facilityMaxHours) : minStartHour;

            if (dragMode === 'move') {
                let newStart = Math.round(hourPos - dragOffset);
                newStart = Math.max(minStartHour, Math.min(maxEndHour - dur, newStart));
                setStartHour(newStart);
                setEndAbsHour(newStart + dur);
            } else if (dragMode === 'left') {
                let newStart = Math.round(hourPos);
                newStart = Math.max(minAllowedStart, Math.min(endAbsHour - 1, newStart));
                setStartHour(newStart);
            } else if (dragMode === 'right') {
                let newEnd = Math.round(hourPos);
                newEnd = Math.max(startHour + 1, Math.min(maxAllowedEnd, newEnd));
                setEndAbsHour(newEnd);
            }
        };

        const handlePointerUp = () => setDragMode(null);
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [dragMode, dragOffset, startHour, endAbsHour, minStartHour, maxEndHour, timelineFrom, timelineSpan, facilityMaxHours]);

    let timelineWindows = (activeFacility ? busyOnDate(startDate) : [])
        .map((w) => ({ ...w, s: w.s / 60, e: w.e / 60 }))
        .concat(
            busyOnDate(addDays(startDate, 1)).map((w) => ({
                ...w,
                s: w.s / 60 + 24,
                e: w.e / 60 + 24,
            }))
        );

    if (startDate === today) {
        timelineWindows = [
            { s: 0, e: currentHour + 1, type: 'past' },
            ...timelineWindows,
        ];
    }

    timelineWindows = timelineWindows.filter((w) => w.e > timelineFrom && w.s < timelineTo);

    const handleTimelinePointerDown = (e, targetMode) => {
        e.preventDefault();
        e.stopPropagation();
        if (!timelineRef.current) return;

        const rect = timelineRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
        const clickedHour = timelineFrom + clickRatio * timelineSpan;

        const actualMode = (hoursPerDay <= 1 && (targetMode === 'left' || targetMode === 'right')) ? 'move' : targetMode;

        if (actualMode === 'jump') {
            const currentDur = Math.max(1, endAbsHour - startHour);
            const dur = facilityMaxHours ? Math.min(currentDur, facilityMaxHours) : currentDur;
            let newStart = Math.round(clickedHour - dur / 2);
            newStart = Math.max(minStartHour, Math.min(maxEndHour - dur, newStart));
            setStartHour(newStart);
            setEndAbsHour(newStart + dur);
            setDragMode('move');
            setDragOffset(dur / 2);
        } else {
            setDragMode(actualMode);
            if (actualMode === 'move') {
                setDragOffset(clickedHour - startHour);
            }
        }
    };
    const handleSignInToBook = (e) => {
        e.preventDefault();
        try {
            const pendingBooking = {
                facilityId: activeFacility?.id,
                date: startDate,
                startHour,
                endAbsHour,
                eventType: activeFacility?.requires_event_type ? eventType : null,
                customEventName:
                    activeFacility?.requires_event_type && eventType === 'Others' ? customEventName.trim() : null,
            };
            sessionStorage.setItem('playza_pending_booking', JSON.stringify(pendingBooking));
        } catch (err) {
            console.error('Failed to save pending booking draft', err);
        }
        router.visit('/login');
    };

    if (!isOpen || !mounted || !activeFacility) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 m-0"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Check facility availability"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[92vh] flex flex-col bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <header className="shrink-0 border-b border-slate-200 px-3 py-3 sm:px-5 sm:py-3.5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="min-w-0">
                            <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#0077CC]">
                                Check Availability
                            </p>
                            <h2 className="text-base sm:text-lg font-title font-black text-[#0b1c30] truncate leading-tight">
                                {activeFacility.name}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        {facilityList.length > 1 && (
                            <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
                                <label className="text-[10px] sm:text-xs font-bold text-slate-500 hidden sm:inline">Facility:</label>
                                <select
                                    value={facilityId || activeFacility.id}
                                    onChange={(e) => handleFacilityChange(e.target.value)}
                                    className="w-full sm:w-auto px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-[10px] sm:text-xs font-bold text-[#0b1c30] shadow-xs focus:ring-2 focus:ring-[#0077CC]"
                                >
                                    {facilityList.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name} ({f.type})
                                        </option>
                                    ))}
                                </select>
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

                {/* Body */}
                <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)]">
                    {!currentUser && (
                        <div className="lg:hidden px-3 pt-3 pb-2 bg-slate-50 border-b border-slate-200">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Next step</p>
                            <p className="text-xs font-bold text-slate-700">Choose a date and time, then sign in to confirm.</p>
                        </div>
                    )}

                    {/* Calendar */}
                    <div className="p-3 sm:p-5 border-b lg:border-b-0 lg:border-r border-slate-200">
                        <span className="block text-[10px] sm:text-[10.5px] font-black uppercase tracking-wider text-slate-500 mb-3">
                            Select Date
                        </span>

                        <div className="flex items-center justify-between mb-2.5 gap-2">
                            <button
                                type="button"
                                onClick={() => shiftMonth(-1)}
                                className="h-7 w-7 rounded-lg border border-slate-200 bg-white text-[#0b1c30] hover:bg-slate-50 transition-colors flex items-center justify-center font-bold text-sm"
                                aria-label="Previous month"
                            >
                                ‹
                            </button>
                            <span className="text-xs sm:text-sm font-black text-[#0b1c30]">
                                {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                            </span>
                            <button
                                type="button"
                                onClick={() => shiftMonth(1)}
                                className="h-7 w-7 rounded-lg border border-slate-200 bg-white text-[#0b1c30] hover:bg-slate-50 transition-colors flex items-center justify-center font-bold text-sm"
                                aria-label="Next month"
                            >
                                ›
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center mb-1 select-none">
                            {DOW.map((d, i) => (
                                <span key={i} className="text-[9px] sm:text-[10px] font-extrabold text-slate-500">
                                    {d}
                                </span>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-[3px] sm:gap-1 select-none">
                            {calendarDays.map((cell, idx) => {
                                if (!cell) return <span key={`blank-${idx}`} className="aspect-square" />;

                                const level = dayLevel(cell.dateStr);
                                const isPast = level === 'past';
                                const isSelected = cell.dateStr === startDate || cell.dateStr === endDate;
                                const inRange = false;
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
                                            e.currentTarget.releasePointerCapture?.(e.pointerId);
                                            beginSelect(cell.dateStr);
                                        }}
                                        onPointerEnter={() => extendSelect(cell.dateStr)}
                                        className={`aspect-square rounded-md sm:rounded-lg flex flex-col items-center justify-center text-[10px] sm:text-xs font-bold transition-colors border touch-none select-none outline-none focus-visible:ring-2 focus-visible:ring-[#0077CC] focus-visible:ring-offset-1 ${
                                            isToday && !isSelected ? 'border-[#0077CC]' : 'border-transparent'
                                        } ${tone}`}
                                    >
                                        <span className="leading-none">{cell.day}</span>
                                        {!isPast && <span className={`w-1 h-1 rounded-full mt-0.5 ${dotColor}`} />}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="hidden sm:flex gap-3 mt-3 flex-wrap">
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

                        {isRangeEnabled && (
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
                            ) : (
                                <>
                                    Booking for <b className="text-[#0b1c30]">{prettyDate(startDate, true)}</b>
                                </>
                            )}
                        </p>

                        <span className="block text-[10.5px] font-black uppercase tracking-wider text-slate-500 mb-2.5">
                            Start Time → End Time
                        </span>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                                    Start time (Opens at {hourLabel(facilityOpenH)})
                                </label>
                                <select
                                    value={startHour}
                                    onChange={(e) => {
                                        const next = Number(e.target.value);
                                        setStartHour(next);
                                        const maxAllowed = facilityMaxHours ? Math.min(facilityCloseH, next + facilityMaxHours) : facilityCloseH;
                                        if (mode !== 'overnight') {
                                            if (endAbsHour <= next) {
                                                setEndAbsHour(Math.min(next + 1, maxAllowed));
                                            } else if (endAbsHour > maxAllowed) {
                                                setEndAbsHour(maxAllowed);
                                            }
                                        }
                                    }}
                                    className="w-full rounded-xl border-slate-200 bg-white text-sm font-black text-[#0b1c30] focus:border-[#0077CC] focus:ring-[#0077CC]"
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
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                                    End time / Slot (Closes at {hourLabel(facilityCloseH)})
                                </label>
                                <select
                                    value={endAbsHour}
                                    onChange={(e) => setEndAbsHour(Number(e.target.value))}
                                    className="w-full rounded-xl border-slate-200 bg-white text-sm font-black text-[#0b1c30] focus:border-[#0077CC] focus:ring-[#0077CC]"
                                >
                                    {endOptions.map((h) => (
                                        <option key={h} value={h}>
                                            {formatSlotLabel(startHour, h)} ({h - startHour} hr{h - startHour > 1 ? 's' : ''})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="hidden sm:block mt-7">
                            <div
                                ref={timelineRef}
                                onPointerDown={(e) => handleTimelinePointerDown(e, 'jump')}
                                className="relative h-[56px] rounded-xl bg-slate-100 border border-slate-200 mt-7 overflow-visible cursor-pointer select-none touch-none"
                            >
                                {timelineWindows.map((w, i) => {
                                    const left = ((Math.max(w.s, timelineFrom) - timelineFrom) / timelineSpan) * 100;
                                    const width =
                                        ((Math.min(w.e, timelineTo) - Math.max(w.s, timelineFrom)) / timelineSpan) * 100;
                                    return (
                                        <div
                                            key={i}
                                            title={w.type === 'past' ? 'Past time - Not available' : w.type === 'blocked' ? 'Closed for maintenance' : 'Already reserved'}
                                            className="absolute top-0 bottom-0 pointer-events-none"
                                            style={{
                                                left: `${left}%`,
                                                width: `${width}%`,
                                                ...(w.type === 'blocked' || w.type === 'past'
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
                                        onPointerDown={(e) => handleTimelinePointerDown(e, 'move')}
                                        className={`absolute -top-1 -bottom-1 rounded-lg border-2 shadow-md touch-none cursor-grab active:cursor-grabbing transition-shadow ${
                                            conflict ? 'border-rose-500 bg-rose-500/25' : 'border-[#0077CC] bg-[#0077CC]/25'
                                        }`}
                                        style={{
                                            left: `${((startHour - timelineFrom) / timelineSpan) * 100}%`,
                                            width: `${(hoursPerDay / timelineSpan) * 100}%`,
                                        }}
                                    >
                                        {hoursPerDay > 1 && (
                                            <>
                                                <div
                                                    onPointerDown={(e) => handleTimelinePointerDown(e, 'left')}
                                                    className="absolute left-0 top-0 bottom-0 w-2.5 bg-[#0077CC] rounded-l-md cursor-ew-resize flex items-center justify-center group hover:w-3.5 transition-all z-10"
                                                    title="Drag to adjust start time"
                                                >
                                                    <div className="w-0.5 h-3 bg-white/90 rounded-full" />
                                                </div>
                                                <div
                                                    onPointerDown={(e) => handleTimelinePointerDown(e, 'right')}
                                                    className="absolute right-0 top-0 bottom-0 w-2.5 bg-[#0077CC] rounded-r-md cursor-ew-resize flex items-center justify-center group hover:w-3.5 transition-all z-10"
                                                    title="Drag to adjust end time"
                                                >
                                                    <div className="w-0.5 h-3 bg-white/90 rounded-full" />
                                                </div>
                                            </>
                                        )}

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
                                            {hourLabel(endAbsHour)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between mt-7">
                                {ticks.map((t) => (
                                    <span key={t} className="text-[9.5px] font-bold text-slate-400">
                                        {hourLabel(t)}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="hidden sm:flex gap-3 flex-wrap mt-4">
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

                        {facilityMaxHours && (
                            <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200">
                                <svg className="w-3.5 h-3.5 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v3m0 3h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                </svg>
                                <span className="text-[11px] font-extrabold text-amber-800">
                                    Maximum booking duration: <strong>{facilityMaxHours} hr{facilityMaxHours !== 1 ? 's' : ''}/session</strong>
                                </span>
                            </div>
                        )}

                        {conflict && (
                            <div className="flex items-start gap-2 mt-4 px-3 py-2.5 rounded-xl border border-[#F0B872] bg-amber-50 text-xs font-bold text-amber-700">
                                <svg className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
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

                        {exceedsMaxHours && !conflict && !startsInPast && (
                            <div className="mt-4 px-3 py-3 rounded-xl border-2 border-rose-300 bg-rose-50 text-xs font-bold text-rose-800 flex items-start gap-2.5">
                                <svg className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span>
                                    <span className="block text-rose-900 font-extrabold mb-0.5">Session limit exceeded</span>
                                    This facility allows a maximum of{' '}
                                    <strong className="text-rose-900">{maxHours} hour{maxHours !== 1 ? 's' : ''} per session</strong>.
                                    Please shorten your booking duration to proceed.
                                </span>
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
                                    {(
                                        (activeFacility.event_options && activeFacility.event_options.length > 0)
                                            ? activeFacility.event_options
                                            : EVENT_TYPES
                                    ).map((type) => (
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
                                {eventType === 'Others' && activeFacility.allow_custom_event_name !== false && (
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

                        {/* Organization / School and Contact Fields */}
                        <div className="mt-6 p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-black uppercase tracking-wider text-[#0b1c30] flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Organization & Contact Details
                                </span>
                                <span className="text-[10px] text-slate-400 font-semibold">(For Events, Intrams & Booking Point Person)</span>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                    Organization / School Name
                                </label>
                                <input
                                    type="text"
                                    value={organizationOrSchool}
                                    onChange={(e) => setOrganizationOrSchool(e.target.value)}
                                    placeholder="e.g. Getafe National High School / Barangay Youth"
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0b1c30] placeholder:font-normal placeholder:text-slate-400 focus:border-[#0077CC] focus:ring-[#0077CC]"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                        Contact Person
                                    </label>
                                    <input
                                        type="text"
                                        value={contactPerson}
                                        onChange={(e) => setContactPerson(e.target.value)}
                                        placeholder="e.g. Juan Dela Cruz"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0b1c30] placeholder:font-normal placeholder:text-slate-400 focus:border-[#0077CC] focus:ring-[#0077CC]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                        Contact Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={contactNumber}
                                        onChange={(e) => setContactNumber(e.target.value)}
                                        placeholder="e.g. 0912-345-6789"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0b1c30] placeholder:font-normal placeholder:text-slate-400 focus:border-[#0077CC] focus:ring-[#0077CC]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="shrink-0 sticky bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur-sm px-3 py-3 sm:px-6 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center justify-between shadow-[0_-8px_24px_-20px_rgba(15,23,42,0.5)]">
                    <div className="text-[12px] sm:text-[13px] font-bold text-slate-500 min-w-0">
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

                    {currentUser ? (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!canSubmit}
                            className="w-full sm:w-auto h-12 px-6 rounded-xl bg-[#0b1c30] hover:bg-[#132c4a] text-white text-sm font-extrabold shadow-md transition-all active:scale-[0.99] disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 shrink-0"
                        >
                            {submitting ? 'Sending…' : 'Request Booking'}
                            <span className="text-[#add911]">→</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSignInToBook}
                            className="w-full sm:w-auto h-12 px-6 rounded-xl bg-[#0b1c30] hover:bg-[#132c4a] text-white text-sm font-extrabold shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                        >
                            Sign in to book <span className="text-[#add911]">→</span>
                        </button>
                    )}
                </footer>
            </div>
        </div>,
        document.body
    );
}
