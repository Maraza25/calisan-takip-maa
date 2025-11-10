export interface Employee {
  id: string;
  tc: string;
  fullName: string;
  siteId: string;
  disabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Site {
  id: string;
  name: string;
  code?: string;
  location?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  siteId: string;
  date: string; // YYYY-MM-DD formatında
  status: 'present' | 'absent'; // geldi / gelmedi
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyReport {
  employeeId: string;
  employeeName: string;
  tc: string;
  totalDays: number;
  presentDates: string[];
  isDisabled: boolean;
  siteId?: string;
}

