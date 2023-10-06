import { z } from "zod";
import { CourseServiceFactory } from "../../services/factories/course.service.factory";
import { FastifyReply, FastifyRequest } from "fastify";
import { BadRequestError } from "../../errors/bad-request";


const courseService = CourseServiceFactory.build();

const createCourseRequestSchema = z.object({
    name: z.string(),
    photo: z.string(),
    price: z.number()
}).required();

export async function createCourse(req: FastifyRequest, rep: FastifyReply) {
    const authorization = req.headers.authorization?.split(' ')[1];
    if (!authorization)
        throw new BadRequestError("Missing authorization");

    const createCourseRequest = createCourseRequestSchema.parse(req.body);

    const response = await courseService.createCourse(authorization, createCourseRequest);
    return rep.status(201).send({ id: response.id });
}

export async function getCourseById(req: FastifyRequest, rep: FastifyReply) {
    const { id } = req.params as { id?: string }
    if (!id)
        throw new BadRequestError("Missing id");

    const course = await courseService.getCourseById(id);
    return rep.status(200).send(course);
}

export async function getAllCourses(req: FastifyRequest, rep: FastifyReply) {
    const courses = await courseService.getAllCourses();
    return rep.status(200).send(courses);
}


const updateCourseRequestSchema = z.object({
    name: z.string(),
    photo: z.string(),
    price: z.number()
}).partial()
export async function updateCourse(req: FastifyRequest, rep: FastifyReply) {
    const authorization = req.headers.authorization?.split(' ')[1];
    if (!authorization)
        throw new BadRequestError("Missing authorization");

    const { id } = req.params as { id?: string };
    if (!id)
        throw new BadRequestError("Missing id");

    const updateCourseRequest = updateCourseRequestSchema.parse(req.body);

    await courseService.updateCourse(authorization, id, updateCourseRequest);
    return rep.status(200).send();
}

export async function deleteCourse(req: FastifyRequest, rep: FastifyReply) {
    const authorization = req.headers.authorization?.split(' ')[1];
    if (!authorization)
        throw new BadRequestError("Missing authorization");

    const { id } = req.params as { id?: string };
    if (!id)
        throw new BadRequestError("Missing id");

    await courseService.deleteCourse(authorization, id);
    return rep.status(200).send();
}