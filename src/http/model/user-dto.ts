import { EPriveleges } from "@prisma/client"

export type UserDTO = {
    id: string,
    username: string,
    firstName: string,
    lastName: string,
    privilege: EPriveleges
}