import { Course } from "@prisma/client";
import { CreateCoursePrismaType } from "../../types/create-course-prisma.types";
import { ICoursesRepository } from "../i-courses-repository";
import { randomUUID } from "crypto";

export class InMemoryCoursesRepository implements ICoursesRepository {
    private courses: Course[];

    constructor() {
        this.courses = []
    }

    public async createCourse(course: CreateCoursePrismaType): Promise<Course> {
        return await new Promise((resolve) => {
            const newCourse: Course = {
                id: randomUUID(),
                name: course.name,
                ownerId: course.ownerId!,
                enrollmentsNumber: course.enrollmentsNumber as bigint,
                photo: course.photo,
                price: course.price,
                rating: course.rating,
                numberOfRatings: 0,
            }

            this.courses.push(newCourse);
            resolve(newCourse);
        })
    }

    public async deleteCourseById(id: string): Promise<void> {
        return await new Promise((resolve) => {
            const indexOfCourseToDelete = this.courses.findIndex((course) => course.id === id);
            this.courses.splice(indexOfCourseToDelete);
            resolve()
        })
    }

    public async getCourseById(id: string): Promise<Course | null> {
        return await new Promise((resolve) => {
            const course = this.courses.find((course) => course.id === id);
            resolve(course ? course : null);
        })
    }

    public async getCourseByName(name: string): Promise<Course | null> {
        return await new Promise((resolve) => {
            const course = this.courses.find(course => course.name.toLowerCase() == name.toLowerCase())
            resolve(course ? course : null);
        })
    }

    public async getAllCourses(): Promise<Course[]> {
        return await new Promise(resolve => resolve(this.courses));
    }

    public async getAllCoursesByOwnerId(id: string): Promise<Course[]> {
        return await new Promise(resolve => {
            const coursesOfOwner = this.courses.filter((course) => course.ownerId == id);
            resolve(coursesOfOwner);
        });
    }

    public async replaceCourseById(id: string, course: Course): Promise<Course> {
        return await new Promise(resolve => {
            const indexOfCourseToReplace = this.courses.findIndex(course => course.id === id);
            course.id = id;
            this.courses[indexOfCourseToReplace] = course;
            resolve(course);
        })
    }


}