"use strict";
import constants from "../../lib/constants/index.js";
import table from "../../db/models.js";
import slugify from "slugify";

const { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } = constants.http.status;

const create = async (req, res) => {
  try {
    let slug = slugify(req.body.title, { lower: true });
    req.body.slug = slug;
    const record = await table.ProductModel.getBySlug(req, slug);

    if (record.length > 0)
      return res
        .code(BAD_REQUEST)
        .send({ message: "Product exist with this name!" });

    const product = await table.ProductModel.create(req);

    if (product && req.body?.variants?.length > 0) {
      for await (const variant of req.body?.variants) {
        req.body.slug = null;
        req.body.price = variant.price;
        req.body.variant_title = variant.name;
        req.body.discounted_price = variant.discounted_price;
        req.body.pictures = [variant.image_path];
        req.body.quantity = variant.quantity;
        req.body.sku_id = variant.sku_id;
        req.body.weight = variant.weight;
        await table.ProductModel.create(req, product?.id);
      }
    }
    res.send({ data: product });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const updateById = async (req, res) => {
  try {
    let slug = slugify(req.body.title, { lower: true });
    req.body.slug = slug;

    const record = await table.ProductModel.getById(req, req.params.id);

    if (!record) {
      return res.code(NOT_FOUND).send({ message: "Product not found!" });
    }

    const slugExist = await table.ProductModel.getBySlug(req, req.body.slug);

    // Check if there's another product with the same slug but a different ID
    if (slugExist && record?.id !== slugExist?.id)
      return res
        .code(BAD_REQUEST)
        .send({ message: "Product exist with this title!" });

    await table.ProductModel.updateById(req, req.params.id);

    if (req.body?.variants?.length > 0) {
      for await (const variant of req.body?.variants) {
        req.params.id = variant?.id;
        req.body.slug = null;
        req.body.price = variant.price;
        req.body.variant_title = variant.name;
        req.body.discounted_price = variant.discounted_price;
        req.body.pictures = [variant.image_path];
        req.body.quantity = variant.quantity;
        req.body.sku_id = variant.sku_id;
        req.body.weight = variant.weight;
        console.log({ body: req.body });

        await table.ProductModel.updateById(req, variant?.id);
      }
    }

    res.send({ message: "Product updated." });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const getBySlug = async (req, res) => {
  try {
    const record = await table.ProductModel.getVariantsBySlug(
      req,
      req.params.slug
    );

    if (!record) {
      return res.code(NOT_FOUND).send({ message: "Product not found!" });
    }

    res.send({ data: record });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.ProductModel.getById(req, req.params.id);

    if (!record) {
      return res.code(NOT_FOUND).send({ message: "Product not found!" });
    }

    res.send({ data: record });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const get = async (req, res) => {
  try {
    const products = await table.ProductModel.get(req);
    console.log({ products });
    res.send({ data: products });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.ProductModel.getById(req, req.params.id);

    if (!record)
      return res.code(NOT_FOUND).send({ message: "Product not found!" });

    await table.ProductModel.deleteById(req, req.params.id);
    res.send({ message: "Product deleted." });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const publishProductById = async (req, res) => {
  try {
    const record = await table.ProductModel.getById(req, req.params.id);

    if (!record)
      return res.code(NOT_FOUND).send({ message: "Product not found!" });

    const data = await table.ProductModel.publishProductById(
      req.params.id,
      req.body.is_published
    );

    console.log({ data });

    res.send({
      message: data?.is_published
        ? "Product published."
        : "Product unpublished.",
    });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

export default {
  create: create,
  get: get,
  updateById: updateById,
  deleteById: deleteById,
  getBySlug: getBySlug,
  getById: getById,
  publishProductById: publishProductById,
};
