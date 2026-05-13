export interface School {
  id: number;
  name: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  is_active: boolean;
  classes_count?: number;
  students_count?: number;
  teachers_count?: number;
  created_at: string;
}

export interface Class {
  id: number;
  school_id: number;
  name: string;
  grade: number;
  teacher_id?: number;
  students_count?: number;
  created_at: string;
}
