
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Employee, UserRole } from '../types';
import { mockFetchEmployeeById, mockUpdateEmployee } from '../services/mockApiService';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { DEFAULT_AVATAR_URL } from '../constants';

const EmployeeProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Employee>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.employeeId) {
        setIsLoading(true);
        try {
          const empData = await mockFetchEmployeeById(user.employeeId);
          setEmployee(empData);
          setFormData(empData);
        } catch (error) {
          console.error("Failed to fetch employee profile", error);
        } finally {
          setIsLoading(false);
        }
      } else if (user && user.role === UserRole.Admin && !user.employeeId) {
        // Admin might not have an employeeId if they are a superuser
        // For demo, create a mock admin profile or show a message
        const mockAdminProfile: Employee = {
            id: 'admin-user',
            employeeCode: 'ADMIN001',
            firstName: 'Admin',
            lastName: 'User',
            email: user.email,
            department: 'System',
            position: 'Administrator',
            joinDate: new Date().toISOString(),
            status: 'Active',
        };
        setEmployee(mockAdminProfile);
        setFormData(mockAdminProfile);
        setIsLoading(false);
      }
       else {
        setIsLoading(false);
        // Handle case where user might not be an employee or ID is missing
        console.warn("User does not have an associated employee ID or is not an employee.");
      }
    };
    fetchProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!employee) return;
    setIsLoading(true);
    try {
      const updatedEmployee = await mockUpdateEmployee(employee.id, formData);
      setEmployee(updatedEmployee);
      setFormData(updatedEmployee);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
      // Show error to user
    } finally {
      setIsLoading(false);
    }
  };
  
  // Determine if the current user can edit this profile
  // For this simplified page, only self-edit is enabled.
  // Admin/HR would edit via EmployeeManagementPage
  const canEdit = user?.employeeId === employee?.id || (user?.role === UserRole.Admin && employee?.id === 'admin-user');

  if (isLoading) {
    return <LoadingSpinner text="Loading profile..." className="h-full"/>;
  }

  if (!employee) {
    return <Card title="Profile Not Found"><p>No employee profile associated with this user or profile could not be loaded.</p></Card>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--color-primary-content)]">My Profile</h1>
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 flex flex-col items-center">
            <img 
              src={employee.avatarUrl || DEFAULT_AVATAR_URL} 
              alt={`${employee.firstName} ${employee.lastName}`}
              className="w-40 h-40 rounded-full object-cover border-4 border-[var(--color-neutral)]"
            />
            <h2 className="mt-4 text-2xl font-semibold">{employee.firstName} {employee.lastName}</h2>
            <p className="text-[var(--color-base-content)] opacity-80">{employee.position}</p>
            <p className="text-sm text-[var(--color-base-content)] opacity-60">{employee.department}</p>
          </div>

          <div className="md:col-span-2 space-y-4">
            {isEditing ? (
              <>
                <Input label="First Name" name="firstName" value={formData.firstName || ''} onChange={handleInputChange} />
                <Input label="Last Name" name="lastName" value={formData.lastName || ''} onChange={handleInputChange} />
                <Input label="Email" name="email" type="email" value={formData.email || ''} onChange={handleInputChange} />
                <Input label="Phone" name="phone" type="tel" value={formData.phone || ''} onChange={handleInputChange} />
                <Input label="Address" name="address" value={formData.address || ''} onChange={handleInputChange} />
                {/* Add more editable fields as needed */}
              </>
            ) : (
              <>
                <ProfileDetail label="Employee Code" value={employee.employeeCode} />
                <ProfileDetail label="Email" value={employee.email} />
                <ProfileDetail label="Phone" value={employee.phone || 'N/A'} />
                <ProfileDetail label="Date of Birth" value={employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A'} />
                <ProfileDetail label="Address" value={employee.address || 'N/A'} />
                <ProfileDetail label="Join Date" value={new Date(employee.joinDate).toLocaleDateString()} />
                <ProfileDetail label="Status" value={employee.status} />
              </>
            )}
            
            {canEdit && (
              <div className="flex space-x-2 mt-6">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} variant="primary" isLoading={isLoading}>Save Changes</Button>
                    <Button onClick={() => { setIsEditing(false); setFormData(employee); }} variant="ghost">Cancel</Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="secondary">Edit Profile</Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

interface ProfileDetailProps {
  label: string;
  value: string | number;
}
const ProfileDetail: React.FC<ProfileDetailProps> = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-[var(--color-base-content)] opacity-70">{label}</p>
    <p className="text-md text-[var(--color-base-content)]">{value}</p>
  </div>
);

export default EmployeeProfilePage;
