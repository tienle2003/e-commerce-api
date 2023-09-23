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
    } else {
      const newCartItem = await Cart.create({
        user_id: userId,
        product_id: productId,
        quantity,
      });
      if (newCartItem)
        return res
          .status(201)
          .json({ message: "product is added to the cart successfully" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal server error!" });
  }
};

export { addToCart };
