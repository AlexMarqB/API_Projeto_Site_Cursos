import { Course, Module } from "@prisma/client";
import { CreateModulePrismaType } from "../types/create-modules-prisma.types";

export interface IModulesRepository {
    createModule(module: CreateModulePrismaType): Promise<Module>;
    getModuleById(id: string): Promise<Module | null>;
    getModuleByCourseIdAndName(courseId: string, name: string): Promise<Module | null>
    getModulesByCourseId(courseId: string): Promise<Module[]>;
    replaceModuleById(id: string, module: Module): Promise<void>;
}