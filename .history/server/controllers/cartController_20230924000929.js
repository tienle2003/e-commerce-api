import Cart from "../models/cart.js";

const addToCart = async (req, res) => {
  const { userId } = req.user;
  const { productId, quantity } = req.body;
  try {
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
      .status(201)
      .json({ message: "product is added to the cart successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error!" });
  }
};

const getCartsById = async (req, res) => {
  const { userId } = req.user;
  try {
    const cartItems = await Cart.findAll({
      where: {
        user_id: userId,
      },
    });
    if (cartItems.length === 0)
      return res
        .status(404)
        .json({ message: "can not find any product in the cart" });
    return res.status(200).json({data: cartItems})
  } catch (error) {}
};

export { addToCart };