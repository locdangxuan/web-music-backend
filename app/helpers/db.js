import config from '../configs/config.json';
import mongoose from 'mongoose';
import User from '../users/user.model';
import Song from '../songs/song.model';

mongoose.connect(config.connectionString, {
  useCreateIndex: true, useNewUrlParser: true,
});

export default {
  User,
  Song,
};
