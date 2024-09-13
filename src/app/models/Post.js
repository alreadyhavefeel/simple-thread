import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const PostSchema = new Schema({
    name: String,
    note: { type: String, required: true },
    loves: Number,
    timestamp: Number,
  });

const Post = mongoose.model('Post', PostSchema);
export default Post;