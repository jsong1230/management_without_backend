import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import type { Service } from '../types';

interface ServiceManagerProps {
  services: Service[];
  onSave: (service: Omit<Service, 'id'>) => void;
  onUpdate: (id: string, service: Partial<Service>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function ServiceManager({ services, onSave, onUpdate, onDelete, onClose }: ServiceManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Service, 'id'>>({
    name: '',
    duration: 60,
    price: 0,
    category: 'nail'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate(editingId, formData);
      setEditingId(null);
    } else {
      onSave(formData);
      setShowAddForm(false);
    }
    setFormData({ name: '', duration: 60, price: 0, category: 'nail' });
  };

  const startEdit = (service: Service) => {
    setEditingId(service.id);
    setFormData({
      name: service.name,
      duration: service.duration,
      price: service.price,
      category: service.category
    });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', duration: 60, price: 0, category: 'nail' });
  };

  const ServiceForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">서비스명</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">카테고리</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as 'nail' | 'lash' })}
          >
            <option value="nail">네일</option>
            <option value="lash">속눈썹</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">소요시간 (분)</label>
          <input
            type="number"
            required
            min="5"
            step="5"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">가격 (원)</label>
          <input
            type="number"
            required
            min="0"
            step="1000"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
          />
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => {
            if (editingId) cancelEdit();
            else setShowAddForm(false);
          }}
          className="btn btn-secondary"
        >
          <X className="w-4 h-4 mr-2" />
          취소
        </button>
        <button type="submit" className="btn btn-primary">
          <Save className="w-4 h-4 mr-2" />
          {editingId ? '수정' : '추가'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">서비스 관리</h2>
        <div className="flex space-x-3">
          {!showAddForm && !editingId && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              새 서비스
            </button>
          )}
          <button onClick={onClose} className="btn btn-secondary">
            <X className="w-4 h-4 mr-2" />
            닫기
          </button>
        </div>
      </div>

      {(showAddForm || editingId) && <ServiceForm />}

      <div className="space-y-4">
        {services.map((service) => (
          <div
            key={service.id}
            className={`bg-white p-4 rounded-lg shadow ${
              editingId === service.id ? 'ring-2 ring-purple-500' : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{service.name}</h3>
                <div className="text-sm text-gray-500 space-y-1">
                  <div>카테고리: {service.category === 'nail' ? '네일' : '속눈썹'}</div>
                  <div>소요시간: {service.duration}분</div>
                  <div>가격: {service.price.toLocaleString()}원</div>
                </div>
              </div>
              {editingId !== service.id && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit(service)}
                    className="p-1 hover:bg-gray-100 rounded-full text-gray-600 hover:text-purple-600"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('이 서비스를 삭제하시겠습니까?')) {
                        onDelete(service.id);
                      }
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full text-gray-600 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}