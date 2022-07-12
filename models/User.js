import mongoose from "mongoose";

const UserScheme = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "Basic",
        required: true,
    }
}, {
    timestamps: true,
});

export default  mongoose.model('User', UserScheme);