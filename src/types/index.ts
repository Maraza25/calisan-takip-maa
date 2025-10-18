export interface Employee {
  id: string;
  tc: string;
  fullName: string;
  disabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
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
}

