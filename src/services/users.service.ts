import { compare, hash } from "bcrypt";
import { EPriveleges } from "@prisma/client";
import { ConflictError } from "../../src/errors/conflict-error";
import { IUsersRepository } from "../repositories/i-users-repository";
import { CreateAdministratorRequest, CreateStudentRequest, LoginUserRequest, UpdateUserRequest } from "../http/requests/user.requests";
import { CreateUserResponse } from "../http/responses/user.responses";
import { IsValidCpf, cpfRegex } from "../lib/validators";
import { BadRequestError } from "../../src/errors/bad-request";
import { sign, verify } from 'jsonwebtoken';
import { env } from "../../src/env";
import { TokenDTO } from "../http/model/token-dto";
import { ForbiddenError } from "../../src/errors/forbidden-error";
import { NotFoundError } from "../../src/errors/not-found-error";
import { UnauthorizedError } from "../../src/errors/unauthorized-error";
import { authenticateUser } from "../lib/extensions/authenticate-user";
import { UserDTO } from "../http/model/user-dto";

export class UsersService {
    constructor(
        private readonly _userRepository: IUsersRepository
    ) { }

    public async createAdminstrator({ admin: { username, password, lastName, firstName, email, cpf }, token }: CreateAdministratorRequest): Promise<CreateUserResponse> {
        if (await this._userRepository.existsAdmin()) {
            if (!token)
                throw new BadRequestError("Token is missing");

            const parsedToken = verify(token, env.JWT_SECURITY_KEY) as TokenDTO;
            if (parsedToken.privilege != "administrator")
                throw new ForbiddenError("Access denied");

            const admin = await this._userRepository.getUserById(parsedToken.id);
            if (admin == null)
                throw new UnauthorizedError("Could not find admin");

            if (!await compare(password, admin.password))
                throw new ForbiddenError("Access denied");
        }

        const userWithSameEmail = await this._userRepository.getUserByEmail(email);

        if (userWithSameEmail)
            throw new ConflictError("User already exists");

        const userWithSameUsername = await this._userRepository.getUserByUsername(username);

        if (userWithSameUsername)
            throw new ConflictError("User already exists");

        if (!cpfRegex.test(cpf) || !IsValidCpf.test(cpf))
            throw new BadRequestError("Cpf is not valid");

        const userWithSameCpf = await this._userRepository.getUserByCpf(cpf);
        if (userWithSameCpf)
            throw new ConflictError("User already exists");

        const hashPassword = await hash(password, 6);

        const issued = new Date();
        const privilege = EPriveleges.administrator;
        const newUser = await this._userRepository.createUser({
            email,
            username,
            password: hashPassword,
            firstName,
            lastName,
            cpf,
            privilege,
            issued,
            lastAccess: issued,
        });
        return {
            user: newUser!
        }
    }

    public async createStudent({ username, password, lastName, firstName, email, cpf }: CreateStudentRequest): Promise<CreateUserResponse> {
        const userWithSameEmail = await this._userRepository.getUserByEmail(email);
        if (userWithSameEmail)
            throw new ConflictError("User already exists");

        const userWithSameUsername = await this._userRepository.getUserByUsername(username);
        if (userWithSameUsername)
            throw new ConflictError("User already exists");

        if (!cpfRegex.test(cpf) || !IsValidCpf.test(cpf))
            throw new BadRequestError("Cpf is not valid");

        const userWithSameCpf = await this._userRepository.getUserByCpf(cpf);
        if (userWithSameCpf)
            throw new ConflictError("User already exists");

        const hashPassword = await hash(password, 6);

        const issued = new Date();
        const privilege = EPriveleges.student;

        const newUser = await this._userRepository.createUser({
            email,
            username,
            password: hashPassword,
            firstName,
            lastName,
            cpf,
            privilege,
            issued,
            lastAccess: issued,
        })
        return {
            user: newUser
        }
    }

    public async loginUser({ email, password }: LoginUserRequest): Promise<{
        me: UserDTO,
        token: string
    }> {
        const user = await this._userRepository.getUserByEmail(email);
        if (user == null)
            throw new NotFoundError("Could not found user")

        if (!await compare(password, user.password))
            throw new ForbiddenError("Could not login into user");

        const token = sign({
            id: user.id,
            password: user.password,
            privilege: user.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY);

        return {
            me: {
                id: user.id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                privilege: user.privilege
            },
            token
        }
    }

    public async getMe(token: string): Promise<UserDTO> {
        const { id, username, firstName, lastName, privilege } = await authenticateUser(token, this._userRepository);
        return {
            id,
            username,
            firstName,
            lastName,
            privilege
        };
    }

    public async updateUser(token: string, { email, username, password, firstName, lastName }: UpdateUserRequest): Promise<{ token: string }> {
        const authenticatedUser = await authenticateUser(token, this._userRepository);

        if (email)
            authenticatedUser.email = email;

        if (username)
            authenticatedUser.username = username

        if (password) {
            const hashPassword = await hash(password, 6);
            authenticatedUser.password = hashPassword;
        }

        if (firstName)
            authenticatedUser.firstName = firstName;

        if (lastName)
            authenticatedUser.lastName = lastName;

        await this._userRepository.replaceUserById(authenticatedUser.id, {
            email: authenticatedUser.email,
            username: authenticatedUser.username,
            password: authenticatedUser.password,
            firstName: authenticatedUser.firstName,
            lastName: authenticatedUser.lastName,
            issued: authenticatedUser.issued,
            lastAccess: authenticatedUser.lastAccess,
            privilege: authenticatedUser.privilege,
            cpf: authenticatedUser.cpf
        });

        const newToken = sign({
            id: authenticatedUser.id,
            password: authenticatedUser.password,
            privilege: authenticatedUser.privilege
        } as TokenDTO, env.JWT_SECURITY_KEY);

        return {
            token: newToken
        }
    }

    public async deleteUser(token: string) {
        const authenticatedUser = await authenticateUser(token, this._userRepository);

        await this._userRepository.deleteUser(authenticatedUser.id);
    }
}
