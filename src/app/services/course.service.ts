import { Injectable, signal, inject } from '@angular/core';
import { Course } from '../models/types';
import { Firestore, collection, collectionData, doc, docData, setDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private firestore = inject(Firestore);
  courses = signal<Course[]>([]);

  constructor() {
    // Escuchar cambios en la colección de cursos de Firestore
    collectionData(collection(this.firestore, 'courses'), { idField: 'id' }).subscribe(data => {
      // Filtrar cursos "basura" o incompletos para evitar el error de "indefinido"
      const validCourses = (data as Course[]).filter(c => c && c.title && c.imageUrl);
      this.courses.set(validCourses);
    });
  }

  async getCourseById(id: string): Promise<Course | undefined> {
    const courseDoc = await firstValueFrom(docData(doc(this.firestore, `courses/${id}`), { idField: 'id' }));
    return courseDoc as Course;
  }

  async addCourse(course: Course) {
    const id = course.id || crypto.randomUUID();
    await setDoc(doc(this.firestore, `courses/${id}`), { ...course, id });
  }

  async updateCourse(id: string, updates: Partial<Course>) {
    await updateDoc(doc(this.firestore, `courses/${id}`), updates);
  }

  async deleteCourse(id: string) {
    await deleteDoc(doc(this.firestore, `courses/${id}`));
  }

  getCourseSync(id: string): Course | undefined {
    return this.courses().find(c => c.id === id);
  }

  // Método para inicializar la DB desde el cliente
  async initializeWithDefaults() {
    // Aquí cargaremos los cursos desde el JSON local
    const courses = await import('../data/courses.json');
    const data = (courses as any).default || courses;
    
    for (const course of data) {
      await this.addCourse(course);
    }
  }
}
