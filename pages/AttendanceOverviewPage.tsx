import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LeaveRequest, LeaveStatus, LeaveBalance, User } from '../types';
import { mockFetchLeaveRequestsByEmployee, mockFetchLeaveBalance } from '../services/mockApiService';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CalendarView from '../components/common/CalendarView';
import { format } from 'date-fns';
import parseISO from 'date-fns/parseISO';

const AttendanceOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');

  const fetchData = useCallback(async (currentUser: User) => {
    if (!currentUser.employeeId) {
      setError("Employee information not available.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [requests, balance] = await Promise.all([
        mockFetchLeaveRequestsByEmployee(currentUser.employeeId),
        mockFetchLeaveBalance(currentUser.employeeId)
      ]);
      setLeaveRequests(requests);
      setLeaveBalance(balance);
    } catch (err) {
      console.error("Failed to fetch attendance data", err);
      setError("Could not load attendance overview. Please try again.");
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      fetchData(user);
    }
  }, [user, fetchData]);

  const calendarEvents = leaveRequests.map(req => ({
    date: parseISO(req.startDate), // Assuming startDate is representative for single-day display
    // For multi-day events, CalendarView would need enhancement or multiple events created
    title: `${req.leaveType} (${req.status})`,
    color: req.status === LeaveStatus.ApprovedByHR || req.status === LeaveStatus.ApprovedByManager ? 'bg-[var(--color-success)] text-[var(--color-success-content)] opacity-75' : 
           req.status === LeaveStatus.Pending ? 'bg-[var(--color-warning)] text-[var(--color-warning-content)] opacity-75' :
           req.status === LeaveStatus.Rejected ? 'bg-[var(--color-error)] text-[var(--color-error-content)] opacity-75' :
           'bg-[var(--color-info)] text-[var(--color-info-content)] opacity-75',
  }));
  
  const publicHolidayEvents = leaveBalance?.publicHolidays.map(ph => ({
    date: parseISO(ph.date),
    title: ph.name,
    color: 'bg-[var(--color-accent)] text-[var(--color-accent-content)] opacity-50'
  })) || [];

  const allCalendarEvents = [...calendarEvents, ...publicHolidayEvents];


  const columns = [
    { header: 'Type', accessor: 'leaveType' as keyof LeaveRequest },
    { header: 'Start Date', accessor: (item: LeaveRequest) => format(parseISO(item.startDate), 'MMM dd, yyyy') },
    { header: 'End Date', accessor: (item: LeaveRequest) => format(parseISO(item.endDate), 'MMM dd, yyyy') },
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
    { header: 'Reason', accessor: 'reason' as keyof LeaveRequest, className: 'truncate max-w-xs' },
  ];

  if (isLoading) {
    return <LoadingSpinner text="Loading attendance overview..." className="h-full" />;
  }

  if (error) {
    return <Card title="Error"><p>{error}</p></Card>;
  }

  if (!user || !user.employeeId) {
    return <Card title="Attendance Overview"><p>Employee data not found.</p></Card>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--color-primary-content)]">Attendance & Leave Overview</h1>

      {leaveBalance && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <StatCard title="Annual Leave Remaining" value={`${leaveBalance.annualLeaveRemaining} days`} />
          <StatCard title="Bonus Leave Days" value={`${leaveBalance.bonusLeaveDays} days`} />
          <StatCard title="Public Holidays This Year" value={`${leaveBalance.publicHolidays.length}`} />
        </div>
      )}

      <Card>
        <div className="flex justify-end mb-4 space-x-2">
            <button onClick={() => setViewMode('calendar')} className={`px-3 py-1.5 rounded-[var(--radius-selector)] text-sm ${viewMode === 'calendar' ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)]' : 'bg-[var(--color-base-200)] text-[var(--color-base-content)] hover:bg-[var(--color-neutral)]'}`}>Calendar View</button>
            <button onClick={() => setViewMode('table')} className={`px-3 py-1.5 rounded-[var(--radius-selector)] text-sm ${viewMode === 'table' ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)]' : 'bg-[var(--color-base-200)] text-[var(--color-base-content)] hover:bg-[var(--color-neutral)]'}`}>Table View</button>
        </div>
        {viewMode === 'calendar' ? (
          <CalendarView events={allCalendarEvents} onDateClick={(date) => console.log(date)} />
        ) : (
          <Table<LeaveRequest>
            columns={columns}
            data={leaveRequests}
            keyExtractor={(req) => req.id}
            emptyStateMessage="No leave requests to display."
          />
        )}
      </Card>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
}
const StatCard: React.FC<StatCardProps> = ({ title, value }) => (
  <div className="bg-[var(--color-base-200)] p-4 rounded-[var(--radius-box)] border border-[length:var(--border)] border-[var(--color-neutral)]">
    <h3 className="text-sm font-medium text-[var(--color-base-content)] opacity-80">{title}</h3>
    <p className="text-2xl font-semibold text-[var(--color-base-content)]">{value}</p>
  </div>
);

export default AttendanceOverviewPage;