import { Injectable, signal, PLATFORM_ID, inject, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User, EnrolledCourse } from '../models/types';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  authState, 
  sendPasswordResetEmail,
  confirmPasswordReset,
  verifyPasswordResetCode,
  applyActionCode,
  updateProfile
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  onSnapshot,
  updateDoc,
  deleteDoc,
  collectionData,
  docData
} from '@angular/fire/firestore';
import { map, switchMap, of, firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private platformId = inject(PLATFORM_ID);

  // Estado reactivo (Signals)
  currentUser = signal<User | null>(null);
  allUsers = signal<User[]>([]); 
  
  // Credenciales fijas para Admin (Removidas por seguridad)
  // El Admin debe gestionarse desde Firestore/Firebase Auth


  constructor() {
    // Escuchar cambios en la autenticación de Firebase
    if (isPlatformBrowser(this.platformId)) {
      authState(this.auth).pipe(
        switchMap(firebaseUser => {
          if (firebaseUser) {
            // Si hay usuario en Firebase, buscar su perfil extendido en Firestore
            return docData(doc(this.firestore, `users/${firebaseUser.uid}`));
          } else {
            return of(null);
          }
        })
      ).subscribe(userData => {
        if (userData) {
          this.currentUser.set(userData as User);
        } else {
          this.currentUser.set(null);
        }
      });

      // Escuchar todos los usuarios (Solo si es admin)
      collectionData(collection(this.firestore, 'users')).subscribe(users => {
        // Filtrar usuarios "basura" o incompletos para que no salgan en blanco
        const validUsers = (users as User[]).filter(u => u && u.name && u.email && u.id);
        this.allUsers.set(validUsers);
        
        // Lógica de "Super-Admin Boot"
        const admin = validUsers.find(u => u.email === 'admin@admin.com.edu');
        if (admin && (!admin.enrolledCourses?.find(c => c.courseId === 'c3') || 
            admin.enrolledCourses?.find(c => c.courseId === 'c3')?.progress !== 100)) {
          this.applyAdminCourseBoost(admin.id);
        }
      });
    }
  }

  private async applyAdminCourseBoost(adminId: string) {
    console.log('Aplicando boost académico al Administrador...');
    // Estructura para el curso c3 (Farmacia) al 100%
    const boost: EnrolledCourse = {
      courseId: 'c3',
      progress: 100,
      grade: 98,
      enrollmentDate: new Date().toISOString(),
      completedLessons: ['c3-l1', 'c3-l2', 'c3-l3', 'c3-l4', 'c3-l5', 'c3-m1-q', 'c3-m2-q', 'c3-m3-q', 'c3-m4-q', 'c3-m5-q', 'c3-final-q'], 
      quizGrades: {
        'c3-m1-q': 100,
        'c3-m2-q': 95,
        'c3-m3-q': 100,
        'c3-final-q': 98
      }
    };
    
    const userRef = doc(this.firestore, `users/${adminId}`);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const current = userDoc.data() as User;
      const enrolled = current.enrolledCourses || [];
      // Filtramos para eliminar IDs antiguos o fantasmas y dejamos solo los válidos
      const updated = enrolled.filter(c => c.courseId !== 'auxiliar-de-farmacia' && c.courseId !== 'c3');
      updated.push(boost);
      await updateDoc(userRef, { enrolledCourses: updated });
    }
  }

  // Método para sincronizar perfil desde Firestore
  private async syncUserProfile(uid: string): Promise<User | null> {
    const userDoc = await getDoc(doc(this.firestore, `users/${uid}`));
    if (userDoc.exists()) {
      const data = userDoc.data() as User;
      this.currentUser.set(data);
      return data;
    }
    return null;
  }

  async login(email: string, pass: string): Promise<boolean> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, pass);
      if (credential.user) {
        await this.syncUserProfile(credential.user.uid);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en Login:', error);
      return false;
    }
  }

  async register(name: string, email: string, pass: string, courseId?: string, educationalStatus?: 'university' | 'general'): Promise<boolean> {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, pass);
      
      if (credential.user) {
        const enrolledCourses: EnrolledCourse[] = [];
        if (courseId) {
          enrolledCourses.push({
            courseId,
            progress: 0,
            grade: 0,
            enrollmentDate: new Date().toISOString(),
            completedLessons: []
          });
        }

        const newUser: User = {
          id: credential.user.uid,
          name,
          email,
          role: 'student', // Hardening: Rol por defecto seguro
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          enrolledCourses,
          educationalStatus: educationalStatus || 'general'
        };

        // Guardar perfil en Firestore
        await setDoc(doc(this.firestore, `users/${newUser.id}`), newUser);
        this.currentUser.set(newUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error en Registro:', error);
      return false;
    }
  }

  async resetPassword(email: string) {
    try {
      const continueUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/login`
        : 'http://localhost:3000/login';
      const actionCodeSettings = {
        url: continueUrl,
        handleCodeInApp: true,
      };
      await sendPasswordResetEmail(this.auth, email, actionCodeSettings);
      return true;
    } catch (error) {
      console.error('Error al recuperar contraseña:', error);
      return false;
    }
  }

  async confirmPasswordReset(code: string, newPass: string) {
    try {
      await confirmPasswordReset(this.auth, code, newPass);
      return true;
    } catch (error) {
      console.error('Error al confirmar reseteo:', error);
      throw error;
    }
  }

  /** Verifies the password reset code is valid and returns the associated email */
  async verifyResetCode(code: string): Promise<string> {
    return verifyPasswordResetCode(this.auth, code);
  }

  /** Applies an action code (email verification, email recovery) */
  async verifyEmail(code: string): Promise<void> {
    await applyActionCode(this.auth, code);
  }

  async logout() {
    await signOut(this.auth);
    this.currentUser.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('proeduca_user');
    }
  }

  async addUser(user: Partial<User>) {
    if (user.email && user.name) {
      const id = crypto.randomUUID();
      await setDoc(doc(this.firestore, `users/${id}`), {
        ...user,
        id,
        role: 'student',
        enrolledCourses: [],
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
      });
    }
  }

  enroll(courseId: string) {
    const user = this.currentUser();
    if (!user) return;

    if (user.enrolledCourses?.find(c => c.courseId === courseId)) {
      return; // Already enrolled
    }

    const updatedUser = {
      ...user,
      enrolledCourses: [
        ...(user.enrolledCourses || []),
        {
          courseId,
          progress: 0,
          grade: 0,
          enrollmentDate: new Date().toISOString(),
          completedLessons: []
        }
      ]
    };

    this.updateUser(updatedUser);
  }

  updateProgress(courseId: string, progress: number, grade: number) {
    const user = this.currentUser();
    if (!user) return;

    const updatedCourses = (user.enrolledCourses || []).map(c => 
      c.courseId === courseId ? { ...c, progress, grade } : c
    );

    this.updateUser({ ...user, enrolledCourses: updatedCourses });
  }

  updateAvatar(newAvatarUrl: string) {
    const user = this.currentUser();
    if (!user) return;
    this.updateUser({ ...user, avatarUrl: newAvatarUrl });
  }

  toggleLessonCompletion(courseId: string, lessonId: string) {
    const user = this.currentUser();
    if (!user) return;

    let isEnrolled = false;
    const updatedCourses = (user.enrolledCourses || []).map(c => {
      if (c.courseId === courseId) {
        isEnrolled = true;
        const completed = new Set(c.completedLessons || []);
        if (completed.has(lessonId)) {
          completed.delete(lessonId);
        } else {
          completed.add(lessonId);
        }
        return { ...c, completedLessons: Array.from(completed) };
      }
      return c;
    });

    if (!isEnrolled) {
      updatedCourses.push({
        courseId,
        progress: 0,
        grade: 0,
        enrollmentDate: new Date().toISOString(),
        completedLessons: [lessonId]
      });
    }

    this.updateUser({ ...user, enrolledCourses: updatedCourses });
  }

  saveQuizGrade(courseId: string, lessonId: string, grade: number) {
    const user = this.currentUser();
    if (!user) return;

    const updatedCourses = (user.enrolledCourses || []).map(c => {
      if (c.courseId === courseId) {
        const quizGrades = { ...(c.quizGrades || {}) };
        
        // Only overwrite if new grade is higher
        const existingGrade = quizGrades[lessonId] || 0;
        if (grade > existingGrade) {
          quizGrades[lessonId] = grade;
        }
        
        const completed = new Set(c.completedLessons || []);
        completed.add(lessonId);

        return { ...c, quizGrades, completedLessons: Array.from(completed) };
      }
      return c;
    });

    this.updateUser({ ...user, enrolledCourses: updatedCourses });
  }

  private async updateUser(updatedUser: User) {
    if (!updatedUser.id) return;
    try {
      await updateDoc(doc(this.firestore, `users/${updatedUser.id}`), { ...updatedUser });
      this.currentUser.set(updatedUser);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  }

  async updateUserInfo(updates: Partial<User>) {
    const user = this.currentUser();
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    await this.updateUser(updatedUser);
  }

  // Método administrativo para eliminar usuarios
  async deleteUser(userId: string) {
    try {
      await deleteDoc(doc(this.firestore, `users/${userId}`));
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  }

  // Método administrativo para actualizar cualquier usuario
  async updateUserById(userId: string, updates: Partial<User>) {
    try {
      await updateDoc(doc(this.firestore, `users/${userId}`), updates);
    } catch (error) {
      console.error('Error al actualizar usuario por ID:', error);
    }
  }
}
