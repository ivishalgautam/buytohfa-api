"use strict";
import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.post("/", {}, controller.create);
  fastify.get("/", {}, controller.get);
  fastify.put("/:id", {}, controller.updateById);
  fastify.put("/publish/:id", {}, controller.publishProductById);
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.get("/:slug", {}, controller.getBySlug);
  fastify.get("/getById/:id", {}, controller.getById);
}
