import mongoose from "mongoose";

export const RecordSchema = new mongoose.Schema({
    title: String,
    cover: String,
    history:Object,
    author_name: String,
    author_mid: Number,
    view_at: Number,
    progress: Number,
    show_title: String,
    duration: Number,
});


export const RecordModel = mongoose.model('Record', RecordSchema);
