import mongoose from "mongoose";

const pvideoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    friendsName: {
        type: String,
        required: true
    },
    region: {
        type: String,
        required: true
    },
    constituency: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
},
    
    { timestamps: true }
);

const PVideo = mongoose.model('PVideo', pvideoSchema);
//product

export default PVideo;