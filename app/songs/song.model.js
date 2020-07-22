import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const schema = new Schema({
  videoId: {
    type: String,
    trim: true,
    required: [true, 'videoId is required!'],
  },
  title: {
    type: String,
    trim: true,
    required: [true, 'title is required!'],
  },
  channelTitle: {
    type: String,
    required: [true, 'channelTitle is required!'],
  },
  addedUser: {
    type: String,
    required: [true, 'addedUser is required!'],
  },
  upvote: {
    type: Number,
    default: 0,
  },
  downvote: {
    type: Number,
    default: 0,
  },
  thumbnails: {
    type: String,
    trim: true,
  },
  dateAdd: {
    type: Date,
    default: Date.now,
  },
  duration: {
    type: Number,
  },
  startAt: {
    hour: {
      type: Number,
    },
    minute: {
      type: Number,
    },
    second: {
      type: Number,
    },
  },
});

schema.set('toJSON', { virtuals: true });

export default mongoose.model('Song', schema);
