import { Prisma, User } from "@prisma/client";
export interface IUsersRepository {
    createUser(user: Prisma.UserCreateInput): Promise<User>
    deleteUser(id: string): Promise<void>
    existsAdmin(): Promise<boolean>
    getUserById(id: string): Promise<User | null>
    getUserByUsername(username: string): Promise<User | null>
    getUserByEmail(email: string): Promise<User | null>
    getUserByCpf(cpf: string): Promise<User | null>
    replaceUserById(id: string, user: Prisma.UserCreateInput): Promise<User>
}