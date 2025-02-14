import mongoose from "mongoose";
import Product from "../models/product.model.js";

// Helper function to add virtuals to product data
const formatProductWithVirtuals = (product) => ({
  ...product.toObject ? product.toObject() : product,
  timeRemaining: product.timeRemaining
});

export const getProducts = async (req, res) => {
    try {
      const products = await Product.find({}).sort({ createdAt: -1 });
      
      const formattedProducts = products.map(product => ({
        ...product.toObject(),
        timeRemaining: product.timeRemaining,
        status: product.status
      }));
  
      res.status(200).json({ success: true, data: formattedProducts });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  };

export const createProducts = async (req, res) => {
    const product = req.body;

    // Validate required fields
    if (!product.name || !product.price || !product.description || 
        !product.image || !product.startTime || !product.endTime) {
        return res.status(400).json({
            success: false,
            message: "Please provide all required fields",
        });
    }

    // Ensure endTime is after startTime 
    if (new Date(product.endTime) <= new Date(product.startTime)) {
        return res.status(400).json({
            success: false,
            message: "End time must be after start time.",
        });
    }

    const newProduct = new Product({
        name: product.name,
        price: product.price,
        description: product.description,
        image: product.image,
        startTime: product.startTime,
        endTime: product.endTime,
        status: "upcoming", // Default status
        bids: [], // Initialize empty bids array
        currentHighestBid: 0, // Initialize current highest bid
        winner: null, // No winner initially
    });

    try {
        await newProduct.save();
        res.status(201).json({ 
            success: true, 
            data: formatProductWithVirtuals(newProduct) 
        });
    } catch (error) {
        console.error("Error in creating product:", error.message);
        return res.status(500).json({ 
            success: false, 
            message: "Server Error" 
        });
    }
};

export const deleteProducts = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ 
            success: false, 
            message: "Invalid Product Id" 
        });
    }

    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ 
                success: false, 
                message: "Product not found" 
            });
        }
        res.status(200).json({ 
            success: true, 
            message: "Product Deleted" 
        });
    } catch (error) {
        console.error("Error in deleting product:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Server Error" 
        });
    }
};

export const updateProducts = async (req, res) => {
    const { id } = req.params;
    const product = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ 
            success: false, 
            message: "Invalid Product Id" 
        });
    }

    // Validate endTime > startTime if both are provided
    if (product.startTime && product.endTime && 
        new Date(product.endTime) <= new Date(product.startTime)) {
        return res.status(400).json({
            success: false,
            message: "End time must be after start time.",
        });
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: product }, // Update only the fields provided in the request
            { new: true, lean: true } // Return the updated document
        );

        if (!updatedProduct) {
            return res.status(404).json({ 
                success: false, 
                message: "Product not found" 
            });
        }

        res.status(200).json({ 
            success: true, 
            data: formatProductWithVirtuals(updatedProduct) 
        });
    } catch (error) {
        console.error("Error in updating product:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Server Error" 
        });
    }
};

export const placeBid = async (req, res) => {
    const { id } = req.params;
    const { bidder, amount } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ 
            success: false, 
            message: "Invalid Product Id" 
        });
    }

    try {
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: "Product not found" 
            });
        }

        // Check if the auction is active
        if (product.status !== "active") {
            return res.status(400).json({
                success: false,
                message: "Bids can only be placed on active auctions.",
            });
        }

        // Check if the bid amount is greater than the product's base price
        if (amount <= product.price) {
            return res.status(400).json({
                success: false,
                message: "Bid amount must be greater than base price.",
            });
        }

        // Check if the bid amount is higher than the current highest bid
        if (amount <= product.currentHighestBid) {
            return res.status(400).json({
                success: false,
                message: "Bid must be higher than current highest bid.",
            });
        }

        // Add the bid to the bids array
        product.bids.push({ bidder, amount });

        // Update the current highest bid
        product.currentHighestBid = amount;
        
        // Save the updated product
        await product.save();

        res.status(200).json({ 
            success: true, 
            data: formatProductWithVirtuals(product) 
        });
    } catch (error) {
        console.error("Error in placing bid:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Server Error" 
        });
    }
};