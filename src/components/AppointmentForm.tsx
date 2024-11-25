import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { format, isBefore, parseISO, set } from 'date-fns';
import type { Customer, Service, Appointment } from '../types';
import { fetchServices } from '../lib/api';

interface AppointmentFormProps {
  customer: Customer;
  appointment: Appointment | null;
  onSave: (appointmentData: {
    customer_id: string;
    service_id: string;
    service_name: string;
    service_category: string;
    date: string;
    time: string;
    duration: number;
    status: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
}

export function AppointmentForm({ customer, appointment, onSave, onCancel }: AppointmentFormProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'nail' | 'lash'>(
    appointment?.service_category as 'nail' | 'lash' || 'nail'
  );
  const [formData, setFormData] = useState({
    service_id: appointment?.service_id || '',
    date: appointment?.date || format(new Date(), 'yyyy-MM-dd'),
    time: appointment?.time || format(new Date(), 'HH:mm'),
    notes: appointment?.notes || '',
    status: appointment?.status || 'scheduled'
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await fetchServices();
        setServices(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load services:', error);
        setError('서비스 목록을 불러오는데 실패했습니다');
        setIsLoading(false);
      }
    };
    loadServices();
  }, []);

  const filteredServices = services.filter(service => service.category === selectedCategory);

  const validateDateTime = (date: string, time: string): boolean => {
    const appointmentDateTime = set(parseISO(date), {
      hours: parseInt(time.split(':')[0]),
      minutes: parseInt(time.split(':')[1]),
      seconds: 0,
      milliseconds: 0
    });

    const now = new Date();
    
    if (isBefore(appointmentDateTime, now)) {
      setError('현재 시간 이후로만 예약이 가능합니다.');
      return false;
    }

    setError(null);
    return true;
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeString);
      }
    }
    return options;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateDateTime(formData.date, formData.time)) {
      return;
    }

    const service = services.find(s => s.id === formData.service_id);
    if (!service) {
      setError('서비스를 선택해주세요');
      return;
    }

    onSave({
      customer_id: customer.id,
      service_id: service.id,
      service_name: service.name,
      service_category: service.category,
      date: formData.date,
      time: formData.time,
      duration: service.duration,
      status: formData.status,
      notes: formData.notes
    });
  };

  if (isLoading) {
    return <div className="text-center py-4">서비스 목록을 불러오는 중...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">고객명</label>
        <div className="mt-1 p-2 bg-gray-50 rounded-md">
          {customer.name}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">서비스 종류</label>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`py-2 px-4 rounded-md ${
              selectedCategory === 'nail'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedCategory('nail')}
          >
            네일
          </button>
          <button
            type="button"
            className={`py-2 px-4 rounded-md ${
              selectedCategory === 'lash'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setSelectedCategory('lash')}
          >
            속눈썹
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">서비스 선택</label>
        <select
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          value={formData.service_id}
          onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
        >
          <option value="">서비스를 선택하세요</option>
          {filteredServices.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} ({service.duration}분, {service.price.toLocaleString()}원)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">날짜</label>
        <input
          type="date"
          required
          min={format(new Date(), 'yyyy-MM-dd')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          value={formData.date}
          onChange={(e) => {
            const newDate = e.target.value;
            setFormData({ ...formData, date: newDate });
            validateDateTime(newDate, formData.time);
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">시간</label>
        <select
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          value={formData.time}
          onChange={(e) => {
            const newTime = e.target.value;
            setFormData({ ...formData, time: newTime });
            validateDateTime(formData.date, newTime);
          }}
        >
          <option value="">시간을 선택하세요</option>
          {generateTimeOptions().map((time) => (
            <option key={time} value={time}>
              {time}
            </option>
          ))}
        </select>
        <p className="mt-1 text-sm text-gray-500">5분 단위로 선택 가능합니다</p>
      </div>

      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}

      {appointment && (
        <div>
          <label className="block text-sm font-medium text-gray-700">상태</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="scheduled">예약됨</option>
            <option value="completed">완료</option>
            <option value="cancelled">취소됨</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">메모</label>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          <X className="w-4 h-4 mr-2" />
          취소
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!!error}
        >
          <Save className="w-4 h-4 mr-2" />
          {appointment ? '수정하기' : '예약하기'}
        </button>
      </div>
    </form>
  );
}