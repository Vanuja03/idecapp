export const UserRole = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  OPERATOR: 'OPERATOR',
  VIEWER: 'VIEWER',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const JobStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
} as const;

export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

export const DayStatus = {
  OPEN: 'OPEN',
  FINALIZED: 'FINALIZED',
} as const;

export type DayStatus = (typeof DayStatus)[keyof typeof DayStatus];

export type AuthUser = {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  isActive?: boolean;
};

export type Vehicle = {
  _id: string;
  vehicleNumber: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type JobUserRef = {
  _id: string;
  name: string;
  username: string;
};

export type Job = {
  _id: string;
  jobDate: string;
  vehicleId: string;
  vehicleNumberSnapshot: string;
  destination: string;
  status: JobStatus;
  notes?: string;
  createdBy?: JobUserRef | string;
  updatedBy?: JobUserRef | string;
  createdAt: string;
  updatedAt: string;
  finalizedAt?: string | null;
  finalizedBy?: JobUserRef | string | null;
};

export type DailyCounts = {
  total: number;
  pending: number;
  completed: number;
  canceled: number;
};

export type DailyView = {
  date: string;
  status: DayStatus;
  finalizedAt: string | null;
  finalizedBy: string | null;
  finalizedByName: string | null;
  counts: DailyCounts;
  jobs: Job[];
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message: string;
};

export type ApiError = {
  success: false;
  message: string;
  errorCode?: string;
  errors?: Record<string, string>;
};
