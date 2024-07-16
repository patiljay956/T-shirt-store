import e from "express";
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "please provide product "],
            trim: true,
            maxlength: [
                120,
                "Product name should not be more than 120 characters",
            ],
        },
        price: {
            type: Number,
            required: [true, "please provide product "],
            maxlength: [5, "Product price should not be more than 5 digits"],
        },
        description: {
            type: String,
            required: [true, "please provide product "],
        },
        photos: [
            {
                id: {
                    type: String,
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                },
            },
        ],
        category: {
            type: String,
            required: [
                true,
                "please select category from short-sleeves, long-sleeves, sweat-shirts, hoodies ",
            ],
            enum: {
                values: [
                    "shortsleeves",
                    "longsleeves",
                    "sweatshirts",
                    "hoodies",
                ],
            },
        },

        brand: {
            type: String,
            required: [true, "please add a brand for Clothing "],
        },
        ratings: {
            type: Number,
            default: 0,
        },
        numberOfRevives: {
            type: Number,
            default: 0,
        },
        reviews: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                name: {
                    type: String,
                    required: [true, "please provide a Name "],
                    trim: true,
                },
                rating: {
                    type: Number,
                    required: [true, "please provide a Rating "],
                    enum: [1, 2, 3, 4, 5],
                },
                comment: {
                    type: String,
                    required: [true, "please provide a Comment "],
                },
            },
        ],
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
