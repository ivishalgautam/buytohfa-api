import productRoutes from "../../api/products/routes.js";
import categoryRoutes from "../../api/categories/routes.js";
import userRoutes from "../../api/users/routes.js";

export default async function routes(fastify, options) {
  //   fastify.addHook("onRequest", jwtVerify.verifyToken);
  fastify.register(userRoutes, { prefix: "users" });
  fastify.register(productRoutes, { prefix: "products" });
  fastify.register(categoryRoutes, { prefix: "categories" });
}
