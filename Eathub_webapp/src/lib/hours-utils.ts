/**
 * Parses a working hours string or JSON and returns a human-readable availability summary.
 */
export function formatWorkingHours(workingHours?: string | null): string {
    if (!workingHours) return 'Hours not available';
    
    try {
      if (workingHours.startsWith('[') || workingHours.startsWith('{')) {
        const parsed = JSON.parse(workingHours);
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const openDays: string[] = [];
        const closedDays: string[] = [];
  
        if (Array.isArray(parsed)) {
            parsed.forEach((d: any) => {
                if (d.isOpen || d.active) openDays.push(d.day);
                else closedDays.push(d.day);
            });
        } else if (typeof parsed === 'object') {
            days.forEach(day => {
                const info = parsed[day];
                if (info && (info.active === true || info.isOpen === true)) {
                    openDays.push(day);
                } else {
                    closedDays.push(day);
                }
            });
        }
  
        if (openDays.length === 7) return 'Available Daily';
        if (openDays.length === 0) return 'Currently Closed';
        
        if (openDays.length === 6 && closedDays.length === 1) {
            return `Daily except ${closedDays[0]}`;
        }
        
        if (openDays.length === 5 && openDays.includes('Monday') && openDays.includes('Friday') && !openDays.includes('Saturday') && !openDays.includes('Sunday')) {
            return 'Mon - Fri';
        }

        if (openDays.length <= 3) {
            return `Open ${openDays.map(d => d.substring(0, 3)).join(', ')}`;
        }

        return 'See detailed hours';
      }
      
      return workingHours;
    } catch (e) {
      return workingHours;
    }
}

/**
 * Returns the opening time for today if available from the JSON structure.
 */
export function getTodayOpeningTime(workingHours?: string | null): string {
    if (!workingHours) return 'Closed';
    try {
        if (workingHours.startsWith('[') || workingHours.startsWith('{')) {
            const parsed = JSON.parse(workingHours);
            const today = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
            
            let todayInfo: any = null;
            if (Array.isArray(parsed)) {
                todayInfo = parsed.find((d: any) => d.day === today);
            } else {
                todayInfo = parsed[today];
            }

            if (todayInfo && (todayInfo.isOpen || todayInfo.active)) {
                return todayInfo.openTime || todayInfo.from || 'Open Now';
            }
            return 'Closed Today';
        }
    } catch {}
    return 'See Hours';
}
