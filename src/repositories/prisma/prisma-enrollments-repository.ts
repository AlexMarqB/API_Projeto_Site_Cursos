import { Enrollment, Prisma, PrismaClient } from "@prisma/client";
import { IEnrollmentsRepository } from "../i-enrollments-repository";
import { CreateEnrollmentPrismaType } from "../../types/create-enrollment-prisma.types";

export class PrismaEnrollmentsRepository implements IEnrollmentsRepository {

    private readonly _prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this._prisma = prismaClient;
    }

    public async createEnrollment(enrollment: CreateEnrollmentPrismaType): Promise<Enrollment> {
        return await this._prisma.enrollment.create({
            data: enrollment
        })
    }

    public async findEnrollmentsByStudentId(studentId: string): Promise<Enrollment[]> {
        return await this._prisma.enrollment.findMany({
            where: {
                studentId
            }
        })
    }

    public async findEnrollmentByStudentIdAndCourseId(studentId: string, courseId: string): Promise<Enrollment | null> {
        return await this._prisma.enrollment.findFirst({
            where: {
                studentId,
                courseId
            }
        })
    }

    public async setHasRatedACourseToTrueById(enrollmentId: string): Promise<Enrollment> {
        return await this._prisma.enrollment.update({
            where: {
                id: enrollmentId
            },
            data: {
                hasRatedCourse: true
            }
        })
    }

    public async existsEnrollmentForStudentAtCourseByIds(studentId: string, courseId: string): Promise<boolean> {
        const enrollments = await this._prisma.enrollment.count({
            where: {
                courseId,
                studentId
            }
        })

        return enrollments == 1;
    }

}