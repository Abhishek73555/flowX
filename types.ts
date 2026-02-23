
export type Profession = 'Student' | 'Employee' | 'Doctor' | 'Worker' | 'Freelancer' | 'Business Owner' | 'Other';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type Priority = 'Low' | 'Medium' | 'High';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Completed Late' | 'Not Completed';

export interface WorkingHours {
  start: string; // HH:MM
  end: string;   // HH:MM
}

export interface ExtraWorkHour {
  id: string;
  day: DayOfWeek;
  start: string;
  end: string;
}

export interface Task {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  duration: number; // minutes
  priority: Priority;
  notes?: string;
  status: TaskStatus;
  voiceReminder?: string;
  alertTime: 'at-start' | 'before-completion';
}

export interface UserProfile {
  username: string;
  profession: Profession;
  customProfession?: string;
  workingDays: DayOfWeek[];
  regularHours: WorkingHours;
  extraHours: ExtraWorkHour[];
  onboardingComplete: boolean;
}

export interface PerformanceRecord {
  date: string; // YYYY-MM-DD
  score: number;
  completedTasks: number;
  totalTasks: number;
}
