import songService from './song.service';
import jwt from '../helpers/jwt';
import { io } from '../server';
import httpStatus from 'http-status';

export default {
  addSong,
  searchSong,
  voteSong,
  getPlaylist,
};

async function addSong(req, res) {
  try {
    let user = await jwt.isValid(req);
    if (user) {
      let msg = await songService.addSong(req.body, user.username);
      io.sockets.emit('playlist', 'Successfully Added');
      return res.status(httpStatus.OK).json({ message: msg });
    }
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Invalid Token!',
    });
  } catch (error) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
  }
}

async function searchSong(req, res) {
  try {
    let msg = await songService.searchSong(req.params.query, req.query.page);
    return res.status(httpStatus.OK).json({ message: msg });
  } catch (error) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
  }
}

async function voteSong(req, res) { // upvote-downvote:true-false
  try {
    let user = await jwt.isValid(req);
    if (user) {
      let msg = await songService.voteSong(req.body, user.username);
      io.sockets.emit('playlist', 'Successfully Voted');
      return res.status(httpStatus.OK).json({ message: msg });
    }
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Invalid Token!',
    });
  } catch (error) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
  }
}

async function getPlaylist(req, res) { // upvote-downvote:true-false
  try {
    let msg = await songService.getPlaylist();
    return res.status(httpStatus.OK).json({ message: msg });
  } catch (error) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
  }
}

