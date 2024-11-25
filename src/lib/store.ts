import { v4 as uuidv4 } from 'uuid';
import type { Customer, Service, Appointment, MembershipTransaction } from '../types';

const STORAGE_KEYS = {
  CUSTOMERS: 'salon_customers',
  SERVICES: 'salon_services',
  APPOINTMENTS: 'salon_appointments',
  MEMBERSHIP_TRANSACTIONS: 'salon_membership_transactions'
};

// Default services
const defaultServices: Service[] = [
  { id: uuidv4(), name: '젤네일 기본', duration: 90, price: 70000, category: 'nail' },
  { id: uuidv4(), name: '젤네일 아트', duration: 120, price: 90000, category: 'nail' },
  { id: uuidv4(), name: '젤 제거', duration: 30, price: 20000, category: 'nail' },
  { id: uuidv4(), name: '패디큐어 기본', duration: 60, price: 60000, category: 'nail' },
  { id: uuidv4(), name: '패디큐어 아트', duration: 90, price: 80000, category: 'nail' },
  { id: uuidv4(), name: '손톱 연장', duration: 120, price: 100000, category: 'nail' },
  { id: uuidv4(), name: '큐티클 케어', duration: 30, price: 30000, category: 'nail' },
  { id: uuidv4(), name: '속눈썹 풀세트', duration: 120, price: 80000, category: 'lash' },
  { id: uuidv4(), name: '속눈썹 리터치', duration: 60, price: 40000, category: 'lash' },
  { id: uuidv4(), name: '속눈썹 연장', duration: 90, price: 60000, category: 'lash' },
  { id: uuidv4(), name: '속눈썹 제거', duration: 30, price: 20000, category: 'lash' }
];

// Initialize store
export const initializeStore = () => {
  if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(defaultServices));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MEMBERSHIP_TRANSACTIONS)) {
    localStorage.setItem(STORAGE_KEYS.MEMBERSHIP_TRANSACTIONS, JSON.stringify([]));
  }
};

// Data Export/Import
export const exportData = () => {
  const data = {
    customers: JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]'),
    services: JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES) || '[]'),
    appointments: JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]'),
    membershipTransactions: JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERSHIP_TRANSACTIONS) || '[]'),
    metadata: {
      version: '1.0',
      exportDate: new Date().toISOString()
    }
  };

  return data;
};

export const importData = (data: any) => {
  try {
    // Validate data structure
    const requiredKeys = ['customers', 'services', 'appointments', 'membershipTransactions'];
    const missingKeys = requiredKeys.filter(key => !data[key]);
    
    if (missingKeys.length > 0) {
      throw new Error(`필수 데이터가 누락되었습니다: ${missingKeys.join(', ')}`);
    }

    // Validate data integrity
    const validateIds = (items: any[], type: string) => {
      const hasValidId = items.every(item => typeof item.id === 'string' && item.id.length > 0);
      if (!hasValidId) {
        throw new Error(`${type} 데이터에 잘못된 ID가 있습니다`);
      }
    };

    validateIds(data.customers, '고객');
    validateIds(data.services, '서비스');
    validateIds(data.appointments, '예약');
    validateIds(data.membershipTransactions, '회원권 거래');

    // Import all data
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(data.customers));
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(data.services));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(data.appointments));
    localStorage.setItem(STORAGE_KEYS.MEMBERSHIP_TRANSACTIONS, JSON.stringify(data.membershipTransactions));

    return {
      success: true,
      summary: {
        customers: data.customers.length,
        services: data.services.length,
        appointments: data.appointments.length,
        transactions: data.membershipTransactions.length
      }
    };
  } catch (error) {
    console.error('데이터 가져오기 실패:', error);
    throw new Error(error instanceof Error ? error.message : '데이터 가져오기에 실패했습니다');
  }
};

// Customers
export const getCustomers = (): Customer[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CUSTOMERS) || '[]');
};

export const createCustomer = (customerData: Omit<Customer, 'id' | 'membership_balance'>): Customer => {
  const customers = getCustomers();
  const newCustomer = {
    ...customerData,
    id: uuidv4(),
    membership_balance: 0
  };
  customers.push(newCustomer);
  localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  return newCustomer;
};

// Services
export const getServices = (): Service[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES) || '[]');
};

// Appointments
export const getAppointments = (): Appointment[] => {
  const appointments = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
  const customers = getCustomers();
  const services = getServices();

  return appointments.map(apt => ({
    ...apt,
    customer_name: customers.find(c => c.id === apt.customer_id)?.name || '알 수 없음',
    service_name: services.find(s => s.id === apt.service_id)?.name || '알 수 없음',
    service_category: services.find(s => s.id === apt.service_id)?.category || 'nail'
  }));
};

export const createAppointment = (appointmentData: Omit<Appointment, 'id'>): Appointment => {
  const appointments = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
  const customers = getCustomers();
  const services = getServices();

  const customer = customers.find(c => c.id === appointmentData.customer_id);
  const service = services.find(s => s.id === appointmentData.service_id);

  const newAppointment = {
    ...appointmentData,
    id: uuidv4(),
    customer_name: customer?.name || '알 수 없음',
    service_name: service?.name || '알 수 없음',
    service_category: service?.category || 'nail'
  };

  appointments.push(newAppointment);
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  return newAppointment;
};

export const updateAppointment = (id: string, updates: Partial<Appointment>): Appointment | null => {
  const appointments = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
  const index = appointments.findIndex(apt => apt.id === id);
  
  if (index === -1) return null;
  
  appointments[index] = { ...appointments[index], ...updates };
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));

  const customers = getCustomers();
  const services = getServices();

  const customer = customers.find(c => c.id === appointments[index].customer_id);
  const service = services.find(s => s.id === appointments[index].service_id);

  return {
    ...appointments[index],
    customer_name: customer?.name || '알 수 없음',
    service_name: service?.name || '알 수 없음',
    service_category: service?.category || 'nail'
  };
};

// Membership Transactions
export const getMembershipTransactions = (): MembershipTransaction[] => {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERSHIP_TRANSACTIONS) || '[]');
};

export const addMembershipTransaction = (
  customerId: string,
  amount: number,
  paymentMethod: 'cash' | 'card' | 'transfer',
  notes?: string
): MembershipTransaction => {
  const transactions = getMembershipTransactions();
  const transaction: MembershipTransaction = {
    id: uuidv4(),
    customer_id: customerId,
    amount,
    payment_method: paymentMethod,
    transaction_date: new Date().toISOString(),
    notes
  };

  transactions.push(transaction);
  localStorage.setItem(STORAGE_KEYS.MEMBERSHIP_TRANSACTIONS, JSON.stringify(transactions));
  return transaction;
};