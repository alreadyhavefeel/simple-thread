import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const ReplyPostSchema = new mongoose.Schema({
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    name: String,
    replyNote: { type: String, required: true },
    timestamp: Number
  });  

const ReplyPost = mongoose.model('ReplyPost', ReplyPostSchema);
export default ReplyPost;