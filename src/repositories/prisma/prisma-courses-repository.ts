import { Course, Prisma, PrismaClient } from "@prisma/client";
import { ICoursesRepository } from "../i-courses-repository";
import { CreateCoursePrismaType } from "../../types/create-course-prisma.types";

export class PrismaCoursesRepository implements ICoursesRepository {
    private readonly _prisma: PrismaClient

    constructor(prismaClient: PrismaClient) {
        this._prisma = prismaClient
    }

    public async createCourse(course: CreateCoursePrismaType): Promise<Course> {
        return await this._prisma.course.create({
            data: course
        })
    }

    public async deleteCourseById(id: string): Promise<void> {
        await this._prisma.course.delete({
            where: {
                id
            }
        })
    }

    public async getCourseById(id: string): Promise<Course | null> {
        return await this._prisma.course.findUnique({
            where: {
                id
            }
        })
    }

    public async getCourseByName(name: string): Promise<Course | null> {
        return await this._prisma.course.findUnique({
            where: {
                name
            }
        })
    }

    public async getAllCourses(): Promise<Course[]> {
        return await this._prisma.course.findMany({})
    }

    public async getAllCoursesByOwnerId(id: string): Promise<Course[]> {
        return await this._prisma.course.findMany({
            where: {
                ownerId: id
            }
        })
    }

    public async replaceCourseById(id: string, course: Course): Promise<Course> {
        return await this._prisma.course.update({
            where: {
                id
            },
            data: course
        })
    }

}