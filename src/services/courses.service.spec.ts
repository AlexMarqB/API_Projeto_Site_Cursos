import { beforeEach, describe, expect, it } from "vitest";
import { ICoursesRepository } from "../repositories/i-courses-repository";
import { CoursesService } from "./courses.service";
import { CourseServiceFactory } from "./factories/course.service.factory";
import { CreateAdministratorRequest } from "../http/requests/user.requests";
import { IUsersRepository } from "../repositories/i-users-repository";
import { randomUUID } from "crypto";
import { EPriveleges } from "@prisma/client";
import { hash } from "bcrypt";
import { CreateCourseRequest, UpdateCourseRequest } from "../http/requests/course.requests";
import { sign } from "jsonwebtoken";
import { TokenDTO } from "../http/model/token-dto";
import { env } from "../env";
import { IEnrollmentsRepository } from "../repositories/i-enrollments-repository";
import { rejects } from "assert";

//TEST 
let inMemoryEnrollmentsRepository: IEnrollmentsRepository;
let inMemoryUsersRepository: IUsersRepository;
let coursesService: CoursesService;

describe("Should test Courses Service", () => {
    beforeEach(() => {
        const coursesServiceBuild = CourseServiceFactory.buildTest();
        inMemoryUsersRepository = coursesServiceBuild.inMemoryUsersRepository;
        inMemoryEnrollmentsRepository = coursesServiceBuild.inMemoryEnrollmentsRepository;

        coursesService = coursesServiceBuild.service;
    })

    it("Should be able to create a Course", async () => {
        //PREPARATION
        const admin = await inMemoryUsersRepository.createUser({
            id: randomUUID(),
            email: "johndoe@email.com",
            firstName: "john",
            lastName: "doe",
            issued: new Date(),
            lastAccess: new Date(),
            cpf: "123.456.789-10",
            password: await hash("123456789", 6),
            privilege: EPriveleges.administrator,
            username: "john-doe"
        })



        const createCourseRequest: CreateCourseRequest = {
            name: "javascript from zero to hero",
            photo: btoa("image-b64"),
            price: 90
        }

        const token = sign({
            id: admin.id,
            password: admin.password,
            privilege: admin.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY)

        //ACT - TEST HYPOTESYS
        const course = await coursesService.createCourse(token, createCourseRequest);

        //ASSERT - CONFIRM HYPOTESYS
        expect(course.name).toEqual(createCourseRequest.name);
        expect(course.photo).toEqual(createCourseRequest.photo);
        expect(course.price).toEqual(createCourseRequest.price);
        expect(course.ownerId).toEqual(admin.id);
        expect(course.rating).toEqual(0.0);
        expect(course.enrollmentsNumber).toEqual(0);
    })

    it("Should not create a course with same name that one existent", async () => {
        //PREPARATION
        const admin = await inMemoryUsersRepository.createUser({
            id: randomUUID(),
            email: "johndoe@email.com",
            firstName: "john",
            lastName: "doe",
            issued: new Date(),
            lastAccess: new Date(),
            cpf: "123.456.789-10",
            password: await hash("123456789", 6),
            privilege: EPriveleges.administrator,
            username: "john-doe"
        })


        const courseName = "javascript from zero to hero"
        const createCourseRequest: CreateCourseRequest = {
            name: courseName,
            photo: btoa("image-b64"),
            price: 90
        }

        const token = sign({
            id: admin.id,
            password: admin.password,
            privilege: admin.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY)

        await coursesService.createCourse(token, createCourseRequest);

        const createDuplicateCourseRequest: CreateCourseRequest = {
            name: courseName,
            photo: btoa("javascript logo"),
            price: 60
        }

        //ACT and ASSERT - CONFIRM HYPOTESYS
        expect(async () => {
            await coursesService.createCourse(token, createDuplicateCourseRequest);
        }).rejects.toThrowError()
    })


    it("Should Get newly created Course By Id", async () => {
        //PREPARATION
        const admin = await inMemoryUsersRepository.createUser({
            id: randomUUID(),
            email: "johndoe@email.com",
            firstName: "john",
            lastName: "doe",
            issued: new Date(),
            lastAccess: new Date(),
            cpf: "123.456.789-10",
            password: await hash("123456789", 6),
            privilege: EPriveleges.administrator,
            username: "john-doe"
        })



        const createCourseRequest: CreateCourseRequest = {
            name: "javascript from zero to hero",
            photo: btoa("image-b64"),
            price: 90
        }

        const token = sign({
            id: admin.id,
            password: admin.password,
            privilege: admin.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY)

        //ACT - TEST HYPOTESYS
        const { id: createdCourseId } = await coursesService.createCourse(token, createCourseRequest);

        const course = await coursesService.getCourseById(createdCourseId);

        //ASSERT - CONFIRM HYPOTESYS
        expect(createdCourseId).toEqual(course.id);
        expect(course.name).toEqual(createCourseRequest.name);
        expect(course.photo).toEqual(createCourseRequest.photo);
        expect(course.price).toEqual(createCourseRequest.price);
        expect(admin.id).toEqual(course.ownerId)
        expect(course.rating).toEqual(0.0);
        expect(course.enrollmentsNumber).toEqual(0);
    })

    it("Should get all courses", async () => {
        //PREPARATION
        const admin = await inMemoryUsersRepository.createUser({
            id: randomUUID(),
            email: "johndoe@email.com",
            firstName: "john",
            lastName: "doe",
            issued: new Date(),
            lastAccess: new Date(),
            cpf: "123.456.789-10",
            password: await hash("123456789", 6),
            privilege: EPriveleges.administrator,
            username: "john-doe"
        })

        await inMemoryUsersRepository.createUser(admin);

        const createCoursesRequest: CreateCourseRequest[] = [
            {
                name: "javascript from zero to hero",
                photo: btoa("image-b64"),
                price: 90
            },
            {
                name: "dotnet from zero to hero",
                photo: btoa("image-b64"),
                price: 120
            },
            {
                name: "python from zero to hero",
                photo: btoa("image-b64"),
                price: 80
            },
            {
                name: "java  from zero to hero",
                photo: btoa("image-b64"),
                price: 240
            },
            {
                name: "julia from zero to hero",
                photo: btoa("image-b64"),
                price: 130
            },
            {
                name: "c from zero to hero",
                photo: btoa("image-b64"),
                price: 100
            }
        ]
        const token = sign({
            id: admin.id,
            password: admin.password,
            privilege: admin.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY);

        for (let course of createCoursesRequest)
            await coursesService.createCourse(token, course);

        const courses = await coursesService.getAllCourses();

        expect(courses.length).toBe(createCoursesRequest.length);

        courses.forEach((course, i) => {
            const createCourseRequest = createCoursesRequest[i];
            expect(course.name).toBe(createCourseRequest.name)
            expect(course.photo).toBe(createCourseRequest.photo)
            expect(course.price).toBe(createCourseRequest.price)
            expect(course.ownerId).toBe(admin.id);
            expect(course.rating).toBe(0);
            expect(course.enrollmentsNumber).toBe(0);
        })
    })

    it("Should rate a newly created course", async () => {
        //PREPARATION
        const admin = await inMemoryUsersRepository.createUser({
            id: randomUUID(),
            email: "johndoe@email.com",
            firstName: "john",
            lastName: "doe",
            issued: new Date(),
            lastAccess: new Date(),
            cpf: "123.456.789-10",
            password: await hash("123456789", 6),
            privilege: EPriveleges.administrator,
            username: "john-doe"
        })

        const createCourseRequest: CreateCourseRequest = {
            name: "javascript from zero to hero",
            photo: btoa("image-b64"),
            price: 90
        }

        const adminToken = sign({
            id: admin.id,
            password: admin.password,
            privilege: admin.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY)

        const courseToRate = await coursesService.createCourse(adminToken, createCourseRequest);

        const studentToRate = await inMemoryUsersRepository.createUser({
            email: "alice@email.com",
            firstName: "alice",
            lastName: "doe",
            issued: new Date(),
            lastAccess: new Date(),
            cpf: "109.876.543-21",
            password: await hash("123456789", 6),
            privilege: EPriveleges.student,
            username: "alice-doe"
        })

        const studentToRateToken = sign({
            id: studentToRate.id,
            password: studentToRate.password,
            privilege: studentToRate.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY);

        await inMemoryEnrollmentsRepository.createEnrollment({
            id: randomUUID(),
            studentId: studentToRate.id,
            courseId: courseToRate.id,
            hasRatedCourse: false
        });

        //ACT - TEST HYPOTESYS
        const enrollment = await coursesService.rateCourse(studentToRateToken, courseToRate.id, {
            rating: 5
        });

        //ASSERT - CONFIRM HYPOTESYS
        expect(enrollment.numberOfRatings).toBe(1);
        expect(enrollment.rating).toBe(5);
    })

    it("Should not rate a course that already been rated by the same user trying to rate", async () => {
        //PREPARATION
        const admin = await inMemoryUsersRepository.createUser({
            id: randomUUID(),
            email: "johndoe@email.com",
            firstName: "john",
            lastName: "doe",
            issued: new Date(),
            lastAccess: new Date(),
            cpf: "123.456.789-10",
            password: await hash("123456789", 6),
            privilege: EPriveleges.administrator,
            username: "john-doe"
        })

        const createCourseRequest: CreateCourseRequest = {
            name: "javascript from zero to hero",
            photo: btoa("image-b64"),
            price: 90
        }

        const adminToken = sign({
            id: admin.id,
            password: admin.password,
            privilege: admin.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY)

        const courseToRate = await coursesService.createCourse(adminToken, createCourseRequest);

        const studentToRate = await inMemoryUsersRepository.createUser({
            email: "alice@email.com",
            firstName: "alice",
            lastName: "doe",
            issued: new Date(),
            lastAccess: new Date(),
            cpf: "109.876.543-21",
            password: await hash("123456789", 6),
            privilege: EPriveleges.student,
            username: "alice-doe"
        })

        const studentToRateToken = sign({
            id: studentToRate.id,
            password: studentToRate.password,
            privilege: studentToRate.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY);

        await inMemoryEnrollmentsRepository.createEnrollment({
            id: randomUUID(),
            studentId: studentToRate.id,
            courseId: courseToRate.id,
            hasRatedCourse: false
        });

        //ACT - ASSERT
        expect(async () => {
            await coursesService.rateCourse(studentToRateToken, courseToRate.id, {
                rating: 5
            })
            await coursesService.rateCourse(studentToRateToken, courseToRate.id, {
                rating: 3
            })
        }).rejects.toThrowError();
    })

    it("Should not rate a course that student don't have a subscription", async () => {
        //PREPARATION
        const admin = await inMemoryUsersRepository.createUser({
            id: randomUUID(),
            email: "johndoe@email.com",
            firstName: "john",
            lastName: "doe",
            issued: new Date(),
            lastAccess: new Date(),
            cpf: "123.456.789-10",
            password: await hash("123456789", 6),
            privilege: EPriveleges.administrator,
            username: "john-doe"
        })

        const createCourseRequest: CreateCourseRequest = {
            name: "javascript from zero to hero",
            photo: btoa("image-b64"),
            price: 90
        }

        const adminToken = sign({
            id: admin.id,
            password: admin.password,
            privilege: admin.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY)

        const courseToRate = await coursesService.createCourse(adminToken, createCourseRequest);

        const studentToRate = await inMemoryUsersRepository.createUser({
            email: "alice@email.com",
            firstName: "alice",
            lastName: "doe",
            issued: new Date(),
            lastAccess: new Date(),
            cpf: "109.876.543-21",
            password: await hash("123456789", 6),
            privilege: EPriveleges.student,
            username: "alice-doe"
        })

        const studentToRateToken = sign({
            id: studentToRate.id,
            password: studentToRate.password,
            privilege: studentToRate.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY);

        //ACT - ASSERT
        expect(async () => {
            await coursesService.rateCourse(studentToRateToken, courseToRate.id, {
                rating: 5
            })

        }).rejects.toThrowError();
    })

    it("Should update newly created course", async () => {
        //PREPARATION
        const admin = await inMemoryUsersRepository.createUser({
            id: randomUUID(),
            email: "johndoe@email.com",
            firstName: "john",
            lastName: "doe",
            issued: new Date(),
            lastAccess: new Date(),
            cpf: "123.456.789-10",
            password: await hash("123456789", 6),
            privilege: EPriveleges.administrator,
            username: "john-doe"
        })

        const createCourseRequest: CreateCourseRequest = {
            name: "javascript from zero to hero",
            photo: btoa("image-b64"),
            price: 90
        }

        const token = sign({
            id: admin.id,
            password: admin.password,
            privilege: admin.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY)

        const oldCourse = await coursesService.createCourse(token, createCourseRequest);

        const updateCourseRequest: UpdateCourseRequest = {
            name: "rust from zero to hero",
            photo: btoa("rust language photo"),
            price: 99.90
        }

        const authorization = sign({
            id: admin.id,
            password: admin.password,
            privilege: admin.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY);


        //ACT - TEST HYPOTESYS
        await coursesService.updateCourse(authorization, oldCourse.id, updateCourseRequest);
        const updatedCourse = await coursesService.getCourseById(oldCourse.id);

        //ASSERT - CONFIRM HYPOTESYS
        expect(updatedCourse.name).toEqual(updateCourseRequest.name);
        expect(updatedCourse.photo).toEqual(updateCourseRequest.photo);
        expect(updatedCourse.price).toEqual(updateCourseRequest.price);
    })


    it("Should delete newly created course and could not return it since it's deleted", async () => {
        //PREPARATION
        const admin = await inMemoryUsersRepository.createUser({
            id: randomUUID(),
            email: "johndoe@email.com",
            firstName: "john",
            lastName: "doe",
            issued: new Date(),
            lastAccess: new Date(),
            cpf: "123.456.789-10",
            password: await hash("123456789", 6),
            privilege: EPriveleges.administrator,
            username: "john-doe"
        })

        const createCourseRequest: CreateCourseRequest = {
            name: "javascript from zero to hero",
            photo: btoa("image-b64"),
            price: 90
        }

        const token = sign({
            id: admin.id,
            password: admin.password,
            privilege: admin.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY)

        const course = await coursesService.createCourse(token, createCourseRequest);

        //ACT - TEST HYPOTESYS
        await coursesService.deleteCourse(token, course.id);

        //ASSERT - CONFIRM HYPOTESYS
        expect(async () => {
            await coursesService.getCourseById(course.id);
        }).rejects.toThrowError()
    })
})
