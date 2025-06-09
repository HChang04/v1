
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EmployeeProfilePage from './pages/EmployeeProfilePage';
import LeaveRequestPage from './pages/LeaveRequestPage';
import AttendanceOverviewPage from './pages/AttendanceOverviewPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import TeamLeaveApprovalPage from './pages/manager/TeamLeaveApprovalPage';
import EmployeeManagementPage from './pages/hr/EmployeeManagementPage';
import NotFoundPage from './pages/NotFoundPage';
import { UserRole } from './types';
import { APP_ROUTES } from './constants';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-base-100)] text-[var(--color-base-content)]">
        Loading application...
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path={APP_ROUTES.LOGIN} element={<LoginPage />} />
        <Route path="*" element={<Navigate to={APP_ROUTES.LOGIN} replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path={APP_ROUTES.HOME} element={<Navigate to={APP_ROUTES.DASHBOARD} replace />} />
        <Route path={APP_ROUTES.DASHBOARD} element={<DashboardPage />} />
        
        {/* Employee Routes */}
        <Route path={APP_ROUTES.PROFILE} element={<EmployeeProfilePage />} />
        <Route path={APP_ROUTES.LEAVE_REQUEST} element={<LeaveRequestPage />} />
        <Route path={APP_ROUTES.ATTENDANCE} element={<AttendanceOverviewPage />} />

        {/* Admin Routes */}
        {user.role === UserRole.Admin && (
          <Route path={APP_ROUTES.ADMIN_USER_MANAGEMENT} element={<UserManagementPage />} />
        )}

        {/* HR Manager Routes */}
        { (user.role === UserRole.Admin || user.role === UserRole.HRManager) && (
            <Route path={APP_ROUTES.HR_EMPLOYEE_MANAGEMENT} element={<EmployeeManagementPage />} />
        )}
        
        {/* Line Manager Routes */}
        { (user.role === UserRole.Admin || user.role === UserRole.LineManager || user.role === UserRole.HRManager) && (
             <Route path={APP_ROUTES.MANAGER_TEAM_LEAVE_APPROVAL} element={<TeamLeaveApprovalPage />} />
        )}
       
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
};

export default App;
