import app from "./server"
import fastifyStatic from "@fastify/static";
import * as url from 'url';

app.register(fastifyStatic, {
  root: __dirname,
});

app.listen({port: 3000}).then(port =>
  console.log("server listening at", port)
);
