import fastify from "fastify";
import { appRoutes } from "./http/routes";
import { ZodError } from "zod";
import { BaseError } from "./errors/base-error";
import { env } from "./env";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from '@fastify/cookie'

const app = fastify();

app.register(appRoutes);
app.register(fastifyCookie)
app.register(fastifyJwt, {
    secret: env.JWT_SECURITY_KEY,
    cookie: {
        cookieName: 'refreshToken',
        signed: false
    },
    sign: {
        expiresIn: '30s'
    }
})


app.setErrorHandler((err, _, rep) => {

    if (env.NODE_ENV !== "production") {
        console.log(err);
    }

    if (err instanceof ZodError) {
        return rep
            .status(400)
            .send(err.format());
    } else if (err instanceof BaseError) {
        return rep
            .status(err.status)
            .send({ message: err.message });
    } else {
        return rep
            .status(500)
            .send({ message: "Internal server error" });
    }
})
export default app;