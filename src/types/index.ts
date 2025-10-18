// Tip tanımlamaları

export interface Employee {
  id: string;
  fullName: string;
  tc: string;
  isDeleted?: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AttendanceEntry {
  employeeId: string;
  employeeRef: string;
  status: 'present' | 'absent';
  ts: Date | string;
  by: string;
}

export interface AttendanceSaveRequest {
  date: string; // YYYY-MM-DD
  entries: {
    employeeId: string;
    status: 'present' | 'absent';
  }[];
}

export interface AttendanceRecord {
  date: string;
  employeeId: string;
  fullName: string;
  status: 'present' | 'absent';
  source: 'manual_edit' | 'admin_save';
  editedAt: string;
}

