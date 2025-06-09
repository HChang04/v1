import React, { useState } from 'react';
import {
  format,
  eachDayOfInterval,
  getDay,
  isSameMonth,
  isSameDay,
  getDate,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths
} from 'date-fns';

import Button from './Button'; // Assuming you have a Button component

interface CalendarEvent {
  date: Date;
  title: string;
  color?: string; // Tailwind color class e.g., 'bg-red-500'
}

interface CalendarViewProps {
  events?: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  highlightedDates?: Date[]; // For generic highlighting
  initialMonth?: Date;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  events = [],
  onDateClick,
  highlightedDates = [],
  initialMonth = new Date(),
}) => {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(initialMonth));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };
  
  const isHighlighted = (date: Date) => {
    return highlightedDates.some(hd => isSameDay(hd, date));
  };

  return (
    <div className="bg-[var(--color-base-200)] p-4 rounded-[var(--radius-box)] border border-[length:var(--border)] border-[var(--color-neutral)] text-[var(--color-base-content)]">
      <div className="flex items-center justify-between mb-4">
        <Button onClick={prevMonth} variant="ghost" size="sm">&lt; Prev</Button>
        <h2 className="text-xl font-semibold text-[var(--color-primary-content)]">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <Button onClick={nextMonth} variant="ghost" size="sm">Next &gt;</Button>
      </div>

      <div className="grid grid-cols-7 gap-px border border-[length:var(--border)] border-[var(--color-neutral)] bg-[var(--color-neutral)]">
        {weekdays.map(day => (
          <div key={day} className="py-2 text-center font-medium text-xs bg-[var(--color-base-300)]">
            {day}
          </div>
        ))}
      
        {days.map((day, idx) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, new Date());
          const isHDate = isHighlighted(day);

          return (
            <div
              key={idx}
              className={`
                p-1.5 min-h-[6rem] border-t border-[length:var(--border)] border-[var(--color-neutral)]
                ${isCurrentMonth ? 'bg-[var(--color-base-100)]' : 'bg-[var(--color-base-200)] opacity-60'}
                ${onDateClick ? 'cursor-pointer hover:bg-[var(--color-neutral)]' : ''}
                ${isToday ? 'border-2 border-[var(--color-primary)]' : ''}
                ${isHDate && !dayEvents.length ? 'bg-[var(--color-info)] bg-opacity-30' : ''}
              `}
              onClick={() => onDateClick && onDateClick(day)}
            >
              <span className={`
                text-sm 
                ${isCurrentMonth ? 'text-[var(--color-base-content)]' : 'text-[var(--color-base-content)] opacity-50'}
                ${isToday ? 'font-bold text-[var(--color-primary-content)]' : ''}
              `}>
                {getDate(day)}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayEvents.map(event => (
                  <div
                    key={event.title}
                    className={`
                      text-xs p-0.5 rounded-[var(--radius-selector)] truncate
                      ${event.color || 'bg-[var(--color-accent)] text-[var(--color-accent-content)]'}
                    `}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;