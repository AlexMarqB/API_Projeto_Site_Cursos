import { FastifyInstance } from "fastify";
import { createCourse, deleteCourse, getAllCourses, getCourseById, updateCourse } from "../controller/courses.controller";

export async function coursesRoutes(router: FastifyInstance) {
    router.post("/new", createCourse);
    router.get("/:id", getCourseById);
    router.get("/list", getAllCourses);
    router.put("/update/:id", updateCourse);
    router.delete("/delete/:id", deleteCourse);
}