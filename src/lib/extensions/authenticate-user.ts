import { verify } from "jsonwebtoken";
import { TokenDTO } from "../../http/model/token-dto";
import { IUsersRepository } from "../../repositories/i-users-repository";
import { env } from "../../env/index";
import { UnauthorizedError } from "../../errors/unauthorized-error";
import { ForbiddenError } from "../../errors/forbidden-error";
import { User } from "@prisma/client";

export async function authenticateUser(token: string, usersRepository: IUsersRepository): Promise<User> {
    const parsedToken = verify(token, env.JWT_SECURITY_KEY) as TokenDTO;

    const user = await usersRepository.getUserById(parsedToken.id);
    if (user == null)
        throw new UnauthorizedError("Could not authenticated user");

    if (parsedToken.password != user.password)
        throw new ForbiddenError("Access denied");

    return user;
}