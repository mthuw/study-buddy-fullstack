import mongoose from "mongoose";
const { Schema } = mongoose;

const profileSchema = new Schema({
    UserID:{
        type: Number,
        required: true
    },
    UserName:{
        type: String,
        required: true
    },
    studyField:{
        type: String,
        required: true,
    },
    subjects: {
        type: String,
        required: true
    },
    lookingFor:{
        type: String,
        required: true
    },
    availability: {
        type: String,
        required: true
    },
    created_At:{
        type: Date,
        default: Date.now
    }
})

export const profilePost = mongoose.model('profilePost', profileSchema);