/**
 * PlayZa Time Slot and Operating Hours Utilities
 * Generates discrete hourly options (e.g. "8 - 9 AM", "9 - 10 AM", "1 - 2 PM")
 * strictly bounded within a facility's opening and closing hours.
 */

export const parseHour = (timeStr, defaultHour = 8) => {
    if (!timeStr) return defaultHour;
    const parts = String(timeStr).split(':');
    const h = parseInt(parts[0], 10);
    return isNaN(h) ? defaultHour : h;
};

export const format24 = (hour) => {
    const h = ((hour % 24) + 24) % 24;
    return `${String(h).padStart(2, '0')}:00`;
};

/**
 * Converts hour (0-24) to a friendly 12-hour string (e.g. 8 -> "8 AM", 13 -> "1 PM", 12 -> "12 PM")
 */
export const formatHour12 = (hour) => {
    const normalized = ((hour % 24) + 24) % 24;
    const h12 = normalized % 12 || 12;
    const suffix = normalized < 12 ? 'AM' : 'PM';
    return `${h12} ${suffix}`;
};

/**
 * Format a 1-hour interval into the user's requested clean format:
 * e.g. 8 & 9 -> "8 - 9 AM"
 * e.g. 11 & 12 -> "11 AM - 12 PM"
 * e.g. 12 & 13 -> "12 - 1 PM"
 * e.g. 13 & 14 -> "1 - 2 PM"
 * e.g. 21 & 22 -> "9 - 10 PM"
 */
export const formatSlotLabel = (startH, endH) => {
    const startNorm = ((startH % 24) + 24) % 24;
    const endNorm = ((endH % 24) + 24) % 24;

    const startH12 = startNorm % 12 || 12;
    const endH12 = endNorm % 12 || 12;

    const startSuffix = startNorm < 12 ? 'AM' : 'PM';
    const endSuffix = endNorm < 12 ? 'AM' : 'PM';

    if (startSuffix === endSuffix) {
        return `${startH12} - ${endH12} ${endSuffix}`;
    }
    return `${startH12} ${startSuffix} - ${endH12} ${endSuffix}`;
};

/**
 * Generate 1-hour slots strictly between openingTime and closingTime
 * Returns array of { startHour, endHour, startTime, endTime, label }
 */
export const generateHourlySlots = (openingTime = '08:00', closingTime = '22:00') => {
    const openH = parseHour(openingTime, 8);
    let closeH = parseHour(closingTime, 22);

    if (closeH <= openH) {
        closeH = openH + 12;
    }

    const slots = [];
    for (let h = openH; h < closeH; h++) {
        slots.push({
            startHour: h,
            endHour: h + 1,
            startTime: format24(h),
            endTime: format24(h + 1),
            label: formatSlotLabel(h, h + 1),
        });
    }

    return slots;
};

/**
 * Generate list of valid starting hours based on facility operating hours
 */
export const getAvailableStartHours = (openingTime = '08:00', closingTime = '22:00') => {
    const openH = parseHour(openingTime, 8);
    const closeH = parseHour(closingTime, 22);
    const hours = [];
    for (let h = openH; h < closeH; h++) {
        hours.push({
            value: h,
            timeStr: format24(h),
            label: formatHour12(h),
        });
    }
    return hours;
};

/**
 * Generate list of valid ending hours based on facility operating hours and chosen startHour
 */
export const getAvailableEndHours = (startHour, openingTime = '08:00', closingTime = '22:00', maxDuration = null) => {
    const closeH = parseHour(closingTime, 22);
    const maxH = maxDuration ? Math.min(closeH, startHour + maxDuration) : closeH;

    const hours = [];
    for (let h = startHour + 1; h <= maxH; h++) {
        hours.push({
            value: h,
            timeStr: format24(h),
            label: formatHour12(h),
            duration: h - startHour,
            slotLabel: formatSlotLabel(startHour, h),
        });
    }
    return hours;
};
