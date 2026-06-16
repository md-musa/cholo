import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
    {
        nfcUid: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Passenger",
            unique: true,
            sparse: true,
            default: null,
        },
        balance: {
            type: Number,
            default: 0,
            min: -100,
        },
        status: {
            type: String,
            enum: ["unissued", "active", "blocked", "expired"],
            default: "unissued",
        },
        issuedAt: {
            type: Date,
            default: null,
        },
        lastUsedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

cardSchema.index({ nfcUid: 1 });
cardSchema.index({ userId: 1 });

export const CardModel = mongoose.model("Card", cardSchema);