const Product = require("../models/Product");

// @desc    Fetch all products (with optional search, category filter, pagination)
// @route   GET /api/products?keyword=&category=&page=&limit=
// @access  Public
const getProducts = async (req, res) => {
    try {
        const pageSize = Number(req.query.limit) || 20;
        const page = Number(req.query.page) || 1;

        const filter = {};

        if (req.query.keyword) {
            filter.name = { $regex: req.query.keyword, $options: "i" };
        }

        if (req.query.category && req.query.category !== "All") {
            filter.category = req.query.category;
        }

        const count = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({
            products,
            page,
            pages: Math.ceil(count / pageSize),
            total: count,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            await product.deleteOne();
            res.json({ message: "Product removed" });
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const product = new Product({
            name: "Sample name",
            price: 0,
            user: req.user._id,
            images: [],
            category: "Necklaces",
            countInStock: 0,
            numReviews: 0,
            description: "Sample description",
            materials: "Sample materials",
            isHandmade: true
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    const {
        name,
        price,
        description,
        images,
        category,
        countInStock,
        materials,
        isHandmade
    } = req.body;

    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name !== undefined ? name : product.name;
            product.price = price !== undefined ? price : product.price;
            product.description = description !== undefined ? description : product.description;
            product.images = images !== undefined ? images : product.images;
            product.category = category !== undefined ? category : product.category;
            product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
            product.materials = materials !== undefined ? materials : product.materials;
            product.isHandmade = isHandmade !== undefined ? isHandmade : product.isHandmade;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.error("Update Product Error:", error.message);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: "Validation Error", errors: messages });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
    const { rating, comment } = req.body;

    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({ message: "You have already reviewed this product" });
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save();
        res.status(201).json({ message: "Review added" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getProducts,
    getProductById,
    deleteProduct,
    createProduct,
    updateProduct,
    createProductReview,
};
