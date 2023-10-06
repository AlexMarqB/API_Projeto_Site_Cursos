import { EPriveleges } from "@prisma/client"

export type TokenDTO = {
    id: string,
    password: string,
    privilege: EPriveleges;
}