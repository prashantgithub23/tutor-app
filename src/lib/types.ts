// Mirrors the tables in supabase/schema.sql

export type Role = "tutor" | "parent";

export interface Profile {
  id: string; // matches auth.users.id
  role: Role;
  full_name: string;
}

export interface Student {
  id: string;
  tutor_id: string;
  parent_id: string;
  full_name: string;
  grade: string | null;
}

export interface ClassSession {
  id: string;
  tutor_id: string;
  subject: string;
  day_of_week: number; // 0 = Sunday .. 6 = Saturday, for recurring classes
  start_time: string; // "16:00"
  end_time: string; // "17:00"
  is_adhoc: boolean;
  adhoc_date: string | null; // only set when is_adhoc = true
}

export interface ClassStudent {
  class_id: string;
  student_id: string;
}

export interface Homework {
  id: string;
  class_id: string;
  tutor_id: string;
  details: string;
  due_date: string;
  created_at: string;
}

export interface Message {
  id: string;
  tutor_id: string;
  student_id: string | null; // null = broadcast to all parents
  body: string;
  created_at: string;
}

export type AttendanceStatus = "present" | "absent";

export interface AttendanceRecord {
  id: string;
  class_id: string;
  student_id: string;
  class_date: string; // the specific date this attendance applies to
  status: AttendanceStatus;
  marked_at: string;
}
