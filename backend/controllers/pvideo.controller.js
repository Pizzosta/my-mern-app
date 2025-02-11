import mongoose from "mongoose";
import PVideo from "../models/pvideo.model.js";

export const getPVideos = async (req, res) => {
    try {
        const pvideos = await PVideo.find({});
        res.status(200).json({ success: true, data: pvideos });
    } catch (error) {
        console.error("Error in fetching pvideo:", error.message);
        return res.status(500).json({ success: false, message: "Server Error" })
    }
};

export const createPVideos = async (req, res) => {
    const pvideo = req.body; // user will send this data

    if (!pvideo.name || !pvideo.friendsName || !pvideo.region || !pvideo.constituency || !pvideo.phone) {
        return res.status(400).json({ success: false, message: "Please provide all fields" });
    }

    const newPVideo = new PVideo({
        name: pvideo.name,
        friendsName: pvideo.friendsName,
        region: pvideo.region,
        constituency: pvideo.constituency,
        phone: pvideo.phone,
    }) // Explicitly pick only allowed fields to prevent malicious data

    try {
        await newPVideo.save();
        res.status(201).json({ success: true, data: newPVideo });
    } catch (error) {
        console.error("Error in Creating Personalized Video:", error.message);
        return res.status(500).json({ success: false, message: "Server Error" })
    }
};

export const deletePVideos = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: "Invalid PVideo Id" });
    }
    try {
        const deletePVideo = await PVideo.findByIdAndDelete(id);
        if (!deletePVideo) {
            return res.status(400).json({ success: false, message: "PVideo not found" });
        }
        res.status(200).json({ success: true, message: "PVidoe Deleted" });
    } catch (error) {
        console.error("Error in deleting pvideo:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    };
};

export const updatePVideos = async (req, res) => {
    const { id } = req.params;

    const pvideo = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid PVideo Id" });
    }
    try {
        const updatedPVideo = await PVideo.findByIdAndUpdate(id, pvideo, { new: true });
        if (!updatedPVideo) {
            return res.status(404).json({ success: false, message: "PVideo not found" });
        }
        res.status(200).json({ success: true, data: updatedPVideo });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    };
};