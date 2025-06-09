
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LeaveRequest, LeaveStatus, User } from '../../types';
import { mockFetchTeamLeaveRequests, mockUpdateLeaveRequestStatus } from '../../services/mockApiService';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input'; // For rejection reason

const TeamLeaveApprovalPage: React.FC = () => {
  const { user } = useAuth();
  const [teamLeaveRequests, setTeamLeaveRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);


  const fetchTeamRequests = useCallback(async (currentUser: User) => {
    if (!currentUser.employeeId) return; // Manager needs an employeeId to identify their team
    setIsLoading(true);
    setError(null);
    try {
      const requests = await mockFetchTeamLeaveRequests(currentUser.employeeId);
      setTeamLeaveRequests(requests.filter(req => req.status === LeaveStatus.Pending || req.status === LeaveStatus.ApprovedByManager)); // Show pending or already manager-approved for HR to escalate
    } catch (err) {
      console.error("Failed to fetch team leave requests", err);
      setError("Could not load team leave requests.");
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      fetchTeamRequests(user);
    }
  }, [user, fetchTeamRequests]);

  const handleAction = async (requestId: string, newStatus: LeaveStatus, reason?: string) => {
    if (!user) return;
    setIsLoading(true); // Or a specific action loading state
    try {
      await mockUpdateLeaveRequestStatus(requestId, newStatus, user.id, reason); // pass managerId
      if(user) fetchTeamRequests(user); // Refresh list
      setIsModalOpen(false);
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (err) {
      console.error("Failed to update leave status", err);
      setError("Failed to update leave status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (request: LeaveRequest, type: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(type);
    if (type === 'reject') {
        setIsModalOpen(true);
    } else {
        // Direct approval for simplicity, or could also use modal for confirmation
        handleAction(request.id, user?.role === 'HRManager' ? LeaveStatus.ApprovedByHR : LeaveStatus.ApprovedByManager);
    }
  };
  
  const submitRejection = () => {
    if (selectedRequest && rejectionReason) {
        handleAction(selectedRequest.id, LeaveStatus.Rejected, rejectionReason);
    } else if (!rejectionReason) {
        alert("Rejection reason is required.");
    }
  };


  const columns = [
    { header: 'Employee', accessor: 'employeeName' as keyof LeaveRequest, render: (item:LeaveRequest) => item.employeeName || item.employeeId },
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
    { header: 'Actions', accessor: (item: LeaveRequest) => (
        (item.status === LeaveStatus.Pending || (user?.role === 'HRManager' && item.status === LeaveStatus.ApprovedByManager)) && ( // HR can override manager approval
            <div className="flex space-x-1">
            <Button size="xs" variant="success" onClick={() => openModal(item, 'approve')}>Approve</Button>
            <Button size="xs" variant="danger" onClick={() => openModal(item, 'reject')}>Reject</Button>
            </div>
        )
      )
    },
  ];

  if (isLoading && teamLeaveRequests.length === 0) {
    return <LoadingSpinner text="Loading team leave requests..." className="h-full" />;
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--color-primary-content)]">Team Leave Approval</h1>
      {error && <Card><p className="text-[var(--color-error)]">{error}</p></Card>}
      <Card>
        {isLoading && teamLeaveRequests.length > 0 && <LoadingSpinner text="Refreshing requests..." />}
        {!isLoading && (
            <Table<LeaveRequest>
            columns={columns}
            data={teamLeaveRequests}
            keyExtractor={(req) => req.id}
            emptyStateMessage="No pending leave requests for your team."
            />
        )}
      </Card>

      {selectedRequest && actionType === 'reject' && (
        <Modal isOpen={isModalOpen} onClose={() => {setIsModalOpen(false); setSelectedRequest(null); setRejectionReason('');}} title={`Reject Leave Request for ${selectedRequest.employeeName || selectedRequest.employeeId}`}>
            <Input 
                label="Rejection Reason" 
                name="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection"
                required
            />
            <div className="pt-4 flex justify-end space-x-2">
                <Button variant="ghost" onClick={() => {setIsModalOpen(false); setSelectedRequest(null); setRejectionReason('');}}>Cancel</Button>
                <Button variant="danger" onClick={submitRejection} isLoading={isLoading}>Confirm Rejection</Button>
            </div>
        </Modal>
      )}
    </div>
  );
};

export default TeamLeaveApprovalPage;
