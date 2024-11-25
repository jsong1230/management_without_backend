import { v4 as uuidv4 } from 'uuid';
import type { Appointment, Customer, Service, MembershipTransaction } from '../types';
import {
  getCustomers,
  getServices,
  getAppointments,
  createCustomer as storeCreateCustomer,
  createAppointment as storeCreateAppointment,
  updateAppointment as storeUpdateAppointment,
  addMembershipTransaction,
  getMembershipTransactions,
  initializeStore
} from './store';

// Initialize store
initializeStore();

// Authentication
export const login = async (username: string, password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (username === 'admin' && password === 'admin123') {
      const token = 'demo-token';
      localStorage.setItem('auth_token', token);
      resolve(token);
    } else {
      reject(new Error('아이디 또는 비밀번호가 올바르지 않습니다'));
    }
  });
};

export const logout = () => {
  localStorage.removeItem('auth_token');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token');
};

// Customers
export const fetchCustomers = async (): Promise<Customer[]> => {
  return Promise.resolve(getCustomers());
};

export const createCustomer = (customerData: Omit<Customer, 'id' | 'membership_balance'>): Customer => {
  return storeCreateCustomer(customerData);
};

// Services
export const fetchServices = async (): Promise<Service[]> => {
  return Promise.resolve(getServices());
};

// Appointments
export const fetchAppointments = async (): Promise<Appointment[]> => {
  return Promise.resolve(getAppointments());
};

export const createAppointment = async (appointmentData: Omit<Appointment, 'id'>): Promise<Appointment> => {
  return storeCreateAppointment(appointmentData);
};

export const updateAppointment = async (id: string, updates: Partial<Appointment>): Promise<Appointment | null> => {
  return storeUpdateAppointment(id, updates);
};

// Membership
export const addMembershipBalance = async (
  customerId: string,
  amount: number,
  paymentMethod: 'cash' | 'card' | 'transfer',
  notes?: string
): Promise<Customer> => {
  const customers = getCustomers();
  const customerIndex = customers.findIndex(c => c.id === customerId);
  
  if (customerIndex === -1) {
    throw new Error('고객을 찾을 수 없습니다');
  }

  const customer = customers[customerIndex];
  customer.membership_balance = (customer.membership_balance || 0) + amount;
  customers[customerIndex] = customer;
  
  // Add transaction record
  addMembershipTransaction(customerId, amount, paymentMethod, notes);

  localStorage.setItem('salon_customers', JSON.stringify(customers));
  return customer;
};

export const getMembershipHistory = async (customerId: string): Promise<MembershipTransaction[]> => {
  const transactions = getMembershipTransactions();
  return transactions.filter(t => t.customer_id === customerId);
};