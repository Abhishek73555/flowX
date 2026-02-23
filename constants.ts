
import { DayOfWeek, Profession, Priority } from './types';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export const PROFESSIONS: Profession[] = [
  'Student', 'Employee', 'Doctor', 'Worker', 'Freelancer', 'Business Owner', 'Other'
];

export const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];

export const PRIORITY_WEIGHTS: Record<Priority, number> = {
  'Low': 0.5,
  'Medium': 1.0,
  'High': 1.5
};

export const STORAGE_KEY_USER = 'flow-x_user';
export const STORAGE_KEY_TASKS = 'flow-x_tasks';
export const STORAGE_KEY_PERFORMANCE = 'flow-x_perf';
