import { FastifyReply, FastifyRequest } from "fastify";
import { UserServiceFactory } from "../../services/factories/user.service.factory";
import { z } from "zod";
import { BadRequestError } from "../../errors/bad-request";

const userService = UserServiceFactory.build();

const adminRequest = z.object({
    cpf: z.string(),
    email: z.string().email("E-mail must be valid"),
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    password: z.string(),
}).required();

const createAdminSchema = z.object({
    admin: adminRequest,
    token: z.string().optional()
})
export async function createAdmin(req: FastifyRequest, rep: FastifyReply) {
    const authorization = req.headers.authorization?.split(' ')[1];

    const unifiedCreateAdminRequest = { ...req.body as {}, token: authorization }
    const createAdminRequest = createAdminSchema.parse(unifiedCreateAdminRequest);

    await userService.createAdminstrator(createAdminRequest);

    return rep.status(201).send();
}


const createStudentRequestSchema = z.object({
    username: z.string(),
    password: z.string(),
    cpf: z.string(),
    email: z.string().email("E-mail must be valid"),
    firstName: z.string(),
    lastName: z.string()
}).required()
export async function createStudent(req: FastifyRequest, rep: FastifyReply) {
    const createStudentRequest = createStudentRequestSchema.parse(req.body);

    await userService.createStudent(createStudentRequest);

    return rep.status(201).send();
}


const loginUserRequestSchema = z.object({
    email: z.string().email("E-mail must be valid"),
    password: z.string()
}).required()
export async function loginUser(req: FastifyRequest, rep: FastifyReply) {
    const loginUserRequest = loginUserRequestSchema.parse(req.body);

    const response = await userService.loginUser(loginUserRequest);
    return rep.status(200).send(response);
}


export async function getMe(req: FastifyRequest, rep: FastifyReply) {
    const authorization = req.headers.authorization?.split(' ')[1];
    if (!authorization)
        throw new BadRequestError("Missing authorization");

    const response = await userService.getMe(authorization);
    return rep.status(200).send(response);
}


const updateUserRequestSchema = z.object({
    email: z.string().email("E-mail must be valid"),
    username: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    password: z.string()
}).required()
export async function updateUser(req: FastifyRequest, rep: FastifyReply) {
    const authorization = req.headers.authorization?.split(' ')[1];
    if (!authorization)
        throw new BadRequestError("Missing authorization");

    const updateUserRequest = updateUserRequestSchema.parse(req.body);

    const response = await userService.updateUser(authorization, updateUserRequest);
    return rep.status(200).send(response);

}

export async function deleteUser(req: FastifyRequest, rep: FastifyReply) {
    const authorization = req.headers.authorization?.split(' ')[1];
    if (!authorization)
        throw new BadRequestError("Missing authorization");

    await userService.deleteUser(authorization);
    return rep.status(200).send();
}