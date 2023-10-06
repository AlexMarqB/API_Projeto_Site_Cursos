import { randomUUID } from "crypto";
import { CreateModulePrismaType } from "../../types/create-modules-prisma.types";
import { IModulesRepository } from "../i-modules-repository";
import { Module } from '@prisma/client'
export class InMemoryModulesRepository implements IModulesRepository {
    private modules: Module[];

    constructor() {
        this.modules = []
    }

    public async createModule(module: CreateModulePrismaType): Promise<Module> {
        return await new Promise(resolve => {
            const newModule: Module = {
                id: randomUUID(),
                name: module.name,
                description: module.description,
                courseId: module.courseId!
            };

            this.modules.push(newModule)
            resolve(newModule);
        })
    }

    public async getModuleByCourseIdAndName(courseId: string, name: string): Promise<Module | null> {
        return await new Promise(resolve => {
            const module = this.modules.find(module => module.courseId === courseId && module.name === name);
            resolve(module ? module : null);
        })
    }

    public async getModuleById(id: string): Promise<Module | null> {
        return await new Promise(resolve => {
            const module = this.modules.find(module => module.id === id);
            resolve(module ? module : null);
        })
    }

    public async getModulesByCourseId(courseId: string): Promise<Module[]> {
        return await new Promise(resolve => {
            const modules = this.modules.filter(module => module.courseId === courseId);
            resolve(modules);
        })
    }

    public async replaceModuleById(id: string, module: Module): Promise<void> {
        return await new Promise(resolve => {
            const indexOfModuleToReplace = this.modules.findIndex(module => module.id === id)
            module.id = id
            this.modules[indexOfModuleToReplace] = module;
            resolve();
        })
    }


}