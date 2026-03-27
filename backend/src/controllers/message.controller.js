import { Message } from "../models/message.model";

export const createMessage = async(req, res) => {
    try {
        const { Channel_ID, UserID, Content } = req.body;
        if (!Channel_ID || !UserID || !Content) {
            return res.status(400).json({ error: "Channel_ID, UserID, and Content are required."});
        }
        const newMessage = new Message({
            Channel_ID,
            UserID,
            Content
        });
        await newMessage.save();
        return res.status(201).json({ message: "Message sent successfully!", data: newMessage });
    } catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({ error: "Failed to send message."});
    }
};

export const getMessageByChannel = async (req, res) => {
    try {
        const { Channel_ID } = req.params;
        const messages = await Message.find({ Channel_ID: Channel_ID}).sort({Time: -1});
        return res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({ error: "Failed to fetch messages." });
    }
};