"use strict";
import constants from "../../lib/constants/index.js";
import table from "../../db/models.js";
import slugify from "slugify";

const create = async (req, res) => {
  try {
    let slug = slugify(req.body.slug, { lower: true });
    req.body.slug = slug;
    const record = await table.ProductAttributeTermModel.getBySlug(req, slug);

    if (record)
      return res
        .code(constants.http.status.BAD_REQUEST)
        .send({ message: "Term exist with this slug!" });

    const product = await table.ProductAttributeTermModel.create(req);
    res.send(product);
  } catch (error) {
    console.error(error);
    res.code(constants.http.status.INTERNAL_SERVER_ERROR).send(error);
  }
};

const updateById = async (req, res) => {
  try {
    let slug = slugify(req.body.slug, { lower: true });
    req.body.slug = slug;

    const record = await table.ProductAttributeTermModel.getById(
      req,
      req.params.id
    );

    if (!record) {
      return res
        .code(constants.http.status.NOT_FOUND)
        .send({ message: "Term not found!" });
    }

    const slugExist = await table.ProductAttributeTermModel.getBySlug(
      req,
      req.body.slug
    );

    // Check if there's another Product with the same slug but a different ID
    if (slugExist && record?.id !== slugExist?.id)
      return res
        .code(constants.http.status.BAD_REQUEST)
        .send({ message: "Term exist with this slug!" });

    res.send(await table.ProductAttributeTermModel.update(req, req.params.id));
  } catch (error) {
    console.error(error);
    res.code(constants.http.status.INTERNAL_SERVER_ERROR).send(error);
  }
};

const getBySlug = async (req, res) => {
  try {
    let slug = slugify(req.body.title, { lower: true });
    req.body.slug = slug;

    const record = await table.ProductAttributeTermModel.getBySlug(
      req,
      req.params.slug
    );

    if (!record) {
      return res
        .code(constants.http.status.NOT_FOUND)
        .send({ message: "Term not found!" });
    }

    res.send(await table.ProductAttributeTermModel.getById(req, req.params.id));
  } catch (error) {
    console.error(error);
    res.code(constants.http.status.INTERNAL_SERVER_ERROR).send(error);
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.ProductAttributeTermModel.getById(
      req,
      req.params.id
    );

    if (!record) {
      return res
        .code(constants.http.status.NOT_FOUND)
        .send({ message: "Term not found!" });
    }

    res.send(record);
  } catch (error) {
    console.error(error);
    res.code(constants.http.status.INTERNAL_SERVER_ERROR).send(error);
  }
};

const getByAttributeId = async (req, res) => {
  try {
    const record = await table.ProductAttributeTermModel.getByAttributeId(
      req,
      req.params.id
    );

    if (!record) {
      return res.send([]);
    }

    res.send(record);
  } catch (error) {
    console.error(error);
    res.code(constants.http.status.INTERNAL_SERVER_ERROR).send(error);
  }
};

const get = async (req, res) => {
  try {
    const products = await table.ProductAttributeTermModel.get(req);
    res.send(products);
  } catch (error) {
    console.error(error);
    res.code(constants.http.status.INTERNAL_SERVER_ERROR).send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.ProductAttributeTermModel.getById(
      req,
      req.params.id
    );

    if (!record)
      return res
        .code(constants.http.status.NOT_FOUND)
        .send({ message: "Term not found!" });

    await table.ProductAttributeTermModel.deleteById(req, req.params.id);
    res.send({ mesage: "Term deleted." });
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
  getById: getById,
  getByAttributeId: getByAttributeId,
};
