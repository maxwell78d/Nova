export interface Certificate {
  id: string; // The certificateId
  serial: string;
  hash: string;
  signature: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  category: string;
  issueDate: string;
  hours: number;
  finalScore: number;
  instructorName: string;
  instructorRole: string;
}
