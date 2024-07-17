const { Schema, model } = require("mongoose");

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    logs: {
        type: [Schema.Types.ObjectId],
        required: true,
        default: [],
    },
});

module.exports = model("User", userSchema);
