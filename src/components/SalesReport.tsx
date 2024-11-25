import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import { BarChart, X } from 'lucide-react';
import type { Appointment } from '../types';

interface SalesReportProps {
  appointments: Appointment[];
  onClose: () => void;
}

export function SalesReport({ appointments, onClose }: SalesReportProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const months = eachMonthOfInterval({
    start: subMonths(new Date(), 11),
    end: new Date()
  });

  const calculateMonthlySales = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    
    const monthlyAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= start && aptDate <= end && apt.status === 'completed';
    });

    const sales = {
      total: 0,
      byPaymentMethod: {
        cash: 0,
        card: 0,
        transfer: 0,
        membership: 0
      }
    };

    monthlyAppointments.forEach(apt => {
      if (apt.payment_amount) {
        sales.total += apt.payment_amount;
        if (apt.payment_method) {
          sales.byPaymentMethod[apt.payment_method] += apt.payment_amount;
        }
      }
    });

    return sales;
  };

  const formatAmount = (amount: number) => new Intl.NumberFormat('ko-KR').format(amount);

  const monthlySales = calculateMonthlySales(selectedMonth);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center">
          <BarChart className="w-6 h-6 mr-2 text-purple-600" />
          매출 관리
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">월 선택</label>
        <select
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          value={selectedMonth.toISOString()}
          onChange={(e) => setSelectedMonth(new Date(e.target.value))}
        >
          {months.map((month) => (
            <option key={month.toISOString()} value={month.toISOString()}>
              {format(month, 'yyyy년 M월', { locale: ko })}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {format(selectedMonth, 'yyyy년 M월', { locale: ko })} 매출 현황
        </h3>
        
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-lg font-medium text-purple-900">
              총 매출: {formatAmount(monthlySales.total)}원
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-900">현금</div>
              <div className="text-lg font-medium text-blue-900">
                {formatAmount(monthlySales.byPaymentMethod.cash)}원
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-900">카드</div>
              <div className="text-lg font-medium text-green-900">
                {formatAmount(monthlySales.byPaymentMethod.card)}원
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-yellow-900">계좌이체</div>
              <div className="text-lg font-medium text-yellow-900">
                {formatAmount(monthlySales.byPaymentMethod.transfer)}원
              </div>
            </div>
            <div className="bg-pink-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-pink-900">회원권</div>
              <div className="text-lg font-medium text-pink-900">
                {formatAmount(monthlySales.byPaymentMethod.membership)}원
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}