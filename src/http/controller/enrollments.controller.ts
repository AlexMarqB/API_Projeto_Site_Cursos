import { FastifyReply, FastifyRequest } from "fastify";
import { EnrollmentServiceFactory } from "../../services/factories/enrollment.service.factory";
import { BadRequestError } from "../../errors/bad-request";

const enrollmentService = EnrollmentServiceFactory.build();

export async function createEnrollment(req: FastifyRequest, rep: FastifyReply) {
    const authorization = req.headers.authorization?.split(' ')[1];
    if (!authorization)
        throw new BadRequestError("Missing authorization");

    const { id } = req.params as { id?: string };
    if (!id)
        throw new BadRequestError("Missing id");

    const enrollment = await enrollmentService.createEnrollment(authorization, id);
    return rep.status(201).send({ id: enrollment.id })
}

export async function findEnrollmentsByStudentId(req: FastifyRequest, rep: FastifyReply) {
    const authorization = req.headers.authorization?.split(' ')[1];
    if (!authorization)
        throw new BadRequestError("Missing authorization");

    const enrollments = await enrollmentService.findEnrollmentsByStudentId(authorization);
    return rep.status(200).send(enrollments);
}