import React, { useState } from 'react';
import { User, Phone, Mail, Search, X } from 'lucide-react';
import type { Customer } from '../types';

interface CustomerListProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
  onClose: () => void;
}

export function CustomerList({ customers, onSelectCustomer, onClose }: CustomerListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="이름, 전화번호, 이메일로 검색"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={onClose}
          className="ml-4 p-2 text-gray-400 hover:text-gray-500"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="max-h-[60vh] overflow-y-auto">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            검색 결과가 없습니다
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => onSelectCustomer(customer)}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">{customer.name}</span>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{customer.phone}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <span>{customer.email}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}