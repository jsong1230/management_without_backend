import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import type { Customer } from '../types';
import { createCustomer } from '../lib/api';

interface CustomerFormProps {
  onSave: (customer: Customer) => void;
  onCancel: () => void;
}

export function CustomerForm({ onSave, onCancel }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    preferences: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^010\d{8}$/;
    const cleaned = phone.replace(/[^0-9]/g, '');
    return phoneRegex.test(cleaned);
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length >= 11) {
      return cleaned.slice(0, 11).replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }
    return cleaned.replace(/(\d{3})(\d{0,4})(\d{0,4})/, (match, p1, p2, p3) => {
      let formatted = p1;
      if (p2) formatted += `-${p2}`;
      if (p3) formatted += `-${p3}`;
      return formatted;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanedPhone = formData.phone.replace(/[^0-9]/g, '');
    if (!validatePhoneNumber(cleanedPhone)) {
      setError('휴대폰 번호는 010으로 시작하는 11자리 숫자여야 합니다');
      return;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('올바른 이메일 주소를 입력해주세요');
      return;
    }

    if (!formData.name.trim()) {
      setError('이름을 입력해주세요');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const newCustomer = createCustomer({
        ...formData,
        phone: formatPhoneNumber(cleanedPhone)
      });
      
      onSave(newCustomer);
    } catch (err) {
      setError(err instanceof Error ? err.message : '고객 등록에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPhoneNumber(value);
    setFormData({ ...formData, phone: formatted });
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">이름</label>
        <input
          type="text"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            setError(null);
          }}
          placeholder="홍길동"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">휴대폰 번호</label>
        <input
          type="tel"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          value={formData.phone}
          onChange={handlePhoneChange}
          placeholder="010-0000-0000"
          maxLength={13}
        />
        <p className="mt-1 text-sm text-gray-500">
          010으로 시작하는 휴대폰 번호를 입력해주세요
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">이메일</label>
        <input
          type="email"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            setError(null);
          }}
          placeholder="example@email.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">선호 스타일/특이사항</label>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
          rows={3}
          value={formData.preferences}
          onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
          placeholder="고객의 선호도나 특이사항을 입력해주세요"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          disabled={isSubmitting}
        >
          <X className="w-4 h-4 mr-2" />
          취소
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          <Save className="w-4 h-4 mr-2" />
          {isSubmitting ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  );
}