import { Class, PrismaClient } from "@prisma/client";
import { IClassRepository } from "../i-class-repository";
import { CreateClassPrismaType } from "../../types/create-class-prisma.types";



export class PrismaClassRepository implements IClassRepository {
   private readonly _prisma: PrismaClient

   constructor(prismaClient: PrismaClient) {
      this._prisma = prismaClient
  }

  public async createClass(cClass: CreateClassPrismaType) {
      return await this._prisma.class.create({
         data: cClass
      })
  }

  public async getClassById(id: string): Promise<Class | null> {
   return await this._prisma.class.findUnique({
      where: {
          id
      }
  })
  }

  public async getAllClassesByModuleId(moduleId: string) {
   return await this._prisma.class.findMany({
      where: {
         moduleId
      }
   })
  }
}