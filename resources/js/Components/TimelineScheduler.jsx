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

    // Range selection state { start: number, end: number } e.g. { start: 10, end: 14 }
    const [selectedRange, setSelectedRange] = useState(null);

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
        <div className="w-full space-y-8 pb-4">
            
            {/* Hold & Drag Date Target Strip */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 rounded-3xl text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </span>
                        <span className="text-xs font-black uppercase tracking-wider">
                            Select Date
                        </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                        Click any date pill below to view availability and book
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

            {/* "From & To" Time Selector */}
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

                    </div>

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



        </div>
    );
}
