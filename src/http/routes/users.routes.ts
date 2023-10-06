import { FastifyInstance } from "fastify";
import { createAdmin, createStudent, deleteUser, getMe, loginUser, updateUser } from "../controller/users.controllers";

export async function usersRoutes(router: FastifyInstance) {
    router.post("/admin/new", createAdmin);
    router.post("/student/new", createStudent);
    router.post("/login", loginUser);
    router.post("/me", getMe);
    router.put("/update", updateUser);
    router.delete("/delete", deleteUser);
}