import { beforeEach, describe, expect, it } from 'vitest';
import { UsersService } from './users.service';
import { UserServiceFactory } from './factories/user.service.factory';
import { CreateAdministratorRequest, CreateStudentRequest, UpdateUserRequest } from '../http/requests/user.requests';
import { compare } from 'bcrypt';
import { InMemoryUsersRepository } from '../repositories/in-memory-repository/in-memory-users-repository';
import { EPriveleges } from '@prisma/client';
import { sign } from 'jsonwebtoken';
import { TokenDTO } from '../http/model/token-dto';
import { env } from '../env/index';

//TEST DEPENDENCIES
let inMemoryUsersRepository: InMemoryUsersRepository;
let usersService: UsersService;

// TEST
describe("Should test Users Service", () => {
    //DEPENDENCY RESOLVE - For each test
    beforeEach(() => {
        const usersServiceBuild = UserServiceFactory.buildTest();
        inMemoryUsersRepository = usersServiceBuild.inMemoryRepository;
        usersService = usersServiceBuild.service;
    })

    it("Should be able to Create a new Admin since no admin exists", async () => {
        //PREPARATION
        const email = "johnydoe@email.com";
        const password = "my-secret-password";

        const createAdministratorRequest: CreateAdministratorRequest = {
            admin: {
                email,
                username: "John doe",
                firstName: "John",
                lastName: "Doe",
                password,
                cpf: "123.345.678-91"
            }
        }
        // ACT - TEST HYPOTESYS

        const { user } = await usersService.createAdminstrator(createAdministratorRequest);

        // ASSERTION - CONFIRM HYPOTESYS
        expect(user.email).toBe(email);

        const isPasswordEqual = await compare(password, user.password);
        expect(isPasswordEqual).toBe(true);
    })

    it("Should not let a new administrator to be created since one already exists", async () => {
        //PREPARATION
        //INJECT - User
        const issued = new Date();

        inMemoryUsersRepository.createUser({
            email: "bob@email.com",
            username: "bob",
            firstName: "bob",
            password: "my-secret-pw",
            lastName: "",
            cpf: "123.123.123-5",
            privilege: EPriveleges.administrator,
            issued: issued,
            lastAccess: issued,
        })

        const createAdministratorRequest: CreateAdministratorRequest = {
            admin: {
                email: "johndoe@email.com",
                username: "John doe",
                firstName: "John",
                lastName: "Doe",
                password: "my-secret-pw",
                cpf: "123.345.678-91"
            }
        }
        // ACT + ASSERTION - CONFIRM HYPOTESYS
        await expect(async () =>
            usersService.createAdminstrator(createAdministratorRequest)
        ).rejects.toThrowError();
    })

    it("Should login admin as authentication is correct", async () => {
        //PREPARATION
        const email = "johnydoe@email.com";
        const password = "my-secret-password";

        const createAdministratorRequest: CreateAdministratorRequest = {
            admin: {
                email,
                username: "John doe",
                firstName: "John",
                lastName: "Doe",
                password,
                cpf: "123.345.678-91"
            }
        }

        const { user } = await usersService.createAdminstrator(createAdministratorRequest);
        const tokenExpectation = sign({
            id: user.id,
            password: user.password,
            privilege: user.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY);
        // ACT - TEST  HYPOTESYS

        const { token, me } = await usersService.loginUser({ email, password });

        // ASSERTION - CONFIRM HYPOTESYS
        expect(token).toBe(tokenExpectation);
        expect(me.id).toBe(user.id)
        expect(me.username).toBe(user.username);
        expect(me.firstName).toBe(user.firstName);
        expect(me.lastName).toBe(user.lastName);
        expect(me.privilege).toBe(user.privilege);

    })

    it("Should create a new Admin even with a already created admin, since token was sent to", async () => {
        //PREPARATION
        const email = "bob@email.com";
        const password = "my-secret-pw";

        await usersService.createAdminstrator({
            admin: {
                email,
                username: "bob",
                firstName: "bob",
                password,
                lastName: "",
                cpf: "123.123.123-10",
            }
        })

        const { token } = await usersService.loginUser({ email, password });

        const createAdministratorRequest: CreateAdministratorRequest = {
            admin: {
                email: "davie@email.com",
                firstName: "Dave",
                lastName: "Aron",
                username: "Dave Aron",
                cpf: "123.456.789-10",
                password: "my-secret-pw",
            },
            token
        }

        // ACT - TEST HYPOTESYS

        const { user } = await usersService.createAdminstrator(createAdministratorRequest);
        const expectedUser = await inMemoryUsersRepository.getUserByEmail("davie@email.com");

        // ASSERTION - CONFIRM HYPOTESYS
        expect(user.email).toBe("davie@email.com")
        expect(user.password).toBe(expectedUser!.password)
        expect(user.username).toBe("Dave Aron");
    })

    it("Should create a new Student", async () => {
        // PREPARATION
        const email = "helena@email.com";
        const password = "securePassphrase";
        const createStudentRequest: CreateStudentRequest = {
            email,
            username: "helena",
            firstName: "helena",
            lastName: "",
            password,
            cpf: "123.456.789-10"
        }

        //ACT - TEST HYPOTESYS
        const { user } = await usersService.createStudent(createStudentRequest);

        // ASSERTION - CONFIRM HYPOTESYS
        expect(user.email).toBe(email);

        const isPasswordCorrect = await compare(password, user.password);
        expect(isPasswordCorrect).toBe(true);
    })

    it("Should Login a student", async () => {
        // PREPARATION
        const email = "helena@email.com";
        const password = "securePassphrase";
        const createStudentRequest: CreateStudentRequest = {
            email,
            username: "helena",
            firstName: "helena",
            lastName: "",
            password,
            cpf: "123.456.789-10"
        }

        // ACT - TEST HYPOTESYS
        const { user } = await usersService.createStudent(createStudentRequest);

        const expectedToken = sign({ id: user.id, password: user.password, privilege: user.privilege } as TokenDTO, env.JWT_SECURITY_KEY);
        const { token, me } = await usersService.loginUser({ email, password });

        // ASSERTION - CONFIRM HYPOTESYS
        expect(token).toBe(expectedToken);
        expect(me.id).toBe(user.id);
        expect(me.username).toBe(user.username);
        expect(me.firstName).toBe(user.firstName);
        expect(me.lastName).toBe(user.lastName);
        expect(me.privilege).toBe(user.privilege);
    })

    it("Should Update a User", async () => {
        // PREPARATION
        const email = "bob@email.com";
        const password = "12345678";

        const { user: administrator } = await usersService.createAdminstrator({
            admin: {
                username: "bob",
                email,
                password,
                cpf: "123.456.789-10",
                firstName: "Bob",
                lastName: ""
            }
        });

        const updateAdminRequest: UpdateUserRequest = {
            email: "bobking@email.com",
            password: "bobkingpassword",
            firstName: "bob",
            lastName: "king",
            username: "bob-king"
        };

        const { token: oldToken, me: oldMe } = await usersService.loginUser({ email, password });

        // ACT - Test Hypotesys
        const { token: newToken } = await usersService.updateUser(oldToken, updateAdminRequest);

        // ASSERT - Validate Hypostesys
        const updatedAdministrator = await inMemoryUsersRepository.getUserById(administrator.id);

        expect(updatedAdministrator!.id).toBe(administrator.id)
        expect(updatedAdministrator!.email).toBe(updateAdminRequest.email)

        const isHashEqual = await compare(updateAdminRequest.password, updatedAdministrator!.password);
        expect(isHashEqual).toBe(true);

        expect(updatedAdministrator!.firstName).toBe(updateAdminRequest.firstName)
        expect(updatedAdministrator!.lastName).toBe(updateAdminRequest.lastName)
    })


    it("Should Delete a User", async () => {
        // PREPARATION
        const email = "johndoe@email.com"
        const password = "john-doe-secure-password"
        const createStudentRequest: CreateStudentRequest = {
            email,
            firstName: "john",
            lastName: "doe",
            username: "john doe",
            password,
            cpf: "123.456.789-10",
        }
        await usersService.createStudent(createStudentRequest);

        const { me, token } = await usersService.loginUser({ email, password });

        //ACT - Test Hypotesys
        await usersService.deleteUser(token);

        // ASSERT - Confirm Hypotesys
        const existentUser = await inMemoryUsersRepository.getUserById(me.id);
        expect(existentUser).toBe(null);
    })


})