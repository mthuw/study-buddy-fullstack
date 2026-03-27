import mongoose from "mongoose";
const Schema = mongoose;

const channelSchema = new Schema({
    channelName: {
        type: String,
        required: true
    },
    description: {
        type: String, 
        required: true
    }
})

export const Channel = mongoose.model("Channel", channelSchema);