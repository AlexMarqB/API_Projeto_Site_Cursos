import { $Enums, Prisma, PrismaClient, User } from "@prisma/client";
import { IUsersRepository } from "../i-users-repository";
export class PrismaUsersRepository implements IUsersRepository {
    private readonly _prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this._prisma = prismaClient
    }

    public async createUser(user: Prisma.UserCreateInput) {
        return await this._prisma.user.create({
            data: user
        });
    }

    public async deleteUser(id: string): Promise<void> {
        await this._prisma.user.delete({
            where: {
                id
            }
        })
    }

    public async getUserById(id: string) {
        return await this._prisma.user.findUnique({
            where: {
                id
            }
        });
    }

    public async getUserByEmail(email: string) {
        return await this._prisma.user.findUnique({
            where: {
                email
            }
        });
    }

    public async getUserByUsername(username: string) {
        return await this._prisma.user.findUnique({
            where: {
                username
            }
        });
    }

    public async getUserByCpf(cpf: string): Promise<User | null> {
        return await this._prisma.user.findFirst({
            where: {
                cpf
            }
        });
    }

    public async replaceUserById(id: string, user: Prisma.UserCreateInput): Promise<User> {
        return await this._prisma.user.update({
            where: {
                id
            },
            data: user,
        });
    }

    public async existsAdmin(): Promise<boolean> {
        return await this._prisma.user.count({
            where: {
                privilege: "administrator"
            }
        }) > 0 ? true : false;
    }

}