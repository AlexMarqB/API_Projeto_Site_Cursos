import { Class } from "@prisma/client";
import { CreateClassPrismaType } from "../types/create-class-prisma.types";


export interface IClassRepository {
   createClass(cClass: CreateClassPrismaType) : Promise<Class>;
   getClassById(id: string): Promise<Class | null>;
   getAllClassesByModuleId(moduleId: string): Promise<Class[]>;
}