import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, Search, UserPlus, DollarSign, LogOut, Calendar as CalendarIcon, Settings } from 'lucide-react';
import { Calendar } from './components/Calendar';
import { AppointmentList } from './components/AppointmentList';
import { CustomerList } from './components/CustomerList';
import { CustomerForm } from './components/CustomerForm';
import { AppointmentForm } from './components/AppointmentForm';
import { MembershipManager } from './components/MembershipManager';
import { SalesReport } from './components/SalesReport';
import { LoginForm } from './components/LoginForm';
import { DataManagement } from './components/DataManagement';
import { ServiceManager } from './components/ServiceManager';
import { 
  fetchAppointments, 
  fetchCustomers, 
  fetchServices, 
  login, 
  logout,
  createAppointment 
} from './lib/api';
import { v4 as uuidv4 } from 'uuid';
import type { Appointment, Customer, Service } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [showCustomerList, setShowCustomerList] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showMembershipManager, setShowMembershipManager] = useState(false);
  const [showSalesReport, setShowSalesReport] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [showServiceManager, setShowServiceManager] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      const [appointmentsData, customersData, servicesData] = await Promise.all([
        fetchAppointments(),
        fetchCustomers(),
        fetchServices()
      ]);
      setAppointments(appointmentsData);
      setCustomers(customersData);
      setServices(servicesData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load data');
    }
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      const token = await login(username, password);
      setIsAuthenticated(true);
      loadData();
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">네일 & 속눈썹 예약 관리</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowServiceManager(true)}
              className="btn btn-secondary"
            >
              <Settings className="w-4 h-4 mr-2" />
              서비스 관리
            </button>
            <button
              onClick={() => setShowDataManagement(true)}
              className="btn btn-secondary"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              데이터 관리
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-red-50 text-red-700 p-4 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={() => {
              setShowCustomerSearch(true);
              setShowCustomerList(true);
            }}
            className="btn btn-primary"
          >
            <Search className="w-4 h-4 mr-2" />
            고객 검색
          </button>
          <button
            onClick={() => setShowNewCustomerForm(true)}
            className="btn btn-primary"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            새 고객 등록
          </button>
          <button
            onClick={() => {
              setShowCustomerSearch(false);
              setShowCustomerList(true);
            }}
            className="btn btn-primary"
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            예약하기
          </button>
          <button
            onClick={() => setShowSalesReport(true)}
            className="btn btn-primary"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            매출 관리
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Calendar
            appointments={appointments}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onViewAllAppointments={(date) => {
              setSelectedDate(date);
            }}
          />
          <AppointmentList
            appointments={appointments}
            selectedDate={selectedDate}
            onSelectAppointment={(appointment) => {
              setSelectedAppointment(appointment);
              const customer = customers.find(c => c.id === appointment.customer_id);
              if (customer) {
                setSelectedCustomer(customer);
                setShowAppointmentForm(true);
              }
            }}
          />
        </div>
      </main>

      {showCustomerList && (
        <div className="modal">
          <div className="modal-content">
            <CustomerList
              customers={customers}
              onSelectCustomer={(customer) => {
                setSelectedCustomer(customer);
                setShowCustomerList(false);
                if (showCustomerSearch) {
                  setShowMembershipManager(true);
                } else {
                  setShowAppointmentForm(true);
                }
              }}
              onClose={() => setShowCustomerList(false)}
            />
          </div>
        </div>
      )}

      {showNewCustomerForm && (
        <div className="modal">
          <div className="modal-content">
            <CustomerForm
              onSave={(newCustomer) => {
                setCustomers([...customers, newCustomer]);
                setShowNewCustomerForm(false);
              }}
              onCancel={() => setShowNewCustomerForm(false)}
            />
          </div>
        </div>
      )}

      {showAppointmentForm && selectedCustomer && (
        <div className="modal">
          <div className="modal-content">
            <AppointmentForm
              customer={selectedCustomer}
              appointment={selectedAppointment}
              onSave={async (appointmentData) => {
                try {
                  const newAppointment = await createAppointment(appointmentData);
                  setAppointments([...appointments, newAppointment]);
                  setShowAppointmentForm(false);
                  setSelectedAppointment(null);
                } catch (error) {
                  setError(error instanceof Error ? error.message : 'Failed to create appointment');
                }
              }}
              onCancel={() => {
                setShowAppointmentForm(false);
                setSelectedAppointment(null);
              }}
            />
          </div>
        </div>
      )}

      {showMembershipManager && selectedCustomer && (
        <div className="modal">
          <div className="modal-content">
            <MembershipManager
              customer={selectedCustomer}
              onUpdate={(updatedCustomer) => {
                setCustomers(customers.map(c => 
                  c.id === updatedCustomer.id ? updatedCustomer : c
                ));
                setShowMembershipManager(false);
              }}
            />
          </div>
        </div>
      )}

      {showSalesReport && (
        <div className="modal">
          <div className="modal-content">
            <SalesReport
              appointments={appointments}
              onClose={() => setShowSalesReport(false)}
            />
          </div>
        </div>
      )}

      {showDataManagement && (
        <div className="modal">
          <div className="modal-content">
            <DataManagement
              onSuccess={() => {
                loadData();
                setShowDataManagement(false);
              }}
              onError={setError}
            />
          </div>
        </div>
      )}

      {showServiceManager && (
        <div className="modal">
          <div className="modal-content">
            <ServiceManager
              services={services}
              onSave={(serviceData) => {
                const newService = { ...serviceData, id: uuidv4() };
                setServices([...services, newService]);
              }}
              onUpdate={(id, updates) => {
                setServices(services.map(s => 
                  s.id === id ? { ...s, ...updates } : s
                ));
              }}
              onDelete={(id) => {
                setServices(services.filter(s => s.id !== id));
              }}
              onClose={() => setShowServiceManager(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;