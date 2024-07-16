const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    log: {
        type: [
            {
                _id: false,
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
            },
        ],
        required: false,
    },
});

module.exports = mongoose.model("users", UserSchema);
