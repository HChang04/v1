
export enum UserRole {
  Admin = 'Admin',
  HRManager = 'HRManager',
  LineManager = 'LineManager',
  Employee = 'Employee',
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  employeeId?: string; // Link to Employee record
}

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  joinDate: string; // ISO Date string
  status: 'Active' | 'Inactive' | 'OnLeave';
  avatarUrl?: string;
  address?: string;
  dateOfBirth?: string; // ISO Date string
  nationality?: string;
  managerId?: string; // Employee ID of their manager
}

export enum LeaveType {
  Annual = 'Annual',
  Sick = 'Sick',
  Unpaid = 'Unpaid',
  Maternity = 'Maternity',
  Paternity = 'Paternity',
  Bereavement = 'Bereavement',
}

export enum LeaveStatus {
  Pending = 'Pending',
  ApprovedByManager = 'ApprovedByManager',
  ApprovedByHR = 'ApprovedByHR',
  Rejected = 'Rejected',
  Cancelled = 'Cancelled',
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName?: string; // For display
  leaveType: LeaveType;
  startDate: string; // ISO Date string
  endDate: string; // ISO Date string
  reason: string;
  status: LeaveStatus;
  submittedDate: string; // ISO Date string
  approvedByManagerId?: string;
  approvedByHRId?: string;
  rejectionReason?: string;
  comments?: Array<{ userId: string; comment: string; date: string }>;
}

export interface Contract {
  id: string;
  employeeId: string;
  contractType: 'Probation' | 'Permanent' | 'PartTime' | 'FixedTerm';
  startDate: string; // ISO Date string
  endDate?: string; // ISO Date string (optional for permanent)
  salary: number;
  currency: 'VND' | 'USD';
  jobTitle: string;
  contractFileUrl?: string; // Link to PDF or document
}

export interface Payslip {
  id:string;
  employeeId: string;
  periodMonth: number; // 1-12
  periodYear: number;
  grossSalary: number;
  netSalary: number;
  deductions: {
    socialInsurance: number; // 8%
    healthInsurance: number; // 1.5%
    unemploymentInsurance: number; // 1%
    personalIncomeTax: number;
    personalDeduction: number; // 11M VND
    dependentDeduction: number; // 4.4M VND per dependent
    otherDeductions?: number;
  };
  taxableIncome: number;
  currency: 'VND';
  fileUrl?: string; // Link to PDF payslip
}

export interface PerformanceEvaluation {
  id: string;
  employeeId: string;
  evaluatorId: string; // Manager's employee ID
  period: string; // e.g., "Q1 2024", "Annual 2023"
  kpis: Array<{ name: string; target: string; actual: string; weight: number; score: number }>;
  strengths: string;
  areasForImprovement: string;
  managerComments: string;
  employeeComments?: string;
  overallScore: number; // e.g., 1-5 scale
  status: 'Pending' | 'InProgress' | 'Completed' | 'Acknowledged';
  evaluationDate: string; // ISO Date string
}

export interface RecruitmentCampaign {
  id: string;
  title: string;
  department: string;
  status: 'Open' | 'Closed' | 'OnHold';
  openings: number;
  startDate: string; // ISO Date string
  endDate?: string; // ISO Date string
}

export interface Candidate {
  id: string;
  campaignId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  cvUrl: string;
  status: 'Applied' | 'Screening' | 'InterviewScheduled' | 'Interviewed' | 'OfferExtended' | 'OfferAccepted' | 'OfferRejected' | 'Hired' | 'Rejected';
  interviewDate?: string; // ISO Date string
  interviewerIds?: string[];
  feedback?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string; // ISO Date string
  userId: string; // User who performed the action
  username?: string;
  action: string; // e.g., "USER_LOGIN", "EMPLOYEE_PROFILE_UPDATE"
  targetEntityType?: string; // e.g., "Employee", "LeaveRequest"
  targetEntityId?: string;
  details: Record<string, any>; // Additional details about the action
}

export interface CompanySettings {
    companyName: string;
    logoUrl?: string;
    emailDomain: string;
    defaultAnnualLeaveDays: number;
    // other settings
}

// For Attendance Overview
export interface LeaveBalance {
  annualLeaveRemaining: number;
  sickLeaveTaken: number;
  bonusLeaveDays: number; // Or other types of leave balances
  publicHolidays: Array<{ date: string, name: string }>; // For display on calendar
}

// For Payroll Calculation
export interface PITBracket {
  from: number;
  to: number | null; // null for the highest bracket
  rate: number; // as a decimal, e.g., 0.05 for 5%
}
