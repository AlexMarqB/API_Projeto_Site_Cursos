import { User } from "@prisma/client"

export type CreateAdministratorRequest = {
    admin: {
        email: string,
        username: string
        password: string,
        firstName: string,
        lastName: string,
        cpf: string,
    }
    token?: string
}

export type CreateStudentRequest = {
    email: string,
    username: string
    password: string,
    firstName: string,
    lastName: string,
    cpf: string,
}

export type LoginUserRequest = {
    email: string,
    password: string
}

export type UpdateUserRequest = {
    email: string,
    username: string,
    password: string,
    firstName: string,
    lastName: string
}