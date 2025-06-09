
import { User, UserRole, Employee, LeaveRequest, LeaveType, LeaveStatus, Contract, Payslip, PerformanceEvaluation, AuditLog, CompanySettings, LeaveBalance } from '../types';
import { MOCK_API_DELAY, DEFAULT_AVATAR_URL } from '../constants';
import { calculateNetSalary } from './payrollService'; // For payslip generation

// --- Mock Data Store ---
let mockUsers: User[] = [
  { id: 'user-admin', username: 'admin', email: 'admin@example.com', role: UserRole.Admin, employeeId: 'emp-admin' },
  { id: 'user-hr', username: 'hr', email: 'hr@example.com', role: UserRole.HRManager, employeeId: 'emp-hr' },
  { id: 'user-manager', username: 'manager', email: 'manager@example.com', role: UserRole.LineManager, employeeId: 'emp-manager' },
  { id: 'user-employee1', username: 'employee', email: 'employee1@example.com', role: UserRole.Employee, employeeId: 'emp-001' },
  { id: 'user-employee2', username: 'jane.doe', email: 'jane.doe@example.com', role: UserRole.Employee, employeeId: 'emp-002' },
];

let mockEmployees: Employee[] = [
  { id: 'emp-admin', employeeCode: 'E000', firstName: 'Super', lastName: 'Admin', email: 'admin@example.com', department: 'IT', position: 'System Administrator', joinDate: '2020-01-01', status: 'Active', avatarUrl: `${DEFAULT_AVATAR_URL}?random=0` },
  { id: 'emp-hr', employeeCode: 'E00H', firstName: 'Helen', lastName: 'Resource', email: 'hr@example.com', department: 'Human Resources', position: 'HR Manager', joinDate: '2021-03-15', status: 'Active', avatarUrl: `${DEFAULT_AVATAR_URL}?random=1` },
  { id: 'emp-manager', employeeCode: 'E00M', firstName: 'Mike', lastName: 'Anager', email: 'manager@example.com', department: 'Engineering', position: 'Team Lead', joinDate: '2022-06-01', status: 'Active', avatarUrl: `${DEFAULT_AVATAR_URL}?random=2`, managerId: 'emp-hr' },
  { id: 'emp-001', employeeCode: 'E001', firstName: 'John', lastName: 'Doe', email: 'employee1@example.com', department: 'Engineering', position: 'Software Engineer', joinDate: '2023-01-10', status: 'Active', avatarUrl: `${DEFAULT_AVATAR_URL}?random=3`, managerId: 'emp-manager' },
  { id: 'emp-002', employeeCode: 'E002', firstName: 'Jane', lastName: 'Smith', email: 'jane.doe@example.com', department: 'Marketing', position: 'Marketing Specialist', joinDate: '2023-05-20', status: 'Active', avatarUrl: `${DEFAULT_AVATAR_URL}?random=4`, managerId: 'emp-hr' },
];

let mockLeaveRequests: LeaveRequest[] = [
  { id: 'lr-001', employeeId: 'emp-001', employeeName: 'John Doe', leaveType: LeaveType.Annual, startDate: '2024-07-10', endDate: '2024-07-12', reason: 'Vacation', status: LeaveStatus.Pending, submittedDate: '2024-06-20' },
  { id: 'lr-002', employeeId: 'emp-002', employeeName: 'Jane Smith', leaveType: LeaveType.Sick, startDate: '2024-06-15', endDate: '2024-06-15', reason: 'Flu', status: LeaveStatus.ApprovedByManager, submittedDate: '2024-06-14', approvedByManagerId: 'emp-manager' },
  { id: 'lr-003', employeeId: 'emp-001', employeeName: 'John Doe', leaveType: LeaveType.Unpaid, startDate: '2024-08-01', endDate: '2024-08-05', reason: 'Personal reasons', status: LeaveStatus.Rejected, submittedDate: '2024-07-01', rejectionReason: 'Operational needs' },
];

const generateId = (prefix: string = 'id') => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

// --- Auth ---
export const mockLogin = (username: string, _password_not_used: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (user) {
        resolve(user);
      } else {
        // A simple way to simulate role selection if username matches a role
        const roleKey = Object.keys(UserRole).find(key => key.toLowerCase() === username.toLowerCase());
        if (roleKey) {
            const role = UserRole[roleKey as keyof typeof UserRole];
            const userForRole = mockUsers.find(u => u.role === role);
            if(userForRole) resolve(userForRole);
            else reject(new Error('No user configured for this role.'));
        } else {
            reject(new Error('Invalid credentials or role not found.'));
        }
      }
    }, MOCK_API_DELAY);
  });
};

export const mockFetchCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate fetching based on a stored token/session
      const storedUser = localStorage.getItem('hrm_user');
      if (storedUser) {
        resolve(JSON.parse(storedUser));
      } else {
        resolve(null);
      }
    }, MOCK_API_DELAY / 2);
  });
};

// --- Users ---
export const mockFetchAllUsers = (): Promise<User[]> => {
  return new Promise((resolve) => setTimeout(() => resolve([...mockUsers]), MOCK_API_DELAY));
};
export const mockCreateUser = (userData: Omit<User, 'id'>): Promise<User> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newUser: User = { ...userData, id: generateId('user') };
            mockUsers.push(newUser);
            resolve(newUser);
        }, MOCK_API_DELAY);
    });
};

// --- Employees ---
export const mockFetchAllEmployees = (): Promise<Employee[]> => {
  return new Promise((resolve) => setTimeout(() => resolve([...mockEmployees]), MOCK_API_DELAY));
};
export const mockFetchEmployeeById = (id: string): Promise<Employee> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const employee = mockEmployees.find(e => e.id === id);
      if (employee) resolve(employee);
      else reject(new Error('Employee not found'));
    }, MOCK_API_DELAY);
  });
};
export const mockCreateEmployee = (empData: Omit<Employee, 'id'>): Promise<Employee> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newEmployee: Employee = { ...empData, id: generateId('emp'), avatarUrl: `${DEFAULT_AVATAR_URL}?random=${mockEmployees.length}` };
            mockEmployees.push(newEmployee);
            resolve(newEmployee);
        }, MOCK_API_DELAY);
    });
};
export const mockUpdateEmployee = (id: string, updates: Partial<Employee>): Promise<Employee> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockEmployees.findIndex(e => e.id === id);
            if (index !== -1) {
                mockEmployees[index] = { ...mockEmployees[index], ...updates };
                resolve(mockEmployees[index]);
            } else {
                reject(new Error('Employee not found for update.'));
            }
        }, MOCK_API_DELAY);
    });
};
export const mockDeleteEmployee = (id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const initialLength = mockEmployees.length;
            mockEmployees = mockEmployees.filter(e => e.id !== id);
            if (mockEmployees.length < initialLength) {
                // Also remove associated user if any
                mockUsers = mockUsers.filter(u => u.employeeId !== id);
                resolve();
            } else {
                reject(new Error('Employee not found for deletion.'));
            }
        }, MOCK_API_DELAY);
    });
};


// --- Leave Requests ---
export const mockFetchLeaveRequestsByEmployee = (employeeId: string): Promise<LeaveRequest[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockLeaveRequests.filter(lr => lr.employeeId === employeeId).sort((a,b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime()));
    }, MOCK_API_DELAY);
  });
};
export const mockFetchTeamLeaveRequests = (managerId: string): Promise<LeaveRequest[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Find employees managed by this managerId
      const teamMemberIds = mockEmployees.filter(e => e.managerId === managerId).map(e => e.id);
      resolve(mockLeaveRequests.filter(lr => teamMemberIds.includes(lr.employeeId)).sort((a,b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime()));
    }, MOCK_API_DELAY);
  });
};
export const mockSubmitLeaveRequest = (requestData: Omit<LeaveRequest, 'id' | 'status' | 'submittedDate' | 'employeeName'>): Promise<LeaveRequest> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const employee = mockEmployees.find(e => e.id === requestData.employeeId);
      const newRequest: LeaveRequest = {
        ...requestData,
        id: generateId('lr'),
        status: LeaveStatus.Pending,
        submittedDate: new Date().toISOString(),
        employeeName: employee ? `${employee.firstName} ${employee.lastName}` : requestData.employeeId,
      };
      mockLeaveRequests.push(newRequest);
      resolve(newRequest);
    }, MOCK_API_DELAY);
  });
};
export const mockUpdateLeaveRequestStatus = (requestId: string, status: LeaveStatus, approverId: string, reason?: string): Promise<LeaveRequest> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockLeaveRequests.findIndex(lr => lr.id === requestId);
      if (index !== -1) {
        mockLeaveRequests[index].status = status;
        if (status === LeaveStatus.ApprovedByManager) mockLeaveRequests[index].approvedByManagerId = approverId;
        if (status === LeaveStatus.ApprovedByHR) mockLeaveRequests[index].approvedByHRId = approverId;
        if (status === LeaveStatus.Rejected && reason) mockLeaveRequests[index].rejectionReason = reason;
        resolve(mockLeaveRequests[index]);
      } else {
        reject(new Error('Leave request not found.'));
      }
    }, MOCK_API_DELAY);
  });
};

// --- Attendance Overview / Leave Balance ---
export const mockFetchLeaveBalance = (employeeId: string): Promise<LeaveBalance> => {
    return new Promise((resolve) => {
        // This is a very simplified mock. A real system would calculate this based on policies, accruals, and taken leave.
        setTimeout(() => {
            const takenAnnualLeaves = mockLeaveRequests.filter(lr => lr.employeeId === employeeId && lr.leaveType === LeaveType.Annual && (lr.status === LeaveStatus.ApprovedByHR || lr.status === LeaveStatus.ApprovedByManager))
                .reduce((total, lr) => {
                    const start = new Date(lr.startDate);
                    const end = new Date(lr.endDate);
                    // Simplified: counts days inclusive. Real calculation would be more complex (weekends, workdays)
                    const diffTime = Math.abs(end.getTime() - start.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                    return total + diffDays;
                }, 0);
            
            const defaultAnnualLeave = 20; // Example
            
            resolve({
                annualLeaveRemaining: defaultAnnualLeave - takenAnnualLeaves,
                sickLeaveTaken: mockLeaveRequests.filter(lr => lr.employeeId === employeeId && lr.leaveType === LeaveType.Sick && (lr.status === LeaveStatus.ApprovedByHR || lr.status === LeaveStatus.ApprovedByManager)).length,
                bonusLeaveDays: 2, // Example
                publicHolidays: [ // Example public holidays for current year
                    { date: `${new Date().getFullYear()}-01-01`, name: "New Year's Day" },
                    { date: `${new Date().getFullYear()}-04-30`, name: "Reunification Day" },
                    { date: `${new Date().getFullYear()}-05-01`, name: "Labour Day" },
                    { date: `${new Date().getFullYear()}-09-02`, name: "National Day" },
                ]
            });
        }, MOCK_API_DELAY);
    });
};

// --- Payslips (Very simplified) ---
export const mockFetchPayslipsByEmployee = (employeeId: string): Promise<Payslip[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const employee = mockEmployees.find(e => e.id === employeeId);
      if (!employee) {
        resolve([]);
        return;
      }
      // Generate a few mock payslips
      const payslips: Payslip[] = [];
      const grossSalary = employee.position === 'Software Engineer' ? 50000000 : 
                          employee.position === 'HR Manager' ? 60000000 : 30000000; // Mock salary
      
      for (let i = 0; i < 3; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const { netSalary, deductions, taxableIncome } = calculateNetSalary(grossSalary, 0); // 0 dependents for simplicity
        
        payslips.push({
          id: generateId('ps'),
          employeeId: employeeId,
          periodMonth: date.getMonth() + 1,
          periodYear: date.getFullYear(),
          grossSalary: grossSalary,
          netSalary: netSalary,
          deductions: {
            socialInsurance: deductions.si,
            healthInsurance: deductions.hi,
            unemploymentInsurance: deductions.ui,
            personalIncomeTax: deductions.pit,
            personalDeduction: deductions.personal,
            dependentDeduction: deductions.dependent,
          },
          taxableIncome: taxableIncome,
          currency: 'VND',
          fileUrl: '#' // Mock URL
        });
      }
      resolve(payslips);
    }, MOCK_API_DELAY);
  });
};

// Add other mock service functions for Contracts, Performance Evaluations, etc. as needed.
// For now, these are placeholders.
export const mockFetchContractsByEmployee = (employeeId: string): Promise<Contract[]> => new Promise(res => setTimeout(() => res([]), MOCK_API_DELAY));
export const mockFetchPerformanceEvaluationsByEmployee = (employeeId: string): Promise<PerformanceEvaluation[]> => new Promise(res => setTimeout(() => res([]), MOCK_API_DELAY));
export const mockFetchAuditLogs = (): Promise<AuditLog[]> => new Promise(res => setTimeout(() => res([]), MOCK_API_DELAY));
export const mockFetchCompanySettings = (): Promise<CompanySettings> => new Promise(res => setTimeout(() => res({companyName: "HRM Pro Inc.", emailDomain:"example.com", defaultAnnualLeaveDays: 20}), MOCK_API_DELAY));

