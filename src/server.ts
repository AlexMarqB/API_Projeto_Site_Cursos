import app from "./app";
import { env } from './env/index';

app.listen({
    host: "0.0.0.0",
    port: env.PORT
}).then(() => {
    console.log(`🚀 Server up and running\n📻 URL: http://localhost:${env.PORT}/`)
});