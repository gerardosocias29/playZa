import React, { useState, useEffect } from 'react';

export default function TimelineScheduler({ 
    selectedFacility, 
    selectedDate, 
    onDateChange,
    reservations = [], 
    blockedSlots = {}, 
    onContinueBooking 
}) {
    // 24-hour slots: 01:00 (1) to 23:00 (23), ending at 00:00 / 12 Midnight (24)
    const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];

    // Variant tab switcher state (1, 2, 3, 4, 5)
    const [activeVariant, setActiveVariant] = useState(1);

    // Range selection state { start: number, end: number } e.g. { start: 10, end: 14 }
    const [selectedRange, setSelectedRange] = useState(null);

    // Variant 3 state
    const [selectedDuration, setSelectedDuration] = useState(2); // default 2 hours

    // Dragging state
    const [isDragging, setIsDragging] = useState(false);
    const [draggedHour, setDraggedHour] = useState(null);

    // Dynamic 7-day strip for Date Drag-and-Drop
    const generateNext7Days = () => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const iso = d.toISOString().split('T')[0];
            const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            days.push({ dateStr: iso, label });
        }
        return days;
    };
    const next7Days = generateNext7Days();

    // Reset selection when facility or date changes
    useEffect(() => {
        setSelectedRange(null);
        setIsDragging(false);
    }, [selectedFacility?.id, selectedDate]);

    // Helper: Determine block status for a 24-hour hour slot (e.g. 10 = 10:00 - 11:00)
    const getBlockStatus = (hour, targetDate = selectedDate) => {
        if (!selectedFacility) return 'available';

        const startStr = `${hour.toString().padStart(2, '0')}:00`;
        const endHourVal = hour + 1;
        const endStr = endHourVal === 24 ? '00:00' : `${endHourVal.toString().padStart(2, '0')}:00`;
        const slotStr = `${startStr} - ${endStr}`;

        // Check active reservations
        const activeRes = reservations.find(r => {
            const resFacId = r.facilityId || r.facility_id;
            const resDate = r.date || r.reservation_date;
            if (resFacId !== selectedFacility.id || resDate !== targetDate) return false;
            if (r.status !== 'approved' && r.status !== 'pending') return false;

            if (r.timeSlot === slotStr) return true;
            if (r.start_hour && r.end_hour) {
                return hour >= r.start_hour && hour < r.end_hour;
            }

            const resStart = r.start_time;
            const resEnd = r.end_time;
            if (resStart && resEnd) {
                const [resStartH] = resStart.split(':').map(Number);
                let [resEndH] = resEnd.split(':').map(Number);
                if (resEndH === 0) resEndH = 24;
                return hour >= resStartH && hour < resEndH;
            }

            if (r.timeSlot) {
                const parts = r.timeSlot.split(' - ');
                if (parts.length === 2) {
                    const [resStartH] = parts[0].split(':').map(Number);
                    let [resEndH] = parts[1].split(':').map(Number);
                    if (resEndH === 0) resEndH = 24;
                    return hour >= resStartH && hour < resEndH;
                }
            }
            return false;
        });

        if (activeRes) return 'reserved';

        const blockKey = `${selectedFacility.id}_${targetDate}_${slotStr}`;
        if (blockedSlots[blockKey]) return 'maintenance';

        return 'available';
    };

    // Helper: Format hour number to 24-hour string (e.g. 1 -> 01:00, 15 -> 15:00, 24 -> 00:00)
    const format24Time = (h) => {
        if (h === 24) return '00:00';
        return `${h.toString().padStart(2, '0')}:00`;
    };

    // Range Selection Helper
    const setRangeIfValid = (start, end, targetDate = selectedDate) => {
        const minH = Math.min(start, end);
        const maxH = Math.max(start, end);

        let isValid = true;
        for (let h = minH; h <= maxH; h++) {
            if (getBlockStatus(h, targetDate) !== 'available') {
                isValid = false;
                break;
            }
        }

        if (isValid) {
            setSelectedRange({ start: minH, end: maxH });
            return true;
        }
        return false;
    };

    // Drag / Click handlers
    const handleBlockClick = (hour) => {
        if (getBlockStatus(hour) !== 'available') return;

        if (!selectedRange || selectedRange.start !== selectedRange.end) {
            setSelectedRange({ start: hour, end: hour });
        } else {
            const proposedStart = Math.min(selectedRange.start, hour);
            const proposedEnd = Math.max(selectedRange.start, hour);
            
            if (!setRangeIfValid(proposedStart, proposedEnd)) {
                setSelectedRange({ start: hour, end: hour });
            }
        }
    };

    // Drag and Drop to Date Handlers
    const handleDragStart = (e, hour) => {
        e.dataTransfer.setData('hour', hour);
        setDraggedHour(hour);
        setIsDragging(true);
    };

    const handleDropOnDate = (e, targetDateStr) => {
        e.preventDefault();
        const hour = parseInt(e.dataTransfer.getData('hour') || draggedHour);
        if (!isNaN(hour)) {
            if (onDateChange) {
                onDateChange(targetDateStr);
            }
            setTimeout(() => {
                setRangeIfValid(hour, hour, targetDateStr);
            }, 50);
        }
        setIsDragging(false);
        setDraggedHour(null);
    };

    // Derived Selection Stats
    const durationHours = selectedRange ? (selectedRange.end - selectedRange.start + 1) : 0;
    const startTimeStr = selectedRange ? format24Time(selectedRange.start) : '--';
    const endTimeStr = selectedRange ? format24Time(selectedRange.end + 1) : '--';
    const hourlyRate = 20; // 20 €/₱ per hour
    const estimatedPrice = durationHours * hourlyRate;

    // Available open slots for bottom dock
    const availableOpenHours = hours.filter(h => getBlockStatus(h) === 'available');

    return (
        <div className="w-full space-y-8 pb-36">
            
            {/* Hold & Drag Date Target Strip */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-3xl text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">📅</span>
                        <span className="text-xs font-black uppercase tracking-wider">
                            Hold & Drag Time Slot to Date Target
                        </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                        Drag any open slot below onto a date pill to switch date & book!
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {next7Days.map((item) => {
                        const isCurrentDate = item.dateStr === selectedDate;
                        return (
                            <div
                                key={item.dateStr}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => handleDropOnDate(e, item.dateStr)}
                                onClick={() => onDateChange && onDateChange(item.dateStr)}
                                className={`p-3 rounded-2xl border text-center cursor-pointer transition-all ${
                                    isCurrentDate
                                        ? 'bg-indigo-600 border-indigo-400 text-white font-extrabold shadow-lg scale-105'
                                        : 'bg-white/10 border-white/10 hover:bg-white/20 text-slate-200'
                                }`}
                            >
                                <span className="block text-[10px] uppercase font-bold tracking-wider opacity-80">
                                    {item.label}
                                </span>
                                <span className="block text-xs font-mono font-black mt-0.5">
                                    {item.dateStr}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Interactive Variant Switcher Toolbar */}
            <div className="bg-[#0b1c30]/5 p-2 rounded-2xl border border-slate-200">
                <div className="text-center mb-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0077CC]">
                        🎨 Time Selector Layout Modes
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveVariant(1)}
                        className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
                            activeVariant === 1 
                                ? 'bg-[#0b1c30] text-white shadow-md' 
                                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        1. From & To
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveVariant(2)}
                        className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
                            activeVariant === 2 
                                ? 'bg-[#0b1c30] text-white shadow-md' 
                                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        2. 24h Ribbon
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveVariant(3)}
                        className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
                            activeVariant === 3 
                                ? 'bg-[#0b1c30] text-white shadow-md' 
                                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        3. Presets
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveVariant(4)}
                        className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
                            activeVariant === 4 
                                ? 'bg-[#0b1c30] text-white shadow-md' 
                                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        4. Day Planner
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveVariant(5)}
                        className={`px-3 py-2 rounded-xl text-xs font-black transition-all col-span-2 sm:col-span-1 ${
                            activeVariant === 5 
                                ? 'bg-[#0b1c30] text-white shadow-md' 
                                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        5. Range Slider
                    </button>
                </div>
            </div>

            {/* VARIANT 1: "FROM & TO" DROPDOWN RANGE BUILDER */}
            {activeVariant === 1 && (
                <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-extrabold text-[#0b1c30] mb-2 uppercase tracking-wider">
                                From (Start Time 24h)
                            </label>
                            <select
                                value={selectedRange ? selectedRange.start : ''}
                                onChange={(e) => {
                                    const startH = parseInt(e.target.value);
                                    if (isNaN(startH)) {
                                        setSelectedRange(null);
                                    } else {
                                        const endH = selectedRange && selectedRange.end >= startH ? selectedRange.end : startH;
                                        setRangeIfValid(startH, endH);
                                    }
                                }}
                                className="block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0077CC] text-sm font-bold text-[#0b1c30] font-mono"
                            >
                                <option value="">Select From (Start Hour)...</option>
                                {hours.map((h) => {
                                    const status = getBlockStatus(h);
                                    return (
                                        <option key={h} value={h} disabled={status !== 'available'}>
                                            {format24Time(h)} {status !== 'available' ? `(${status.toUpperCase()})` : ''}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold text-[#0b1c30] mb-2 uppercase tracking-wider">
                                To (End Time 24h)
                            </label>
                            <select
                                value={selectedRange ? (selectedRange.end + 1) : ''}
                                disabled={!selectedRange}
                                onChange={(e) => {
                                    const endVal = parseInt(e.target.value);
                                    if (!isNaN(endVal) && selectedRange) {
                                        const endH = endVal - 1;
                                        setRangeIfValid(selectedRange.start, endH);
                                    }
                                }}
                                className="block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#0077CC] text-sm font-bold text-[#0b1c30] font-mono disabled:opacity-50"
                            >
                                <option value="">Select To (End Hour)...</option>
                                {hours.map((h) => {
                                    const endHourVal = h + 1;
                                    if (!selectedRange || h < selectedRange.start) return null;
                                    
                                    let isValid = true;
                                    for (let v = selectedRange.start; v <= h; v++) {
                                        if (getBlockStatus(v) !== 'available') {
                                            isValid = false;
                                            break;
                                        }
                                    }

                                    return (
                                        <option key={endHourVal} value={endHourVal} disabled={!isValid}>
                                            {format24Time(endHourVal)} {!isValid ? '(CONFLICT)' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>

                    {/* Interactive 24h Visual Bar */}
                    <div>
                        <span className="block text-xs font-extrabold text-[#0b1c30] mb-2">
                            24-Hour Visual Schedule Grid (Hold & Drag Slots to Date Target)
                        </span>
                        <div className="grid grid-cols-12 sm:grid-cols-23 gap-1 p-2 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto">
                            {hours.map((h) => {
                                const status = getBlockStatus(h);
                                const isSelected = selectedRange && h >= selectedRange.start && h <= selectedRange.end;
                                
                                let barBg = 'bg-white';
                                if (isSelected) barBg = 'bg-[#add911] text-[#0b1c30] font-bold';
                                else if (status === 'reserved') barBg = 'bg-[#f87171] text-white cursor-not-allowed';
                                else if (status === 'maintenance') barBg = 'bg-[#8fa1b2] text-white cursor-not-allowed';

                                return (
                                    <button
                                        key={h}
                                        type="button"
                                        draggable={status === 'available'}
                                        onDragStart={(e) => handleDragStart(e, h)}
                                        disabled={status !== 'available'}
                                        onClick={() => handleBlockClick(h)}
                                        className={`h-10 rounded flex flex-col items-center justify-center text-[10px] font-mono transition-all min-w-[28px] cursor-grab active:cursor-grabbing ${barBg}`}
                                        title={`${format24Time(h)} - ${format24Time(h+1)} (Hold to drag to date)`}
                                    >
                                        <span>{h.toString().padStart(2, '0')}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* VARIANT 2: HORIZONTAL 24H TIME RIBBON */}
            {activeVariant === 2 && (
                <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <span className="block text-xs font-extrabold text-[#0b1c30] uppercase tracking-wider">
                        Horizontal 24h Time Ribbon (Hold & Drag to Date)
                    </span>

                    <div className="overflow-x-auto pb-4 pt-1 select-none">
                        <div className="min-w-[980px] grid grid-cols-23 gap-1.5">
                            {hours.map((h) => {
                                const status = getBlockStatus(h);
                                const isSelected = selectedRange && h >= selectedRange.start && h <= selectedRange.end;

                                let ribbonBg = 'bg-white border-slate-300 text-[#0b1c30] hover:border-[#0077CC] shadow-2xs';
                                if (isSelected) ribbonBg = 'bg-[#add911] border-[#add911] text-[#0b1c30] font-black shadow-md';
                                else if (status === 'reserved') ribbonBg = 'bg-[#f87171] border-rose-400 text-white cursor-not-allowed';
                                else if (status === 'maintenance') ribbonBg = 'bg-[#8fa1b2] border-slate-400 text-white cursor-not-allowed';

                                return (
                                    <button
                                        key={h}
                                        type="button"
                                        draggable={status === 'available'}
                                        onDragStart={(e) => handleDragStart(e, h)}
                                        disabled={status !== 'available'}
                                        onClick={() => handleBlockClick(h)}
                                        className={`h-20 rounded-xl border-2 flex flex-col justify-between p-2 text-center transition-all cursor-grab active:cursor-grabbing ${ribbonBg}`}
                                    >
                                        <span className="text-xs font-mono font-black">{format24Time(h)}</span>
                                        <span className="text-[9px] font-extrabold uppercase">
                                            {isSelected ? 'SELECTED' : status === 'reserved' ? 'LOCKED' : status === 'maintenance' ? 'CLOSED' : 'OPEN'}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* VARIANT 3: QUICK DURATION PRESETS */}
            {activeVariant === 3 && (
                <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <div>
                        <span className="block text-xs font-extrabold text-[#0b1c30] mb-3 uppercase tracking-wider">
                            Step 1: Choose Booking Duration Preset
                        </span>
                        <div className="flex flex-wrap gap-3">
                            {[1, 2, 3, 4, 5].map((dur) => (
                                <button
                                    key={dur}
                                    type="button"
                                    onClick={() => {
                                        setSelectedDuration(dur);
                                        if (selectedRange) {
                                            const endH = selectedRange.start + dur - 1;
                                            setRangeIfValid(selectedRange.start, endH);
                                        }
                                    }}
                                    className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                                        selectedDuration === dur
                                            ? 'bg-[#0077CC] text-white shadow-md scale-[1.02]'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    {dur} {dur === 1 ? 'Hour' : 'Hours'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <span className="block text-xs font-extrabold text-[#0b1c30] mb-3 uppercase tracking-wider">
                            Step 2: Tap Start Hour ({selectedDuration} {selectedDuration === 1 ? 'Hour' : 'Hours'} Range)
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-96 overflow-y-auto p-1">
                            {hours.map((h) => {
                                const endH = h + selectedDuration - 1;
                                const isEndValid = endH <= 23;

                                let isAvailableRange = isEndValid;
                                if (isEndValid) {
                                    for (let v = h; v <= endH; v++) {
                                        if (getBlockStatus(v) !== 'available') {
                                            isAvailableRange = false;
                                            break;
                                        }
                                    }
                                }

                                const isSelected = selectedRange && selectedRange.start === h && selectedRange.end === endH;

                                return (
                                    <button
                                        key={h}
                                        type="button"
                                        disabled={!isAvailableRange}
                                        onClick={() => setRangeIfValid(h, endH)}
                                        className={`p-3 rounded-xl border text-center transition-all ${
                                            isSelected 
                                                ? 'bg-[#add911] border-[#add911] text-[#0b1c30] font-black shadow-md'
                                                : isAvailableRange 
                                                ? 'bg-white hover:bg-slate-50 border-slate-200 text-[#0b1c30] font-bold'
                                                : 'bg-slate-100 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed'
                                        }`}
                                    >
                                        <span className="block text-xs font-mono font-bold">{format24Time(h)}</span>
                                        <span className="text-[10px] text-slate-500 block">to {format24Time(endH + 1)}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* VARIANT 4: DAY PLANNER */}
            {activeVariant === 4 && (
                <div className="max-w-xl mx-auto border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white select-none max-h-[500px] overflow-y-auto">
                    <div className="divide-y divide-slate-100">
                        {hours.map((h) => {
                            const status = getBlockStatus(h);
                            const isSelected = selectedRange && h >= selectedRange.start && h <= selectedRange.end;

                            let rowBgClass = 'bg-white hover:bg-slate-50 cursor-pointer';
                            if (isSelected) rowBgClass = 'bg-[#add911] text-[#0b1c30] font-black cursor-pointer';
                            else if (status === 'maintenance') rowBgClass = 'bg-[#8fa1b2] text-white cursor-not-allowed';
                            else if (status === 'reserved') rowBgClass = 'bg-[#f87171] text-white cursor-not-allowed';

                            return (
                                <div key={h} className="flex items-center h-11 border-b border-slate-100 last:border-b-0">
                                    <div className="w-28 sm:w-32 px-4 flex items-center justify-center shrink-0 border-r border-slate-100 bg-slate-50/50 h-full">
                                        <span className="text-xs font-black text-[#0b1c30] bg-white px-2.5 py-1 rounded-md border border-slate-200/80 font-mono">
                                            {format24Time(h)}
                                        </span>
                                    </div>

                                    <div 
                                        onClick={() => handleBlockClick(h)}
                                        className={`flex-1 h-full flex items-center px-4 transition-all duration-150 border-l border-white/20 ${rowBgClass}`}
                                    >
                                        {isSelected && (
                                            <span className="text-[10px] uppercase font-black tracking-wider text-[#0b1c30]">
                                                Selected ({format24Time(h)} - {format24Time(h + 1)})
                                            </span>
                                        )}
                                        {status === 'reserved' && (
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-white">🔒 Reserved</span>
                                        )}
                                        {status === 'maintenance' && (
                                            <span className="text-[10px] uppercase font-bold tracking-wider text-white">🔧 Closed</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* VARIANT 5: DUAL RANGE SLIDER */}
            {activeVariant === 5 && (
                <div className="space-y-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto">
                    <span className="block text-xs font-extrabold text-[#0b1c30] uppercase tracking-wider">
                        Dual Range Slider (01:00 to 00:00 Midnight)
                    </span>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                                <span>Start Hour:</span>
                                <span className="font-mono text-[#0077CC] font-black">
                                    {selectedRange ? format24Time(selectedRange.start) : '01:00'}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="23"
                                value={selectedRange ? selectedRange.start : 1}
                                onChange={(e) => {
                                    const startH = parseInt(e.target.value);
                                    const endH = selectedRange && selectedRange.end >= startH ? selectedRange.end : startH;
                                    setRangeIfValid(startH, endH);
                                }}
                                className="w-full accent-[#0077CC] cursor-pointer"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                                <span>End Hour:</span>
                                <span className="font-mono text-[#0077CC] font-black">
                                    {selectedRange ? format24Time(selectedRange.end + 1) : '02:00'}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="2"
                                max="24"
                                value={selectedRange ? (selectedRange.end + 1) : 2}
                                onChange={(e) => {
                                    const endVal = parseInt(e.target.value);
                                    const startH = selectedRange ? selectedRange.start : 1;
                                    if (endVal > startH) {
                                        setRangeIfValid(startH, endVal - 1);
                                    }
                                }}
                                className="w-full accent-[#0077CC] cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Booking Summary Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 max-w-xl mx-auto">
                <h3 className="text-sm font-black uppercase tracking-wider text-[#0b1c30] mb-6 flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#add911]"></span>
                    Booking Summary ({selectedDate})
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-6 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                    <div>
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">From</span>
                        <span className="text-base font-black text-[#0b1c30] font-mono">{startTimeStr}</span>
                    </div>

                    <div>
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">To</span>
                        <span className="text-base font-black text-[#0b1c30] font-mono">{endTimeStr}</span>
                    </div>

                    <div>
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Duration</span>
                        <span className="text-base font-black text-[#0077CC]">
                            {durationHours > 0 ? `${durationHours} ${durationHours === 1 ? 'Hour' : 'Hours'}` : '--'}
                        </span>
                    </div>

                    <div>
                        <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Price</span>
                        <span className="text-lg font-black text-[#0b1c30]">
                            {durationHours > 0 ? `€${estimatedPrice}` : '€0'}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    disabled={!selectedRange || durationHours === 0}
                    onClick={() => {
                        if (selectedRange && onContinueBooking) {
                            const startSlotStr = format24Time(selectedRange.start);
                            const endSlotStr = format24Time(selectedRange.end + 1);
                            const timeSlotStr = `${startSlotStr} - ${endSlotStr}`;
                            
                            onContinueBooking({
                                startHour: selectedRange.start,
                                endHour: selectedRange.end + 1,
                                startTime: startSlotStr,
                                endTime: endSlotStr,
                                timeSlot: timeSlotStr,
                                durationHours,
                                estimatedPrice,
                                date: selectedDate
                            });
                        }
                    }}
                    className="w-full py-4 bg-[#0b1c30] hover:bg-[#132c4a] text-white font-extrabold rounded-xl shadow-lg transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                >
                    Continue Booking <span className="text-[#add911]">→</span>
                </button>
            </div>

            {/* VISIBLE OPEN TIME SLOT DOCK AT THE BOTTOM */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0b1c30]/95 backdrop-blur-md border-t border-slate-700/60 p-3 sm:p-4 text-white shadow-2xl">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="h-3 w-3 rounded-full bg-[#add911] animate-pulse"></div>
                        <div>
                            <span className="text-xs font-black uppercase tracking-wider text-[#add911]">
                                Visible Open Time Slots ({selectedDate})
                            </span>
                            <p className="text-[11px] text-slate-300">
                                Click slot to select range or click & hold to drag to date target above!
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
                        {availableOpenHours.length > 0 ? (
                            availableOpenHours.map((h) => {
                                const isSelected = selectedRange && h >= selectedRange.start && h <= selectedRange.end;
                                return (
                                    <button
                                        key={h}
                                        type="button"
                                        draggable={true}
                                        onDragStart={(e) => handleDragStart(e, h)}
                                        onClick={() => handleBlockClick(h)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all border cursor-grab active:cursor-grabbing ${
                                            isSelected
                                                ? 'bg-[#add911] text-[#0b1c30] border-[#add911] shadow-md scale-105 font-black'
                                                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                                        }`}
                                    >
                                        {format24Time(h)}
                                    </button>
                                );
                            })
                        ) : (
                            <span className="text-xs text-rose-400 font-bold">No open slots available for this date.</span>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
