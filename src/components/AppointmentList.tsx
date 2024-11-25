import React from 'react';
import { Clock, User, Scissors, Edit2 } from 'lucide-react';
import type { Appointment } from '../types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface AppointmentListProps {
  appointments: Appointment[];
  selectedDate: Date;
  onSelectAppointment: (appointment: Appointment) => void;
}

export function AppointmentList({ appointments, selectedDate, onSelectAppointment }: AppointmentListProps) {
  const dateString = format(selectedDate, 'yyyy년 M월 d일 (EEEE)', { locale: ko });
  
  const filteredAppointments = appointments
    .filter(apt => apt.date === format(selectedDate, 'yyyy-MM-dd'))
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <Clock className="w-5 h-5 mr-2 text-purple-600" />
        {dateString}의 예약 ({filteredAppointments.length}건)
      </h2>
      
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-4 text-gray-500">예약이 없습니다</div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-800">
                    {appointment.customer_name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {appointment.status === 'scheduled' ? '예약됨' :
                     appointment.status === 'completed' ? '완료' : '취소됨'}
                  </span>
                  <button
                    onClick={() => onSelectAppointment(appointment)}
                    className="p-1 hover:bg-gray-100 rounded-full text-gray-600 hover:text-purple-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{appointment.time}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Scissors className="w-4 h-4" />
                  <span>{appointment.service_name}</span>
                </div>
              </div>
              
              {appointment.notes && (
                <div className="mt-2 text-sm text-gray-500">
                  {appointment.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}