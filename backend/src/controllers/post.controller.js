import { Post } from "../models/post.model.js";

export const createPost = async (req, res) =>{
    try {
        const { UserID, content} = req.body;

        if (!UserID || !content) {
            return res.status(400).json({error: "userID and content are required."})
        }
        const newPost = new Post({
            UserID,
            content
        });
        await newPost.save();
        return res.status(201).json({ message: "Post created successfully!", post: newPost });
        
    } catch (error) {
        console.error("Error creating post:", error);
        return res.status(500).json({ error: "Failed to create post" });
    }
};
export const getPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ created_At: -1 });
        return res.status(200).json(posts)
    } catch (error) {
        console.error("Error fetching posts:", error);
        return res.status(500).json({ error: "Failed to fetch posts" });
    }
}