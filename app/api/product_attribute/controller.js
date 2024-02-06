"use strict";
import constants from "../../lib/constants/index.js";
import table from "../../db/models.js";
import slugify from "slugify";

const create = async (req, res) => {
  console.log(req.body);
  try {
    let slug = slugify(req.body.slug, { lower: true });
    req.body.slug = slug;
    const record = await table.ProductAttributeModel.getBySlug(req, slug);

    if (record)
      return res
        .code(constants.http.status.BAD_REQUEST)
        .send({ message: "Attribute exist with this slug!" });

    const product = await table.ProductAttributeModel.create(req);
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

    const record = await table.ProductAttributeModel.getById(
      req,
      req.params.id
    );

    if (!record) {
      return res
        .code(constants.http.status.NOT_FOUND)
        .send({ message: "Attribute not found!" });
    }

    const slugExist = await table.ProductAttributeModel.getBySlug(
      req,
      req.body.slug
    );

    // Check if there's another Product with the same slug but a different ID
    if (slugExist && record?.id !== slugExist?.id)
      return res
        .code(constants.http.status.BAD_REQUEST)
        .send({ message: "Attribute exist with this slug!" });

    res.send(await table.ProductAttributeModel.update(req, req.params.id));
  } catch (error) {
    console.error(error);
    res.code(constants.http.status.INTERNAL_SERVER_ERROR).send(error);
  }
};

const getBySlug = async (req, res) => {
  try {
    let slug = slugify(req.body.title, { lower: true });
    req.body.slug = slug;

    const record = await table.ProductAttributeModel.getBySlug(
      req,
      req.params.slug
    );

    if (!record) {
      return res
        .code(constants.http.status.NOT_FOUND)
        .send({ message: "Attribute not found!" });
    }

    res.send(await table.ProductAttributeModel.getById(req, req.params.id));
  } catch (error) {
    console.error(error);
    res.code(constants.http.status.INTERNAL_SERVER_ERROR).send(error);
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.ProductAttributeModel.getById(
      req,
      req.params.id
    );

    if (!record) {
      return res
        .code(constants.http.status.NOT_FOUND)
        .send({ message: "Attribute not found!" });
    }

    res.send(record);
  } catch (error) {
    console.error(error);
    res.code(constants.http.status.INTERNAL_SERVER_ERROR).send(error);
  }
};

const get = async (req, res) => {
  try {
    const products = await table.ProductAttributeModel.get(req);
    res.send(products);
  } catch (error) {
    console.error(error);
    res.code(constants.http.status.INTERNAL_SERVER_ERROR).send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.ProductAttributeModel.getById(
      req,
      req.params.id
    );

    if (!record)
      return res
        .code(constants.http.status.NOT_FOUND)
        .send({ message: "Attribute not found!" });

    await table.ProductAttributeModel.deleteById(req, req.params.id);
    res.send({ mesage: "Attribute deleted." });
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
};
