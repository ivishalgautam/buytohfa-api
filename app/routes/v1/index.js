import jwtVerify from "../../helpers/auth.js";
import userRoutes from "../../api/users/routes.js";
import productRoutes from "../../api/products/routes.js";
import categoryRoutes from "../../api/categories/routes.js";
import attributeRoutes from "../../api/product_attribute/routes.js";
import attributeTermsRoutes from "../../api/product_attribute_term/routes.js";
import productComments from "../../api/product_comment/routes.js";
import banners from "../../api/banner/routes.js";

export default async function routes(fastify, options) {
  fastify.addHook("onRequest", jwtVerify.verifyToken);
  fastify.register(userRoutes, { prefix: "users" });
  fastify.register(productRoutes, { prefix: "products" });
  fastify.register(categoryRoutes, { prefix: "categories" });
  fastify.register(attributeRoutes, { prefix: "product-attributes" });
  fastify.register(attributeTermsRoutes, { prefix: "product-attribute-terms" });
  fastify.register(productComments, { prefix: "comments" });
  fastify.register(banners, { prefix: "banners" });
}
