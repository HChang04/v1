
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LeaveRequest, LeaveType, LeaveStatus, User } from '../types';
import { mockSubmitLeaveRequest, mockFetchLeaveRequestsByEmployee } from '../services/mockApiService';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { format } from 'date-fns';

const LeaveRequestPage: React.FC = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<{
    leaveType: LeaveType;
    startDate: string;
    endDate: string;
    reason: string;
  }>({
    leaveType: LeaveType.Annual,
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [error, setError] = useState<string | null>(null);

  const fetchLeaveRequests = useCallback(async (currentUser: User) => {
    if (!currentUser.employeeId) return;
    setIsLoading(true);
    try {
      const requests = await mockFetchLeaveRequestsByEmployee(currentUser.employeeId);
      setLeaveRequests(requests);
    } catch (err) {
      console.error("Failed to fetch leave requests", err);
      setError("Could not load your leave requests.");
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    if (user) {
      fetchLeaveRequests(user);
    }
  }, [user, fetchLeaveRequests]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value as LeaveType })); // Cast for leaveType
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.employeeId) {
      setError("User information not found.");
      return;
    }
    if (!formData.startDate || !formData.endDate || !formData.reason) {
        setError("Please fill in all required fields.");
        return;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
        setError("Start date cannot be after end date.");
        return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const newRequest: Omit<LeaveRequest, 'id' | 'status' | 'submittedDate' | 'employeeName'> = {
        employeeId: user.employeeId,
        ...formData,
      };
      await mockSubmitLeaveRequest(newRequest);
      // Reset form and refetch requests
      setFormData({ leaveType: LeaveType.Annual, startDate: '', endDate: '', reason: '' });
      if(user) fetchLeaveRequests(user); 
    } catch (err) {
      console.error("Failed to submit leave request", err);
      setError("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const leaveTypeOptions = Object.values(LeaveType).map(lt => ({ value: lt, label: lt }));

  const columns = [
    { header: 'Type', accessor: 'leaveType' as keyof LeaveRequest },
    { header: 'Start Date', accessor: (item: LeaveRequest) => format(new Date(item.startDate), 'MMM dd, yyyy') },
    { header: 'End Date', accessor: (item: LeaveRequest) => format(new Date(item.endDate), 'MMM dd, yyyy') },
    { header: 'Reason', accessor: 'reason' as keyof LeaveRequest, className: 'truncate max-w-xs' },
    { header: 'Status', accessor: 'status' as keyof LeaveRequest, 
      render: (item: LeaveRequest) => (
        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
          ${item.status === LeaveStatus.ApprovedByHR || item.status === LeaveStatus.ApprovedByManager ? 'bg-[var(--color-success)] text-[var(--color-success-content)]' : 
            item.status === LeaveStatus.Rejected ? 'bg-[var(--color-error)] text-[var(--color-error-content)]' :
            item.status === LeaveStatus.Pending ? 'bg-[var(--color-warning)] text-[var(--color-warning-content)]' :
            'bg-[var(--color-info)] text-[var(--color-info-content)]'}`}>
          {item.status}
        </span>
      )
    },
    { header: 'Submitted', accessor: (item: LeaveRequest) => format(new Date(item.submittedDate), 'MMM dd, yyyy')},
  ];

  if (!user || !user.employeeId) {
    return <Card title="Leave Requests"><p>You must be logged in as an employee to manage leave requests.</p></Card>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--color-primary-content)]">My Leave Requests</h1>
      
      <Card title="Submit New Leave Request">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Leave Type"
            name="leaveType"
            options={leaveTypeOptions}
            value={formData.leaveType}
            onChange={handleInputChange}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange}
              required
            />
            <Input
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-[var(--color-base-content)] mb-1">Reason</label>
            <textarea
              id="reason"
              name="reason"
              rows={3}
              className="block w-full bg-[var(--color-base-200)] text-[var(--color-base-content)] border border-[length:var(--border)] border-[var(--color-neutral)] rounded-[var(--radius-field)] p-[var(--size-field)] focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] focus:outline-none placeholder:text-[var(--color-base-content)] placeholder:opacity-50"
              value={formData.reason}
              onChange={handleInputChange}
              required
            ></textarea>
          </div>
          {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </Card>

      <Card title="My Leave History">
        {isLoading ? (
          <LoadingSpinner text="Loading leave history..." />
        ) : (
          <Table<LeaveRequest>
            columns={columns}
            data={leaveRequests}
            keyExtractor={(req) => req.id}
            emptyStateMessage="You have no leave requests."
          />
        )}
      </Card>
    </div>
  );
};

export default LeaveRequestPage;
