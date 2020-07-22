import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const schema = new Schema({
  username: {
    type: String,
    unique: true,
    trim: true,
    required: [true, 'username is required!'],
  },
  password: {
    type: String,
    required: [true, 'password is required!'],
  },
  firstName: {
    type: String,
    trim: true,
    required: [true, 'firstName is required!'],
  },
  lastName: {
    type: String,
    trim: true,
    required: [true, 'lastName is required!'],
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: [true, 'email is required!'],
  },
  vote: {
    type: Number,
    default: 5,
  },
  songAdd: {
    type: Number,
    default: 1,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  token: {
    default: null,
    type: String,
  },
});

schema.set('toJSON', { virtuals: true });

export default mongoose.model('User', schema);
