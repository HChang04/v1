
import React, { useState, useEffect, useCallback } from 'react';
import { Employee, UserRole } from '../../types';
import { mockFetchAllEmployees, mockCreateEmployee, mockUpdateEmployee, mockDeleteEmployee } from '../../services/mockApiService';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ICONS, DEFAULT_AVATAR_URL } from '../../constants';
import { format } from 'date-fns';

const EmployeeManagementPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Partial<Employee> | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const allEmployees = await mockFetchAllEmployees();
      setEmployees(allEmployees);
    } catch (err) {
      console.error("Failed to fetch employees", err);
      setError("Could not load employees.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editingEmployee) return;
    const { name, value } = e.target;
    setEditingEmployee(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingEmployee({ joinDate: format(new Date(), 'yyyy-MM-dd'), status: 'Active' });
    setModalMode('add');
    setIsModalOpen(true);
  };

  const openEditModal = (employee: Employee) => {
    setEditingEmployee({...employee, joinDate: format(new Date(employee.joinDate), 'yyyy-MM-dd')});
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (employeeId: string) => {
    if (window.confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
      setIsLoading(true); // Or specific delete loading
      try {
        await mockDeleteEmployee(employeeId);
        fetchEmployees();
      } catch (err) {
        console.error("Failed to delete employee", err);
        setError("Failed to delete employee.");
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleSaveEmployee = async () => {
    if (!editingEmployee || !editingEmployee.firstName || !editingEmployee.lastName || !editingEmployee.email || !editingEmployee.employeeCode) {
      setError("Required fields: Employee Code, First Name, Last Name, Email.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      if (modalMode === 'add') {
        await mockCreateEmployee(editingEmployee as Omit<Employee, 'id'>);
      } else if (editingEmployee.id) {
        await mockUpdateEmployee(editingEmployee.id, editingEmployee);
      }
      setIsModalOpen(false);
      setEditingEmployee(null);
      fetchEmployees();
    } catch (err) {
      console.error("Failed to save employee", err);
      setError("Failed to save employee. Please check the data and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'OnLeave', label: 'On Leave' },
  ];

  const columns = [
    { header: 'Code', accessor: 'employeeCode' as keyof Employee },
    { header: 'Name', accessor: (item: Employee) => `${item.firstName} ${item.lastName}` },
    { header: 'Email', accessor: 'email' as keyof Employee },
    { header: 'Position', accessor: 'position' as keyof Employee },
    { header: 'Department', accessor: 'department' as keyof Employee },
    { header: 'Status', accessor: 'status' as keyof Employee, 
      render: (item: Employee) => (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${item.status === 'Active' ? 'bg-[var(--color-success)] text-[var(--color-success-content)]' : 'bg-[var(--color-warning)] text-[var(--color-warning-content)]'}`}>
            {item.status}
        </span>
      )
    },
    { header: 'Actions', accessor: (item: Employee) => (
        <div className="flex space-x-1">
            <Button size="xs" variant="ghost" title="Edit Employee" onClick={() => openEditModal(item)}><span dangerouslySetInnerHTML={{ __html: ICONS.EDIT }} /></Button>
            <Button size="xs" variant="ghost" title="Delete Employee" className="text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-[var(--color-error-content)]" onClick={() => handleDelete(item.id)}><span dangerouslySetInnerHTML={{ __html: ICONS.DELETE }} /></Button>
        </div>
      )
    },
  ];

  if (isLoading && employees.length === 0) {
    return <LoadingSpinner text="Loading employees..." className="h-full" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[var(--color-primary-content)]">Employee Management</h1>
        <Button variant="primary" onClick={openAddModal} leftIcon={<span dangerouslySetInnerHTML={{__html: ICONS.PLUS}}/>}>
          Add Employee
        </Button>
      </div>

      {error && <Card><p className="text-[var(--color-error)]">{error}</p></Card>}
      
      <Card>
        {isLoading && employees.length > 0 && <LoadingSpinner text="Refreshing employees..." />}
        {!isLoading && (
            <Table<Employee>
            columns={columns}
            data={employees}
            keyExtractor={(emp) => emp.id}
            emptyStateMessage="No employees found."
            />
        )}
      </Card>

      {editingEmployee && (
        <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingEmployee(null);}} title={modalMode === 'add' ? "Add New Employee" : "Edit Employee"} size="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto p-1">
            <Input label="Employee Code" name="employeeCode" value={editingEmployee.employeeCode || ''} onChange={handleInputChange} required />
            <Input label="First Name" name="firstName" value={editingEmployee.firstName || ''} onChange={handleInputChange} required />
            <Input label="Last Name" name="lastName" value={editingEmployee.lastName || ''} onChange={handleInputChange} required />
            <Input label="Email" name="email" type="email" value={editingEmployee.email || ''} onChange={handleInputChange} required />
            <Input label="Phone" name="phone" type="tel" value={editingEmployee.phone || ''} onChange={handleInputChange} />
            <Input label="Position" name="position" value={editingEmployee.position || ''} onChange={handleInputChange} />
            <Input label="Department" name="department" value={editingEmployee.department || ''} onChange={handleInputChange} />
            <Input label="Join Date" name="joinDate" type="date" value={editingEmployee.joinDate || ''} onChange={handleInputChange} required />
            <Select label="Status" name="status" options={statusOptions} value={editingEmployee.status || 'Active'} onChange={handleInputChange} />
            <Input label="Date of Birth" name="dateOfBirth" type="date" value={editingEmployee.dateOfBirth ? format(new Date(editingEmployee.dateOfBirth), 'yyyy-MM-dd') : ''} onChange={handleInputChange} />
            <Input label="Nationality" name="nationality" value={editingEmployee.nationality || ''} onChange={handleInputChange} />
            <Input label="Address (Full)" name="address" value={editingEmployee.address || ''} onChange={handleInputChange} containerClassName="md:col-span-2"/>
          </div>
          {error && <p className="mt-2 text-sm text-[var(--color-error)]">{error}</p>}
          <div className="pt-6 flex justify-end space-x-2 border-t border-[length:var(--border)] border-[var(--color-neutral)] mt-4">
              <Button variant="ghost" onClick={() => { setIsModalOpen(false); setEditingEmployee(null); }}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveEmployee} isLoading={isLoading}>Save Employee</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EmployeeManagementPage;
