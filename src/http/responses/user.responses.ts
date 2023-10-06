import { User } from "@prisma/client"

export type CreateUserResponse = {
    user: User
}