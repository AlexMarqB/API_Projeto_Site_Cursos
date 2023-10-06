import 'dotenv/config'
import { ZodError, z } from 'zod'

const envSchema = z.object({
    NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
    PORT: z.coerce.number().default(3333),
    DATABASE_URL: z.string(),
    JWT_SECURITY_KEY: z.string(),
    SERVER_ENCRYPTION_KEY: z.string()
})

const _envSchema = envSchema.safeParse(process.env);

if (_envSchema.success == false) {
    console.error(`error on enviroment variables: ${_envSchema.error.format()}`);

    throw new ZodError(_envSchema.error.issues);
}

export const env = _envSchema.data;