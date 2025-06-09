
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../../types';
import { mockFetchAllUsers, mockCreateUser } from '../../services/mockApiService';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ICONS, USER_ROLES_OPTIONS } from '../../constants';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState<{ username: string; email: string; role: UserRole; employeeId?: string }>({
    username: '',
    email: '',
    role: UserRole.Employee,
  });
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const allUsers = await mockFetchAllUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setError("Could not load users.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email) {
        setError("Username and email are required.");
        return;
    }
    setIsLoading(true); // Or a specific loading state for modal
    setError(null);
    try {
      await mockCreateUser(newUser);
      setIsModalOpen(false);
      setNewUser({ username: '', email: '', role: UserRole.Employee }); // Reset form
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error("Failed to create user", err);
      setError("Failed to create user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const columns = [
    { header: 'ID', accessor: 'id' as keyof User, className: 'truncate max-w-xs' },
    { header: 'Username', accessor: 'username' as keyof User },
    { header: 'Email', accessor: 'email' as keyof User },
    { header: 'Role', accessor: 'role' as keyof User },
    { header: 'Employee ID', accessor: 'employeeId' as keyof User, render: (user: User) => user.employeeId || 'N/A' },
    { header: 'Actions', accessor: (user: User) => (
        <div className="flex space-x-1">
            <Button size="xs" variant="ghost" title="Edit User (mock)" onClick={() => alert(`Edit user: ${user.username}`)}><span dangerouslySetInnerHTML={{ __html: ICONS.EDIT }} /></Button>
            <Button size="xs" variant="ghost" title="Delete User (mock)" className="text-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-[var(--color-error-content)]" onClick={() => alert(`Delete user: ${user.username}`)}><span dangerouslySetInnerHTML={{ __html: ICONS.DELETE }} /></Button>
        </div>
      )
    },
  ];

  if (isLoading && users.length === 0) { // Show full page spinner only on initial load
    return <LoadingSpinner text="Loading users..." className="h-full"/>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[var(--color-primary-content)]">User Management</h1>
        <Button variant="primary" onClick={() => setIsModalOpen(true)} leftIcon={<span dangerouslySetInnerHTML={{__html: ICONS.PLUS}}/>}>
          Add User
        </Button>
      </div>

      {error && <Card><p className="text-[var(--color-error)]">{error}</p></Card>}
      
      <Card>
        {isLoading && users.length > 0 && <LoadingSpinner text="Refreshing users..." />} 
        {!isLoading && (
            <Table<User>
                columns={columns}
                data={users}
                keyExtractor={(user) => user.id}
                emptyStateMessage="No users found."
            />
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New User">
        <div className="space-y-4">
          <Input label="Username" name="username" value={newUser.username} onChange={handleInputChange} required />
          <Input label="Email" name="email" type="email" value={newUser.email} onChange={handleInputChange} required />
          <Select label="Role" name="role" options={USER_ROLES_OPTIONS} value={newUser.role} onChange={handleInputChange} />
          <Input label="Employee ID (Optional)" name="employeeId" value={newUser.employeeId || ''} onChange={handleInputChange} />
          {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
        </div>
        <div className="pt-4 flex justify-end space-x-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddUser} isLoading={isLoading}>Add User</Button>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
