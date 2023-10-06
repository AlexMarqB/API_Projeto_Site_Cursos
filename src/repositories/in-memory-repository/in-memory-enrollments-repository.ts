import { Prisma, Enrollment } from "@prisma/client";
import { IEnrollmentsRepository } from "../i-enrollments-repository";
import { CreateEnrollmentPrismaType } from "../../types/create-enrollment-prisma.types";
import { randomUUID } from "crypto";

export class InMemoryEnrollmentsRepository implements IEnrollmentsRepository {
    private enrollments: Enrollment[];

    constructor() {
        this.enrollments = [];
    }

    public async createEnrollment(enrollment: CreateEnrollmentPrismaType): Promise<Enrollment> {
        return await new Promise(resolve => {
            const newEnrollment: Enrollment = {
                id: randomUUID(),
                courseId: enrollment.courseId,
                studentId: enrollment.studentId,
                hasRatedCourse: false
            }

            this.enrollments.push(newEnrollment);
            resolve(newEnrollment);
        })
    }
    public async findEnrollmentsByStudentId(studentId: string): Promise<Enrollment[]> {
        return await new Promise(resolve => {
            const studentEnrollments = this.enrollments.filter(enrollment => enrollment.studentId === studentId);
            resolve(studentEnrollments);
        })
    }

    public async findEnrollmentByStudentIdAndCourseId(studentId: string, courseId: string): Promise<Enrollment | null> {
        return await new Promise(resolve => {
            const enrollment = this.enrollments.find(enrollment => enrollment.studentId === studentId && enrollment.courseId === courseId);
            resolve(enrollment ? enrollment : null);
        })
    }

    public async existsEnrollmentForStudentAtCourseByIds(studentId: string, courseId: string): Promise<boolean> {
        return await new Promise(resolve => {
            const existsEnrollment = this.enrollments
                .some(enrollment =>
                    enrollment.studentId === studentId &&
                    enrollment.courseId === courseId);

            resolve(existsEnrollment);
        })
    }

    public async setHasRatedACourseToTrueById(enrollmentId: string): Promise<Enrollment> {
        return await new Promise(resolve => {
            const indexOfEnrollmentToUpdate = this.enrollments.findIndex(enrollment => enrollment.id === enrollmentId);
            this.enrollments[indexOfEnrollmentToUpdate].hasRatedCourse = true;

            resolve(this.enrollments[indexOfEnrollmentToUpdate]);
        })
    }

}