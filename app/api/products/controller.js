"use strict";
import constants from "../../lib/constants/index.js";
import table from "../../db/models.js";
import slugify from "slugify";

const create = async (req, res) => {
  try {
    let slug = slugify(req.body.title, { lower: true });
    req.body.slug = slug;
    const record = await table.ProductModel.getBySlug(req, slug);

    if (record)
      return res
        .code(constants.http.status.FORBIDDEN)
        .send({ message: "Product exist with this name!" });

    const product = await table.ProductModel.create(req);
    res.send(product);
  } catch (error) {
    console.error(error);
    res.code(constants.http.status.INTERNAL_SERVER_ERROR).send(error);
  }
};

const updateById = async (req, res) => {
  try {
    let slug = slugify(req.body.title, { lower: true });
    req.body.slug = slug;

    const record = await table.ProductModel.getById(req, req.params.id);

    if (!record) {
      return res
        .code(constants.http.status.NOT_FOUND)
        .send({ message: "Product not found!" });
    }

    const slugExist = await table.ProductModel.getBySlug(req, req.body.slug);

    // Check if there's another product with the same slug but a different ID
    if (slugExist && record?.id !== slugExist?.id)
      return res
        .code(constants.http.status.FORBIDDEN)
        .send({ message: "Product exist with this title!" });

    res.send(await table.ProductModel.updateById(req, req.params.id));
  } catch (error) {
    console.error(error);
    res.code(constants.http.status.INTERNAL_SERVER_ERROR).send(error);
  }
};

const getBySlug = async (req, res) => {
  try {
    let slug = slugify(req.body.title, { lower: true });
    req.body.slug = slug;

    const record = await table.ProductModel.getBySlug(req, req.params.slug);

    if (!record) {
      return res
        .code(constants.http.status.NOT_FOUND)
        .send({ message: "Product not found!" });
    }

    res.send(record);
  } catch (error) {
    console.error(error);
    res.code(constants.http.status.INTERNAL_SERVER_ERROR).send(error);
  }
};

const get = async (req, res) => {
  try {
    const products = await table.ProductModel.get(req);
    res.send(products);
  } catch (error) {
    console.error(error);
    res.code(constants.http.status.INTERNAL_SERVER_ERROR).send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.ProductModel.getById(req, req.params.id);

    if (!record)
      return res
        .code(constants.http.status.NOT_FOUND)
        .send({ message: "Product not found!" });

    await table.ProductModel.deleteById(req, req.params.id);
    res.send({ mesage: "Product deleted." });
  } catch (error) {
    console.error(error);
    res.code(constants.http.status.INTERNAL_SERVER_ERROR).send(error);
  }
};

export default {
  create: create,
  get: get,
  updateById: updateById,
  deleteById: deleteById,
  getBySlug: getBySlug,
};
