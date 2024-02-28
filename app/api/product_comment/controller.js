"use strict";
import constants from "../../lib/constants/index.js";
import table from "../../db/models.js";

const { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } = constants.http.status;

const create = async (req, res) => {
  try {
    res.send(await table.ProductCommentModel.create(req));
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const getByProductId = async (req, res) => {
  try {
    const product = await table.ProductModel.getById(req, req.params.id);

    if (!product) {
      return res.code(NOT_FOUND).send({ message: "product not exist!" });
    }

    res.send(
      await table.ProductCommentModel.getByProductId(req, req.params.id)
    );
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.ProductCommentModel.getById(req, req.params.id);

    if (!record) {
      return res.code(NOT_FOUND).send({ message: "comment not exist!" });
    }

    res.send(await table.ProductCommentModel.deleteById(req, req.params.id));
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

export default {
  create: create,
  getByProductId: getByProductId,
  deleteById: deleteById,
};
