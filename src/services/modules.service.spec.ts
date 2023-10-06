import { beforeEach, describe, expect, it } from "vitest";
import { ModulesService } from "./modules.service";
import { IUsersRepository } from "../repositories/i-users-repository";
import { ICoursesRepository } from "../repositories/i-courses-repository";
import { IModulesRepository } from "../repositories/i-modules-repository";
import { IEnrollmentsRepository } from "../repositories/i-enrollments-repository";
import { ModulesServiceFactory } from "./factories/modules.service.factory";
import { randomUUID } from "node:crypto";
import { hash } from "bcrypt";
import { EPriveleges } from "@prisma/client";
import { sign } from "jsonwebtoken";
import { TokenDTO } from "../http/model/token-dto";
import { env } from "../env";
import { CreateModuleRequest, UpdateModuleRequest } from "../http/requests/modules.requests";
import { addAbortSignal } from "node:stream";


//TEST DEPENDENCIES
let modulesService: ModulesService;
let inMemoryUsersRepository: IUsersRepository;
let inMemoryCoursesRepository: ICoursesRepository;
let inMemoryModulesRepository: IModulesRepository;
let inMemoryEnrollmentsRepository: IEnrollmentsRepository;

describe("Should test modules service", () => {
    beforeEach(() => {
        const modulesServiceBuild = ModulesServiceFactory.buildTest();
        modulesService = modulesServiceBuild.service;
        inMemoryUsersRepository = modulesServiceBuild.inMemoryUsersRepository;
        inMemoryCoursesRepository = modulesServiceBuild.inMemoryCoursesRepository;
        inMemoryModulesRepository = modulesServiceBuild.inMemoryModulesRepository;
        inMemoryEnrollmentsRepository = modulesServiceBuild.inMemoryEnrollmentsRepository;
    })

    it("Should create a module", async () => {
        // PREPARATION - PREPARE FOR ACT
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

        const course = await inMemoryCoursesRepository.createCourse({
            name: "javascript from zero to hero",
            photo: btoa("base-64-js-photo"),
            price: 110.90,
            enrollmentsNumber: 0,
            rating: 0,
            ownerId: admin.id,
        })

        const createModuleRequest: CreateModuleRequest = {
            name: "javascript primitive datatypes",
            description: "this module you will learn about primitive javascript types and where do we use then"
        }

        const token = sign({
            id: admin.id,
            password: admin.password,
            privilege: admin.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY)

        //ACT - TEST HYPOTESYS
        const module = await modulesService.createModule(token, course.id, createModuleRequest);

        //ASSERT - CONFIRM HYPOTESYS
        expect(module.name).toBe(createModuleRequest.name);
        expect(module.description).toBe(createModuleRequest.description);
        expect(module.courseId).toBe(course.id);
    })

    it("Should let admin of course get module by id", async () => {
        // PREPARATION - PREPARE FOR ACT
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

        const course = await inMemoryCoursesRepository.createCourse({
            name: "javascript from zero to hero",
            photo: btoa("base-64-js-photo"),
            price: 110.90,
            enrollmentsNumber: 0,
            rating: 0,
            ownerId: admin.id,
        })

        const createModuleRequest: CreateModuleRequest = {
            name: "javascript primitive datatypes",
            description: "this module you will learn about primitive javascript types and where do we use then"
        }

        const token = sign({
            id: admin.id,
            password: admin.password,
            privilege: admin.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY)

        const createdModule = await modulesService.createModule(token, course.id, createModuleRequest);

        //ACT - TEST HYPOTESYS
        const module = await modulesService.getModuleById(token, createdModule.id);

        //ASSERT - CONFIRM HYPOTESYS
        expect(module.name).toEqual(createModuleRequest.name);
        expect(module.description).toEqual(createModuleRequest.description);
        expect(module.courseId).toEqual(course.id);
    })

    it("Should not let a non admin of course get module by id", async () => {
        // PREPARATION - PREPARE FOR ACT
        const adminOfCourse = await inMemoryUsersRepository.createUser({
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

        const course = await inMemoryCoursesRepository.createCourse({
            name: "javascript from zero to hero",
            photo: btoa("base-64-js-photo"),
            price: 110.90,
            enrollmentsNumber: 0,
            rating: 0,
            ownerId: adminOfCourse.id,
        })

        const createModuleRequest: CreateModuleRequest = {
            name: "javascript primitive datatypes",
            description: "this module you will learn about primitive javascript types and where do we use then"
        }

        const tokenOfAdminOfCourse = sign({
            id: adminOfCourse.id,
            password: adminOfCourse.password,
            privilege: adminOfCourse.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY)

        const createdModule = await modulesService.createModule(tokenOfAdminOfCourse, course.id, createModuleRequest);

        const nonAdminOfCourse = await inMemoryUsersRepository.createUser({
            id: randomUUID(),
            email: "alice@email.com",
            firstName: "alice",
            lastName: "doe",
            issued: new Date(),
            lastAccess: new Date(),
            cpf: "109.876.543-21",
            password: await hash("123456789", 6),
            privilege: EPriveleges.administrator,
            username: "alice-doe"
        });

        const tokenOfNonAdminOfCourse = sign({
            id: nonAdminOfCourse.id,
            password: nonAdminOfCourse.password,
            privilege: nonAdminOfCourse.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY);


        //ACT and ASSERT - CONFIRM HYPOTESYS
        expect(async () => {
            await modulesService.getModuleById(tokenOfNonAdminOfCourse, createdModule.id);
        }).rejects.toThrowError()
    })

    it("Should let a student that has enrollment to get created module", async () => {
        // PREPARATION - PREPARE FOR ACT
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

        const course = await inMemoryCoursesRepository.createCourse({
            name: "javascript from zero to hero",
            photo: btoa("base-64-js-photo"),
            price: 110.90,
            enrollmentsNumber: 0,
            rating: 0,
            ownerId: admin.id,
        })

        const createModuleRequest: CreateModuleRequest = {
            name: "javascript primitive datatypes",
            description: "this module you will learn about primitive javascript types and where do we use then"
        }

        const tokenOfAdmin = sign({
            id: admin.id,
            password: admin.password,
            privilege: admin.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY)

        const createdModule = await modulesService.createModule(tokenOfAdmin, course.id, createModuleRequest);

        const enrolledStudent = await inMemoryUsersRepository.createUser({
            id: randomUUID(),
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


        await inMemoryEnrollmentsRepository.createEnrollment({
            id: randomUUID(),
            studentId: enrolledStudent.id,
            courseId: course.id
        });

        const tokenOfEnrolledStudent = sign({
            id: enrolledStudent.id,
            password: enrolledStudent.password,
            privilege: enrolledStudent.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY);

        //ACT - TEST HYPOTESYS
        const module = await modulesService.getModuleById(tokenOfEnrolledStudent, createdModule.id);

        //ASSERT - CONFIRM 
        expect(module.name).toBe(createModuleRequest.name);
        expect(module.description).toBe(createModuleRequest.description);
        expect(module.courseId).toBe(course.id);
    })

    it("Should not let a student that does not have a enrollment to getcreated  module", async () => {
        // PREPARATION - PREPARE FOR ACT
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

        const course = await inMemoryCoursesRepository.createCourse({
            name: "javascript from zero to hero",
            photo: btoa("base-64-js-photo"),
            price: 110.90,
            enrollmentsNumber: 0,
            rating: 0,
            ownerId: admin.id,
        })

        const createModuleRequest: CreateModuleRequest = {
            name: "javascript primitive datatypes",
            description: "this module you will learn about primitive javascript types and where do we use then"
        }

        const tokenOfAdmin = sign({
            id: admin.id,
            password: admin.password,
            privilege: admin.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY)

        const createdModule = await modulesService.createModule(tokenOfAdmin, course.id, createModuleRequest);

        const enrolledStudent = await inMemoryUsersRepository.createUser({
            id: randomUUID(),
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

        const tokenOfEnrolledStudent = sign({
            id: enrolledStudent.id,
            password: enrolledStudent.password,
            privilege: enrolledStudent.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY);

        //ACT and ASSERT - CONFIRM 
        expect(async () => {
            await modulesService.getModuleById(tokenOfEnrolledStudent, createdModule.id);
        }).rejects.toThrowError();
    })

    it("Should let admin of course to get all modules by courseId", async () => {
        // PREPARATION - PREPARE FOR ACT
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

        const course = await inMemoryCoursesRepository.createCourse({
            name: "javascript from zero to hero",
            photo: btoa("base-64-js-photo"),
            price: 110.90,
            enrollmentsNumber: 0,
            rating: 0,
            ownerId: admin.id,
        })

        const createModulesRequest: CreateModuleRequest[] = [
            {
                name: "javascript primitive datatypes",
                description: "this module you will learn about primitive javascript types and where do we use then"
            },
            {
                name: "javascript promises - part 1",
                description: "this module we will talk about promises and javascript, a way to execute asyncronous code"
            },
            {
                name: "javascript promises - part 2",
                description: "this module will talk more about techinical uses of a promise, when it's good when not and more"
            }
        ]

        const token = sign({
            id: admin.id,
            password: admin.password,
            privilege: admin.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY)

        for (let createModuleRequest of createModulesRequest)
            await modulesService.createModule(token, course.id, createModuleRequest);

        //ACT - TEST HYPOTESYS
        const modules = await modulesService.getModulesByCourseId(token, course.id);

        //ASSERT - CONFIRM HYPOTESYS
        modules.forEach((module, i) => {
            const createModuleRequest = createModulesRequest[i];
            expect(module.name).toEqual(createModuleRequest.name);
            expect(module.description).toEqual(createModuleRequest.description);
            expect(module.courseId).toEqual(course.id);
        })
    })


    it("Should  not let non admin of course to get all modules by courseId", async () => {
        // PREPARATION - PREPARE FOR ACT
        const courseAdmin = await inMemoryUsersRepository.createUser({
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

        const course = await inMemoryCoursesRepository.createCourse({
            name: "javascript from zero to hero",
            photo: btoa("base-64-js-photo"),
            price: 110.90,
            enrollmentsNumber: 0,
            rating: 0,
            ownerId: courseAdmin.id,
        })

        const createModulesRequest: CreateModuleRequest[] = [
            {
                name: "javascript primitive datatypes",
                description: "this module you will learn about primitive javascript types and where do we use then"
            },
            {
                name: "javascript promises - part 1",
                description: "this module we will talk about promises and javascript, a way to execute asyncronous code"
            },
            {
                name: "javascript promises - part 2",
                description: "this module will talk more about techinical uses of a promise, when it's good when not and more"
            }
        ]

        const courseAdminToken = sign({
            id: courseAdmin.id,
            password: courseAdmin.password,
            privilege: courseAdmin.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY)

        for (let createModuleRequest of createModulesRequest)
            await modulesService.createModule(courseAdminToken, course.id, createModuleRequest);

        const nonCourseAdmin = await inMemoryUsersRepository.createUser({
            email: "alice@email.com",
            firstName: "alice",
            lastName: "doe",
            issued: new Date(),
            lastAccess: new Date(),
            cpf: "109.876.543-21",
            password: await hash("123456789", 6),
            privilege: EPriveleges.administrator,
            username: "alice-doe"
        })

        const nonCourseAdminToken = sign({
            id: nonCourseAdmin.id,
            password: nonCourseAdmin.password,
            privilege: nonCourseAdmin.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY)


        //ACT and TEST 
        expect(async () => {
            await modulesService.getModulesByCourseId(nonCourseAdminToken, course.id);
        }).rejects.toThrowError()
    })

    it("Should not let student that does not have a enrollment to get all modules by courseId", async () => {
        // PREPARATION - PREPARE FOR ACT
        const courseAdmin = await inMemoryUsersRepository.createUser({
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

        const course = await inMemoryCoursesRepository.createCourse({
            name: "javascript from zero to hero",
            photo: btoa("base-64-js-photo"),
            price: 110.90,
            enrollmentsNumber: 0,
            rating: 0,
            ownerId: courseAdmin.id,
        })

        const createModulesRequest: CreateModuleRequest[] = [
            {
                name: "javascript primitive datatypes",
                description: "this module you will learn about primitive javascript types and where do we use then"
            },
            {
                name: "javascript promises - part 1",
                description: "this module we will talk about promises and javascript, a way to execute asyncronous code"
            },
            {
                name: "javascript promises - part 2",
                description: "this module will talk more about techinical uses of a promise, when it's good when not and more"
            }
        ]

        const courseAdminToken = sign({
            id: courseAdmin.id,
            password: courseAdmin.password,
            privilege: courseAdmin.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY)

        for (let createModuleRequest of createModulesRequest)
            await modulesService.createModule(courseAdminToken, course.id, createModuleRequest);

        const nonEnrolledStudent = await inMemoryUsersRepository.createUser({
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

        const nonCourseAdminToken = sign({
            id: nonEnrolledStudent.id,
            password: nonEnrolledStudent.password,
            privilege: nonEnrolledStudent.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY)

        //ACT and TEST 
        expect(async () => {
            await modulesService.getModulesByCourseId(nonCourseAdminToken, course.id);
        }).rejects.toThrowError()
    })

    it("Should let a student that have a enrollment to get all modules of course", async () => {
        // PREPARATION - PREPARE FOR ACT
        const courseAdmin = await inMemoryUsersRepository.createUser({
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

        const course = await inMemoryCoursesRepository.createCourse({
            name: "javascript from zero to hero",
            photo: btoa("base-64-js-photo"),
            price: 110.90,
            enrollmentsNumber: 0,
            rating: 0,
            ownerId: courseAdmin.id,
        })

        const createModulesRequest: CreateModuleRequest[] = [
            {
                name: "javascript primitive datatypes",
                description: "this module you will learn about primitive javascript types and where do we use then"
            },
            {
                name: "javascript promises - part 1",
                description: "this module we will talk about promises and javascript, a way to execute asyncronous code"
            },
            {
                name: "javascript promises - part 2",
                description: "this module will talk more about techinical uses of a promise, when it's good when not and more"
            }
        ]

        const courseAdminToken = sign({
            id: courseAdmin.id,
            password: courseAdmin.password,
            privilege: courseAdmin.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY)

        for (let createModuleRequest of createModulesRequest)
            await modulesService.createModule(courseAdminToken, course.id, createModuleRequest);

        const enrolledStudent = await inMemoryUsersRepository.createUser({
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

        await inMemoryEnrollmentsRepository.createEnrollment({
            id: randomUUID(),
            studentId: enrolledStudent.id,
            courseId: course.id
        });

        const enrolledStudentToken = sign({
            id: enrolledStudent.id,
            password: enrolledStudent.password,
            privilege: enrolledStudent.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY)

        // ACT - TEST HYPOTESYS
        const modules = await modulesService.getModulesByCourseId(enrolledStudentToken, course.id);

        //TEST - CONFIRM HYPOTESYS
        modules.forEach((module, i) => {
            const createModuleRequest = createModulesRequest[i]
            expect(module.name).toEqual(createModuleRequest.name);
            expect(module.description).toEqual(createModuleRequest.description);
            expect(module.courseId).toEqual(course.id);
        })
    })

    it("Should be able for the course admin to update a module which it ownes", async () => {
        // PREPARATION - PREPARE FOR ACT
        const courseAdmin = await inMemoryUsersRepository.createUser({
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

        const course = await inMemoryCoursesRepository.createCourse({
            name: "javascript from zero to hero",
            photo: btoa("base-64-js-photo"),
            price: 110.90,
            enrollmentsNumber: 0,
            rating: 0,
            ownerId: courseAdmin.id,
        })

        const courseAdminToken = sign({
            id: courseAdmin.id,
            password: courseAdmin.password,
            privilege: courseAdmin.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY);

        const module = await modulesService.createModule(courseAdminToken, course.id, {
            name: "JS - Basics",
            description: "In this module you will learn the basics of Javascript, and how V8 engine works"
        });

        const updateModuleRequest: UpdateModuleRequest = {
            name: "JS - How it Runs",
            description: "In this module you will "
        }
        //ACT - TEST HYPOTESYS
        const updatedModule = await modulesService.updateModuleById(courseAdminToken, module.id, updateModuleRequest);

        //ASSSERT - CONFIRM HYPOTESYS
        expect(updatedModule.name).toEqual(updateModuleRequest.name);
        expect(updatedModule.description).toEqual(updateModuleRequest.description);
        expect(updatedModule.courseId).toEqual(course.id);
    })

    it("Should be not able to a admin to update a course that he does not owne", async () => {
        // PREPARATION - PREPARE FOR ACT
        const courseAdmin = await inMemoryUsersRepository.createUser({
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

        const course = await inMemoryCoursesRepository.createCourse({
            name: "javascript from zero to hero",
            photo: btoa("base-64-js-photo"),
            price: 110.90,
            enrollmentsNumber: 0,
            rating: 0,
            ownerId: courseAdmin.id,
        })

        const courseAdminToken = sign({
            id: courseAdmin.id,
            password: courseAdmin.password,
            privilege: courseAdmin.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY);

        const module = await modulesService.createModule(courseAdminToken, course.id, {
            name: "JS - Basics",
            description: "In this module you will learn the basics of Javascript, and how V8 engine works"
        });

        const updateModuleRequest: UpdateModuleRequest = {
            name: "JS - How it Runs",
            description: "In this module you will "
        }

        const nonCourseAdmin = await inMemoryUsersRepository.createUser({
            email: "alice@email.com",
            firstName: "alice",
            lastName: "doe",
            issued: new Date(),
            lastAccess: new Date(),
            cpf: "109.876.543-21",
            password: await hash("123456789", 6),
            privilege: EPriveleges.administrator,
            username: "alice-doe"
        })

        const nonCourseAdminToken = sign({
            id: nonCourseAdmin.id,
            password: nonCourseAdmin.password,
            privilege: nonCourseAdmin.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY);

        //ACT and TEST - TEST HYPOTESYS
        expect(async () => {
            await modulesService.updateModuleById(nonCourseAdminToken, module.id, updateModuleRequest);
        }).rejects.toThrowError();
    })

})