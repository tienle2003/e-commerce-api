import Cart from "../models/cart.js";
import Product from "../models/product.js";
import asyncWrapper from "../utils/asyncWrapper.js";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const addToCart = asyncWrapper(async (req, res) => {
  const { userId } = req.user;
  const { productId, quantity } = req.body;
  const cartItem = await Cart.findOne({
    where: {
      user_id: userId,
      product_id: productId,
    },
  });
  if (cartItem) {
    cartItem.quantity += quantity;
    await cartItem.save();
  } else {
    await Cart.create({
      user_id: userId,
      product_id: productId,
      quantity,
    });
  }
  return res
    .status(StatusCodes.CREATED)
    .json({ message: "product is added to the cart successfully" });
});

const getCarts = asyncWrapper(async (req, res) => {
  const cartItems = await Cart.findAll({
    where: {
      user_id: req.user.userId,
    },
    include: [
      {
        model: Product,
        as: "product",
        attributes: ["name", "price", "color", "images"],
      },
    ],
    attributes: ["id", "quantity"],
  });
  if (cartItems.length === 0)
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "can not find any product in the cart"
    );
  return res.status(StatusCodes.OK).json({ data: cartItems });
});

const deleteCartById = asyncWrapper(async (req, res) => {
  await Cart.destroy({
    where: { id: req.params.cartId, user_id: req.user.userId },
  });
  return res.status(StatusCodes.OK).json({
    message: "product has been deleted from the cart successfully",
  });
});

export { addToCart, getCarts, deleteCartById };
