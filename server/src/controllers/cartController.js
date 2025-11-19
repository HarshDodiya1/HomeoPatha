const Cart = require("../models/Cart.js");
const Product = require("../models/Product.js");

/**
 * @desc Get user's cart
 * @route GET /api/cart
 * @access Private
 */
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: "items.product",
      select: "title images currentPrice oldPrice isActive category",
    });

    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalAmount: 0,
      });
    }

    // Filter out items with inactive products
    cart.items = cart.items.filter((item) => item.product && item.product.isActive);
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart retrieved successfully",
      code: "CART_RETRIEVED",
      data: { cart },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while retrieving cart",
      code: "CART_RETRIEVE_ERROR",
    });
  }
};

/**
 * @desc Add item to cart
 * @route POST /api/cart/items
 * @access Private
 */
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
        code: "PRODUCT_ID_REQUIRED",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
        code: "INVALID_QUANTITY",
      });
    }

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        code: "PRODUCT_NOT_FOUND",
      });
    }

    if (!product.isActive) {
      return res.status(400).json({
        success: false,
        message: "Product is not available",
        code: "PRODUCT_NOT_AVAILABLE",
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].priceAtTime = product.currentPrice;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        priceAtTime: product.currentPrice,
      });
    }

    await cart.save();

    // Populate and return updated cart
    await cart.populate({
      path: "items.product",
      select: "title images currentPrice oldPrice isActive category",
    });

    return res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      code: "ITEM_ADDED",
      data: { cart },
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while adding item to cart",
      code: "ADD_TO_CART_ERROR",
    });
  }
};

/**
 * @desc Update cart item quantity
 * @route PUT /api/cart/items/:productId
 * @access Private
 */
const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
        code: "INVALID_QUANTITY",
      });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
        code: "CART_NOT_FOUND",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
        code: "ITEM_NOT_FOUND",
      });
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "title images currentPrice oldPrice isActive category",
    });

    return res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      code: "ITEM_UPDATED",
      data: { cart },
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating cart item",
      code: "UPDATE_CART_ITEM_ERROR",
    });
  }
};

/**
 * @desc Remove item from cart
 * @route DELETE /api/cart/items/:productId
 * @access Private
 */
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
        code: "CART_NOT_FOUND",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
        code: "ITEM_NOT_FOUND",
      });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "title images currentPrice oldPrice isActive category",
    });

    return res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      code: "ITEM_REMOVED",
      data: { cart },
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while removing item from cart",
      code: "REMOVE_FROM_CART_ERROR",
    });
  }
};

/**
 * @desc Clear cart
 * @route DELETE /api/cart
 * @access Private
 */
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
        code: "CART_NOT_FOUND",
      });
    }

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      code: "CART_CLEARED",
      data: { cart },
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while clearing cart",
      code: "CLEAR_CART_ERROR",
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
