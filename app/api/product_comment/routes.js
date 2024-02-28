"use strict";
import controller from "./controller.js";
import jwtVerify from "../../helpers/auth.js";

export default async function routes(fastify, options) {
  fastify.post("/", {}, controller.create);
  fastify.get("/:id", {}, controller.getByProductId);
  fastify.delete("/:id", {}, controller.deleteById);
}
