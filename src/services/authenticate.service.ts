import { compare } from "bcrypt";
import { NotFoundError } from "../errors/not-found-error";
import { PrismaUsersRepository } from "../repositories/prisma/prisma-users-repository";
import { ConflictError } from "../errors/conflict-error";
import { AuthenticateServiceRequest } from "../http/requests/login.request";
import { User } from "@prisma/client";

export class AuthenticatedService{
   constructor(private userRepository: PrismaUsersRepository){}
   async execute({email, password}: AuthenticateServiceRequest) : Promise<{user: User}> {
      const user = await this.userRepository.getUserByEmail(email)

      if(!user){
         throw new NotFoundError('Not able to find user')
      }

      const doPasswordMatch = await compare(password, user.password)

      if(!doPasswordMatch) {
         throw new ConflictError('Passwords do not match')
      }

      return {
         user
      }
   }
}