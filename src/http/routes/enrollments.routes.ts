import { FastifyInstance } from "fastify";
import { createEnrollment, findEnrollmentsByStudentId } from "../controller/enrollments.controller";

export async function enrollmentsRoutes(router: FastifyInstance) {
    router.post("/enroll/:id", createEnrollment);
    router.get("/from/me", findEnrollmentsByStudentId);
}