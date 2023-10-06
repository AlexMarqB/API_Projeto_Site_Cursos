import { beforeEach, describe, expect, it } from "vitest";
import { EnrollmentServiceFactory } from "./factories/enrollment.service.factory";
import { IUsersRepository } from "../repositories/i-users-repository";
import { IEnrollmentsRepository } from "../repositories/i-enrollments-repository";
import { ICoursesRepository } from "../repositories/i-courses-repository";
import { EnrollmentsService } from "./enrollments.service";
import { randomUUID } from "node:crypto";
import { hash } from "bcrypt";
import { EPriveleges } from "@prisma/client";
import { sign } from "jsonwebtoken";
import { TokenDTO } from "../http/model/token-dto";
import { env } from "../env";
import exp from "node:constants";

//TEST DEPENDENCIES
let inMemoryUsersRepository: IUsersRepository;
let inMemoryCoursesRepository: ICoursesRepository;
let enrollmentsService: EnrollmentsService;

describe("Should test enrollments service", () => {
    beforeEach(() => {
        const enrollmentsServiceBuild = EnrollmentServiceFactory.buildTest();

        inMemoryUsersRepository = enrollmentsServiceBuild.inMemoryUsersRepository;
        inMemoryCoursesRepository = enrollmentsServiceBuild.inMemoryCoursesRepository;
        enrollmentsService = enrollmentsServiceBuild.service;
    })

    it("Should not let create a enrollment for a student that already has one enrollment", async () => {
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

        const course = await inMemoryCoursesRepository.createCourse({
            ownerId: admin.id,
            name: "Rust from zero to hero",
            rating: 0,
            numberOfRatings: 0,
            price: 0,
            photo: btoa("Rust course image"),
            enrollmentsNumber: 0,
        })

        const studentToEnroll = await inMemoryUsersRepository.createUser({
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

        const studentToken = sign({
            id: studentToEnroll.id,
            password: studentToEnroll.password,
            privilege: studentToEnroll.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY);

        //ACT - ASSERT
        expect(async () => {
            await enrollmentsService.createEnrollment(studentToken, course.id);
            await enrollmentsService.createEnrollment(studentToken, course.id);
        }).rejects.toThrowError();

    })

    it("Should create a enrollment for a student on a existing course", async () => {
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

        const course = await inMemoryCoursesRepository.createCourse({
            ownerId: admin.id,
            name: "Rust from zero to hero",
            rating: 0,
            numberOfRatings: 0,
            price: 0,
            photo: btoa("Rust course image"),
            enrollmentsNumber: 0,
        })

        const studentToEnroll = await inMemoryUsersRepository.createUser({
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

        const studentToken = sign({
            id: studentToEnroll.id,
            password: studentToEnroll.password,
            privilege: studentToEnroll.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY);

        //ACT
        const enrollment = await enrollmentsService.createEnrollment(studentToken, course.id);

        //ASSERT
        expect(enrollment.studentId).toBe(studentToEnroll.id);
        expect(enrollment.courseId).toBe(course.id);
    })

    it("Should List all enrollments of a student", async () => {
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

        const course = await inMemoryCoursesRepository.createCourse({
            ownerId: admin.id,
            name: "Rust from zero to hero",
            rating: 0,
            numberOfRatings: 0,
            price: 0,
            photo: btoa("Rust course image"),
            enrollmentsNumber: 0,
        })

        const studentToEnroll = await inMemoryUsersRepository.createUser({
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

        const studentToken = sign({
            id: studentToEnroll.id,
            password: studentToEnroll.password,
            privilege: studentToEnroll.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY);

        const enrollment = await enrollmentsService.createEnrollment(studentToken, course.id);

        //ACT
        const enrollments = await enrollmentsService.findEnrollmentsByStudentId(studentToken);

        //ASSERT
        expect(enrollments.length).toBe(1);

        const foundFirstCreatedEnrollment = enrollments.find((enrollmentFound) => enrollmentFound.id === enrollment.id);
        expect(foundFirstCreatedEnrollment!.id).toBe(enrollment.id);
        expect(foundFirstCreatedEnrollment!.courseId).toBe(enrollment.courseId);
        expect(foundFirstCreatedEnrollment!.studentId).toBe(enrollment.studentId);
    })

    it("Should not List all enrollments of other student being logged as one student", async () => {
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

        const course = await inMemoryCoursesRepository.createCourse({
            ownerId: admin.id,
            name: "Rust from zero to hero",
            rating: 0,
            numberOfRatings: 0,
            price: 0,
            photo: btoa("Rust course image"),
            enrollmentsNumber: 0,
        })

        const studentToEnroll = await inMemoryUsersRepository.createUser({
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

        const studentToEnrollToken = sign({
            id: studentToEnroll.id,
            password: studentToEnroll.password,
            privilege: studentToEnroll.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY);

        await enrollmentsService.createEnrollment(studentToEnrollToken, course.id);

        const studentToListNoEnrollments = await inMemoryUsersRepository.createUser({
            email: "bob@email.com",
            firstName: "bob",
            lastName: "doe",
            issued: new Date(),
            lastAccess: new Date(),
            cpf: "109.876.543-21",
            password: await hash("123456789", 6),
            privilege: EPriveleges.student,
            username: "bob-doe"
        })

        const studentToListNoEnrollmentsToken = sign({
            id: studentToListNoEnrollments.id,
            password: studentToListNoEnrollments.password,
            privilege: studentToListNoEnrollments.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY);

        //ACT
        const enrollments = await enrollmentsService.findEnrollmentsByStudentId(studentToListNoEnrollmentsToken);

        //ASSERT
        expect(enrollments.length).toBe(0);
    })
})