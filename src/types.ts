export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  preferences?: string;
  membership_balance: number;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: 'nail' | 'lash';
}

export interface Appointment {
  id: string;
  customer_id: string;
  customer_name?: string;
  service_id: string;
  service_name?: string;
  service_category?: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  payment_amount?: number;
  payment_method?: 'cash' | 'card' | 'transfer' | 'membership';
}

export interface MembershipTransaction {
  id: string;
  customer_id: string;
  amount: number;
  payment_method: 'cash' | 'card' | 'transfer';
  transaction_date: string;
  notes?: string;
}