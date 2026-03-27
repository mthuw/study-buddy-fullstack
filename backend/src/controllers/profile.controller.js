import { profilePost } from "../models/profile.model.js";

export const createProfilePost = async (req, res) =>{
    try {
        const {studyField, subjects, lookingFor, availability} = req.body;
        const UserID = req.session.UserID ?? req.body.UserID;
        const UserName = req.session.UserName ?? req.body.UserName;
        if (!UserID || !UserName || !studyField || !subjects || !lookingFor || !availability) {
            return res.status(400).json({error: "Fill in all required box"});
        }

        const profile = await profilePost.findOneAndUpdate(
            { UserID: Number(UserID) },                                          // filter
            { UserID: Number(UserID), UserName, studyField, subjects, lookingFor, availability }, // update
            { new: true, upsert: true }         
        )
        console.log("Session:", req.session);
        console.log("Body:", req.body);
        console.log("UserID:", UserID);
        console.log("UserName:", UserName);
        return res.status(201).json({ message: "Post created successfully!", profile });
        
    } catch (error) {
        console.error("Error creating profile post:", error);
        return res.status(500).json({ error: "Failed to create profile post" });
    }
};
export const getProfilePosts = async (req, res) => {
    try {
        const posts = await profilePost.find().sort({ created_At: -1 });
        return res.status(200).json(posts)
    } catch (error) {
        console.error("Error fetching profile posts:", error);
        return res.status(500).json({ error: "Failed to fetch posts" });
    }
}

