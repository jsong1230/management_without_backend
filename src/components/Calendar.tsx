import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, startOfWeek, endOfWeek, addDays, isBefore, startOfDay, getDay } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Appointment } from '../types';

interface CalendarProps {
  appointments: Appointment[];
  onSelectDate: (date: Date) => void;
  onViewAllAppointments: (date: Date) => void;
  selectedDate: Date;
}

export function Calendar({ appointments, onSelectDate, onViewAllAppointments, selectedDate }: CalendarProps) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { locale: ko });
  const calendarEnd = endOfWeek(addDays(monthEnd, 28), { locale: ko }); // 달력을 4주 더 길게 보여주기
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handlePrevMonth = () => {
    const prevMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
    onSelectDate(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
    onSelectDate(nextMonth);
  };

  const now = new Date();
  const currentTime = format(now, 'a hh:mm', { locale: ko });
  const currentDate = format(now, 'yyyy년 M월 d일 EEEE', { locale: ko });

  const getAppointmentStats = (date: Date) => {
    const dayAppointments = appointments.filter((apt) =>
      apt.date === format(date, 'yyyy-MM-dd')
    );

    const scheduled = dayAppointments.filter(apt => apt.status === 'scheduled').length;
    const completed = dayAppointments.filter(apt => apt.status === 'completed').length;
    const cancelled = dayAppointments.filter(apt => apt.status === 'cancelled').length;

    return { scheduled, completed, cancelled, total: dayAppointments.length };
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-purple-50 rounded-lg p-3 mb-4">
        <div className="text-purple-800 font-medium">
          {currentDate}
        </div>
        <div className="text-purple-600">
          현재 시각: {currentTime}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold">
          {format(selectedDate, 'yyyy년 M월', { locale: ko })}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div
            key={day}
            className="text-center font-medium text-sm text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
          const stats = getAppointmentStats(day);
          const isPastDate = isBefore(day, startOfDay(now));
          const dayOfWeek = getDay(day);

          return (
            <div
              key={day.toISOString()}
              className={`
                h-24 p-1 text-sm rounded-lg relative
                ${!isCurrentMonth ? 'text-gray-400 bg-gray-50' : 'bg-white'}
                ${isSameDay(day, selectedDate) ? 'ring-2 ring-purple-500' : ''}
                ${isToday(day) ? 'font-bold' : ''}
                ${isPastDate ? 'opacity-50' : 'hover:bg-purple-50 cursor-pointer'}
                ${dayOfWeek === 0 ? 'text-red-500' : ''}
                ${dayOfWeek === 6 ? 'text-blue-500' : ''}
              `}
              onClick={() => !isPastDate && onSelectDate(day)}
              onDoubleClick={() => !isPastDate && onViewAllAppointments(day)}
            >
              <div className="absolute top-1 right-2">
                {format(day, 'd')}
              </div>
              <div className="absolute bottom-1 left-1 right-1 text-xs space-y-0.5">
                {stats.scheduled > 0 && (
                  <div className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                    예약: {stats.scheduled}
                  </div>
                )}
                {stats.completed > 0 && (
                  <div className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                    완료: {stats.completed}
                  </div>
                )}
                {stats.cancelled > 0 && (
                  <div className="bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full">
                    취소: {stats.cancelled}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}