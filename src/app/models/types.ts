export interface AiConfig {
  tutorName: string;
  systemPrompt: string;
  restrictedInLessonTypes: string[];
}

export interface QuizQuestion {
  question: string;
  options?: string[];
  correctAnswerIndex?: number;
  type?: 'mc' | 'case' | 'order' | 'short';
  correctOrder?: string[];
  explanation?: string; // Guidance for AI evaluation
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz';
  duration: string;
  url?: string;
  content?: string;
  isAssessment?: boolean;
  questions?: QuizQuestion[];
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  duration: string;
  level: string;
  learningObjectives: string[];
  modules: CourseModule[];
  aiConfig?: AiConfig;
  supplementaryActivities?: { title: string; description: string }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  avatarUrl: string;
  enrolledCourses: EnrolledCourse[];
  phone?: string;
  address?: string;
  dob?: string;
  bio?: string;
  learningPreferences?: string;
  educationalStatus?: 'university' | 'general' | 'hs-1' | 'hs-2' | 'hs-3' | 'hs-4' | 'hs-5' | 'hs-6';
}

export interface EnrolledCourse {
  courseId: string;
  progress: number; // 0 to 100
  grade: number;
  enrollmentDate: string;
  completedLessons: string[];
  quizGrades?: Record<string, number>;
}
