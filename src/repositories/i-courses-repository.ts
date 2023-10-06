import { Course, Prisma, } from "@prisma/client";
import { CreateCoursePrismaType } from "../types/create-course-prisma.types";

export interface ICoursesRepository {
    createCourse(course: CreateCoursePrismaType): Promise<Course>;
    deleteCourseById(id: string): Promise<void>;
    getCourseById(id: string): Promise<Course | null>;
    getCourseByName(name: string): Promise<Course | null>;
    getAllCourses(): Promise<Course[]>
    getAllCoursesByOwnerId(id: string): Promise<Course[]>
    replaceCourseById(id: string, course: Course): Promise<Course>
}