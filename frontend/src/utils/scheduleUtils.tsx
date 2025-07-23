import React from 'react';
import { Schedule, TimeSlot } from '../types';

export const formatSchedule = (scheduleStr: string): string => {
  try {
    const schedule: Schedule = JSON.parse(scheduleStr);
    const dayOrder: (keyof Schedule)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    const days = dayOrder
      .filter(day => schedule[day] && schedule[day].length > 0)
      .map(day => {
        const dayName = day.charAt(0).toUpperCase() + day.slice(1);
        // Sort time slots by start time
        const sortedSlots = [...schedule[day]].sort((a, b) => a.start.localeCompare(b.start));
        const slots = sortedSlots.map((slot: TimeSlot) => `${slot.start}-${slot.end} (${slot.room})`).join(', ');
        return `${dayName}: ${slots}`;
      });
    
    return days.length > 0 ? days.join(' | ') : 'No schedule';
  } catch {
    return scheduleStr;
  }
};

export const formatScheduleForTable = (scheduleStr: string): JSX.Element => {
  try {
    const schedule: Schedule = JSON.parse(scheduleStr);
    const dayOrder: (keyof Schedule)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    const activeDays = dayOrder
      .filter(day => schedule[day] && schedule[day].length > 0)
      .map(day => {
        const dayName = day.charAt(0).toUpperCase() + day.slice(1).substring(0, 2); // Mon, Tue, Wed...
        const sortedSlots = [...schedule[day]].sort((a, b) => a.start.localeCompare(b.start));
        return {
          day: dayName,
          slots: sortedSlots
        };
      });

    if (activeDays.length === 0) {
      return <span className="badge bg-secondary">No schedule</span>;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {activeDays.map(({ day, slots }) => (
          <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge bg-primary" style={{ minWidth: '45px' }}>
              {day}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {slots.map((slot: TimeSlot, slotIndex) => (
                <div key={slotIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge bg-light text-dark">{slot.start} - {slot.end}</span>
                  <span className="badge bg-info text-dark">{slot.room}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  } catch {
    return <span className="badge bg-danger">Invalid schedule</span>;
  }
};

export const getScheduleForDisplay = (scheduleStr: string) => {
  try {
    const schedule: Schedule = JSON.parse(scheduleStr);
    const result: { days: string; time: string; room: string } = {
      days: '',
      time: '',
      room: ''
    };
    
    const activeDays = Object.entries(schedule)
      .filter(([_, timeSlots]) => timeSlots.length > 0);
    
    if (activeDays.length > 0) {
      result.days = activeDays.map(([day]) => day.charAt(0).toUpperCase() + day.slice(1)).join(', ');
      
      const allSlots = activeDays.flatMap(([_, timeSlots]) => timeSlots);
      if (allSlots.length > 0) {
        const timeRanges = allSlots.map((slot: TimeSlot) => `${slot.start}-${slot.end}`);
        const uniqueRooms = allSlots.map((slot: TimeSlot) => slot.room).filter((room, index, arr) => arr.indexOf(room) === index);
        
        result.time = timeRanges.join(', ');
        result.room = uniqueRooms.join(', ');
      }
    }
    
    return result;
  } catch {
    return {
      days: 'Invalid schedule',
      time: '',
      room: ''
    };
  }
};