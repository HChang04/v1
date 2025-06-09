
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import Card from '../components/common/Card';
import { ICONS } from '../constants';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return <LoadingSpinner text="Loading dashboard..." className="h-full" />;
  }

  const renderAdminDashboard = () => (
    <>
      <Card title="Admin Quick Stats" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon={ICONS.USERS} label="Total Users" value="150" />
          <StatCard icon={ICONS.EMPLOYEES} label="Active Employees" value="135" />
          <StatCard icon={ICONS.LEAVE} label="Pending Approvals" value="12" />
        </div>
      </Card>
      <Card title="System Overview">
        <p>Full access to all modules. Manage users, roles, settings, and view audit logs.</p>
        {/* Placeholder for charts or more detailed stats */}
      </Card>
    </>
  );

  const renderHRManagerDashboard = () => (
    <>
      <Card title="HR Quick Stats" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon={ICONS.EMPLOYEES} label="Total Employees" value="135" />
          <StatCard icon={ICONS.LEAVE} label="Leave Requests Today" value="5" />
          <StatCard icon={ICONS.USERS} label="Open Positions" value="3" />
        </div>
      </Card>
      <Card title="HR Operations">
        <p>Oversee employee lifecycle, manage recruitment, payroll, and leave approvals.</p>
      </Card>
    </>
  );

  const renderLineManagerDashboard = () => (
    <>
      <Card title="Manager Quick View" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon={ICONS.USERS} label="My Team Size" value="8" />
          <StatCard icon={ICONS.LEAVE} label="Team Leave Requests" value="2" />
          <StatCard icon={ICONS.PROFILE} label="Performance Reviews Due" value="3" />
        </div>
      </Card>
      <Card title="Team Management">
        <p>Approve leave, evaluate team performance, and view your team's profiles.</p>
      </Card>
    </>
  );

  const renderEmployeeDashboard = () => (
    <>
      <Card title="My Quick Info" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon={ICONS.LEAVE} label="Remaining Leave" value="10 days" />
          <StatCard icon={ICONS.PROFILE} label="Next Evaluation" value="Q3 2024" />
          <StatCard icon={ICONS.CALENDAR} label="Upcoming Holidays" value="2" />
        </div>
      </Card>
      <Card title="Welcome, {user.firstName || user.username}!">
        <p>Access your profile, request leave, view payslips and performance reviews.</p>
      </Card>
    </>
  );
  
  const StatCard: React.FC<{icon: string, label: string, value: string | number}> = ({icon, label, value}) => (
    <div className="bg-[var(--color-base-100)] p-4 rounded-[var(--radius-box)] border border-[length:var(--border)] border-[var(--color-neutral)] flex items-center space-x-3">
        <div className="p-2 bg-[var(--color-primary)] text-[var(--color-primary-content)] rounded-[var(--radius-selector)]" dangerouslySetInnerHTML={{ __html: icon }} />
        <div>
            <p className="text-sm text-[var(--color-base-content)] opacity-80">{label}</p>
            <p className="text-xl font-semibold text-[var(--color-base-content)]">{value}</p>
        </div>
    </div>
  );

  let dashboardContent;
  switch (user.role) {
    case UserRole.Admin:
      dashboardContent = renderAdminDashboard();
      break;
    case UserRole.HRManager:
      dashboardContent = renderHRManagerDashboard();
      break;
    case UserRole.LineManager:
      dashboardContent = renderLineManagerDashboard();
      break;
    case UserRole.Employee:
      dashboardContent = renderEmployeeDashboard();
      break;
    default:
      dashboardContent = <p>No specific dashboard for this role.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[var(--color-primary-content)]">Dashboard</h1>
      {dashboardContent}
    </div>
  );
};

export default DashboardPage;
