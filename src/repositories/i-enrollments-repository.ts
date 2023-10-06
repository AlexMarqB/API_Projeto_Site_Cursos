import { Enrollment, Prisma } from "@prisma/client";
import { CreateEnrollmentPrismaType } from "../types/create-enrollment-prisma.types";

export interface IEnrollmentsRepository {
    createEnrollment(enrollment: CreateEnrollmentPrismaType): Promise<Enrollment>
    findEnrollmentsByStudentId(studentId: string): Promise<Enrollment[]>
    findEnrollmentByStudentIdAndCourseId(studentId: string, courseId: string): Promise<Enrollment | null>
    setHasRatedACourseToTrueById(enrollmentId: string): Promise<Enrollment>
    existsEnrollmentForStudentAtCourseByIds(studentId: string, courseId: string): Promise<boolean>
}