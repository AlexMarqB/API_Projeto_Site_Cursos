import { IModulesRepository } from "../i-modules-repository";
import { PrismaClient, Module } from "@prisma/client";
import { CreateModulePrismaType } from "../../types/create-modules-prisma.types";

export class PrismaModulesRepository implements IModulesRepository {
    private readonly _prisma: PrismaClient

    constructor(prismaClient: PrismaClient) {
        this._prisma = prismaClient;
    }

    public async createModule(module: CreateModulePrismaType): Promise<Module> {
        return await this._prisma.module.create({
            data: module
        });
    }

    public async getModuleByCourseIdAndName(courseId: string, name: string): Promise<Module | null> {
        return await this._prisma.module.findFirst({
            where: {
                courseId,
                name
            }
        })
    }

    public async getModuleById(id: string): Promise<Module | null> {
        return await this._prisma.module.findUnique({
            where: {
                id
            }
        });
    }

    public async getModulesByCourseId(courseId: string): Promise<Module[]> {
        return await this._prisma.module.findMany({
            where: {
                courseId
            }
        })
    }

    public async replaceModuleById(id: string, module: Module): Promise<void> {
        await this._prisma.module.update({
            where: {
                id: id
            },
            data: module
        });
    }

}