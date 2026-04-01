import { useState, useMemo } from 'react';
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameMonth, isSameDay, isToday,
  addMonths, subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, ExternalLink, Calendar, Clock } from 'lucide-react';
import { MentorshipRequest } from '../types';
import Avatar from './Avatar';

interface SessionCalendarProps {
  sessions: MentorshipRequest[];
  userRole: string;
}

export default function SessionCalendar({ sessions, userRole }: SessionCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Map of date string -> sessions on that date
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, MentorshipRequest[]>();
    sessions.forEach((s) => {
      if (s.scheduledAt) {
        const key = format(new Date(s.scheduledAt), 'yyyy-MM-dd');
        const existing = map.get(key) || [];
        existing.push(s);
        map.set(key, existing);
      }
    });
    return map;
  }, [sessions]);

  // Build calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const selectedDateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null;
  const selectedSessions = selectedDateKey ? (sessionsByDate.get(selectedDateKey) || []) : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Session Calendar</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[120px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className="py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const daySessions = sessionsByDate.get(dateKey) || [];
          const hasSession = daySessions.length > 0;
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);

          return (
            <button
              key={dateKey}
              onClick={() => hasSession ? setSelectedDate(isSelected ? null : day) : undefined}
              className={`relative py-2.5 text-center text-sm transition-all border-b border-r border-gray-50 dark:border-gray-700/50 ${
                !isCurrentMonth
                  ? 'text-gray-300 dark:text-gray-600'
                  : hasSession
                  ? 'cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 font-medium'
                  : 'text-gray-700 dark:text-gray-300'
              } ${
                isSelected
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : ''
              } ${
                today && !isSelected
                  ? 'font-bold text-primary-600 dark:text-primary-400'
                  : ''
              }`}
            >
              <span>{format(day, 'd')}</span>
              {hasSession && isCurrentMonth && (
                <div className="flex justify-center gap-0.5 mt-0.5">
                  {daySessions.slice(0, 3).map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected
                          ? 'bg-primary-600 dark:bg-primary-400'
                          : 'bg-green-500 dark:bg-green-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date session details */}
      {selectedDate && (
        <div className="border-t border-gray-100 dark:border-gray-700 p-4">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            <span className="ml-2 text-xs font-normal text-gray-400">
              {selectedSessions.length} session{selectedSessions.length !== 1 ? 's' : ''}
            </span>
          </h4>
          <div className="space-y-3">
            {selectedSessions.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500">No sessions on this date</p>
            ) : (
              selectedSessions.map((session) => {
                const counterpart = userRole === 'alumni' ? session.studentId : session.alumniId;
                const roleLabel = userRole === 'alumni' ? 'Student' : 'Mentor';
                return (
                  <div
                    key={session._id}
                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                  >
                    <Avatar name={counterpart?.name || ''} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {counterpart?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{roleLabel}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        <span className="font-medium">Topic:</span> {session.topic}
                      </p>
                      {session.scheduledAt && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          {format(new Date(session.scheduledAt), 'h:mm a')}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          session.status === 'accepted'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {session.status === 'accepted' ? 'Upcoming' : 'Completed'}
                        </span>
                        {session.sessionLink && session.status === 'accepted' && (
                          <a
                            href={session.sessionLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Join
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
