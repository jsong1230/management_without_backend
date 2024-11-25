import React, { useState } from 'react';
import { CreditCard, History } from 'lucide-react';
import { addMembershipBalance, getMembershipHistory } from '../lib/api';
import type { Customer, MembershipTransaction } from '../types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface MembershipManagerProps {
  customer: Customer;
  onUpdate: (updatedCustomer: Customer) => void;
}

export function MembershipManager({ customer, onUpdate }: MembershipManagerProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('card');
  const [notes, setNotes] = useState('');
  const [transactions, setTransactions] = useState<MembershipTransaction[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    try {
      setError(null);
      const updatedCustomer = await addMembershipBalance(
        customer.id,
        parseInt(amount),
        paymentMethod,
        notes
      );
      onUpdate(updatedCustomer);
      setAmount('');
      setNotes('');
      loadTransactions();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add balance');
    }
  };

  const loadTransactions = async () => {
    try {
      const data = await getMembershipHistory(customer.id);
      setTransactions(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load transactions');
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="text-lg font-medium text-purple-900">
          현재 회원권 잔액: {formatAmount(customer.membership_balance)}원
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleAddBalance} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">충전 금액</label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="number"
              required
              min="1000"
              step="1000"
              className="block w-full pr-12 border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">원</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">결제 방식</label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'transfer')}
          >
            <option value="card">카드</option>
            <option value="cash">현금</option>
            <option value="transfer">계좌이체</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">메모</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-purple-500 focus:border-purple-500"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary w-full">
          <CreditCard className="w-4 h-4 mr-2" />
          충전하기
        </button>
      </form>

      <div>
        <button
          onClick={() => {
            setShowHistory(!showHistory);
            if (!showHistory) loadTransactions();
          }}
          className="btn btn-secondary w-full"
        >
          <History className="w-4 h-4 mr-2" />
          {showHistory ? '내역 숨기기' : '충전/사용 내역 보기'}
        </button>

        {showHistory && (
          <div className="mt-4 space-y-2">
            {transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-4">내역이 없습니다</p>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white p-3 rounded-lg shadow border border-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {formatAmount(transaction.amount)}원
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(transaction.transaction_date), 'yyyy년 M월 d일', {
                          locale: ko,
                        })}
                      </div>
                    </div>
                    <div className="text-sm">
                      {transaction.payment_method === 'card' && '카드'}
                      {transaction.payment_method === 'cash' && '현금'}
                      {transaction.payment_method === 'transfer' && '계좌이체'}
                    </div>
                  </div>
                  {transaction.notes && (
                    <div className="mt-1 text-sm text-gray-600">
                      {transaction.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}