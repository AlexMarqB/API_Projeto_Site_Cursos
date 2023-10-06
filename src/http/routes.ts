import { FastifyInstance } from "fastify";
import { usersRoutes } from "./routes/users.routes";
import { coursesRoutes } from "./routes/courses.routes";
import { modulesRoutes } from "./routes/modules.routes";
import { testsRoutes } from "./routes/tests.routes";
import { enrollmentsRoutes } from "./routes/enrollments.routes";
import { authenticateRoutes } from "./routes/authenticate.routes";

export async function appRoutes(app: FastifyInstance) {
    app.register(usersRoutes, { prefix: "users" });
    app.register(coursesRoutes, { prefix: "courses" });
    app.register(modulesRoutes, { prefix: "modules" });
    app.register(testsRoutes, { prefix: "tests" });
    app.register(enrollmentsRoutes, { prefix: "enrollments" })
    app.register(authenticateRoutes, { prefix: "session" });
}
