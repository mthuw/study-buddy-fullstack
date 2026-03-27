import mongoose from 'mongoose';
const {Schema} = mongoose;

const messageSchema = new Schema({
    Channel_ID: { 
        type: Schema.Types.ObjectId, 
        ref: 'Channel', 
        required: true 
    },
    UserID: { 
        type: Number, 
        required: true 
    },
    Content: { 
        type: String, 
        required: true 
    },
    Time: { 
        type: Date, 
        default: Date.now 
    }
});

export const Message = mongoose.model('Message', messageSchema);