import { $Enums, EPriveleges, Prisma, User } from "@prisma/client";
import { IUsersRepository } from "../i-users-repository";
import { randomUUID } from "crypto";

export class InMemoryUsersRepository implements IUsersRepository {
    private users: User[]

    constructor() {
        this.users = [];
    }

    public async createUser(user: Prisma.UserCreateInput): Promise<User> {
        return await new Promise((resolve, _) => {
            const newUser: User = {
                id: randomUUID(),
                email: user.email,
                username: user.username,
                password: user.password,
                cpf: user.cpf,
                firstName: user.firstName,
                lastName: user.lastName,
                issued: user.issued as Date,
                lastAccess: user.lastAccess as Date,
                privilege: user.privilege
            }

            this.users.push(newUser)
            resolve(newUser);
        });
    }

    public async deleteUser(id: string): Promise<void> {
        return await new Promise((resolve, _) => {
            const indexOfUserToDelete = this.users.findIndex(user => user.id == id);
            this.users.splice(indexOfUserToDelete);
            resolve();
        })
    }

    public async existsAdmin(): Promise<boolean> {
        return await new Promise((resolve, _) => {
            const existsAdmin = this.users.findIndex(user => user.privilege === EPriveleges.administrator) != -1
            resolve(existsAdmin);
        })
    }

    public async getUserById(id: string): Promise<User | null> {
        return await new Promise((resolve, _) => {
            const userFound = this.users.find((user) => user.id === id);
            resolve(userFound ? userFound : null);
        });
    }

    public async getUserByUsername(username: string): Promise<User | null> {
        return await new Promise((resolve, _) => {
            const userFound = this.users.find((user) => user.username === username);
            resolve(userFound ? userFound : null);
        });
    }

    public async getUserByEmail(email: string): Promise<User | null> {
        return await new Promise((resolve, _) => {
            const userFound = this.users.find((user) => user.email === email);
            resolve(userFound ? userFound : null);
        });
    }

    public async getUserByCpf(cpf: string): Promise<User | null> {
        return await new Promise((resolve, _) => {
            const userFound = this.users.find((user) => user.cpf === cpf);
            resolve(userFound ? userFound : null);
        });
    }

    public async replaceUserById(id: string, user: User): Promise<User> {
        return await new Promise((resolve, _) => {
            const indexOfUser = this.users.findIndex(user => user.id === id);
            user.id = id;
            this.users[indexOfUser] = user;
            resolve(user);
        });
    }

}