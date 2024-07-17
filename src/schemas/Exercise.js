const { Schema, model } = require("mongoose");

const exerciseSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        required: true,
        default: new Date(),
    },
});

module.exports = model("Exercise", exerciseSchema);
