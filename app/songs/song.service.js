import config from '../configs/config.json';
import mongoose from 'mongoose';
import { google } from 'googleapis';
import db from '../helpers/db';
const Song = db.Song;
const User = db.User;

export default {
  addSong,
  searchSong,
  voteSong,
  getPlaylist,
  reset,
};

async function addSong({ id }, username) {
  const user = await User.findOne({ username });
  if (user.songAdd === 0) {
    throw new Error('Already used Add function!');
  }
  let service = google.youtube('v3');
  try {
    const searchResults = await service.videos.list({
      auth: config.API_KEY,
      part: 'snippet, contentDetails',
      id: id,
    });
    let videoItem = searchResults.data.items[0];
    if (videoItem.length === 0) {
      return 'No video found!';
    }
    let song = new Song({
      videoId: videoItem.id,
      title: videoItem.snippet.title,
      channelTitle: videoItem.snippet.channelTitle,
      thumbnails: videoItem.snippet.thumbnails.medium.url,
      duration: convertTime(videoItem.contentDetails.duration),
      addedUser: username,
    });
    await song.save();
    user.songAdd = 0;
    await user.save();
    return 'Successfully Added!';
  } catch (error) {
    throw error;
  }
}

async function searchSong(query, nextPage) {
  let service = google.youtube('v3');
  try {
    const searchResults = await service.search.list({
      auth: config.API_KEY,
      part: 'snippet',
      type: 'video',
      videoEmbeddable: true,
      maxResults: 10,
      videoCategoryId: '10',
      q: query,
      pageToken: nextPage,
    });
    let videolist = searchResults.data.items;
    if (videolist.length === 0) {
      return 'No video found!';
    }
    const filteredListVideo = await filterResult(videolist);
    return {
      nextPage: searchResults.data.nextPageToken,
      previousPage: searchResults.data.prevPageToken,
      data: filteredListVideo,
    };
  } catch (error) {
    throw error;
  }
}

async function voteSong({ video_id, isUpvote }, username) {
  // video_id : id in DB, not in Youtube
  mongoose.set('useFindAndModify', false);
  const votingUser = await User.findOne({ username });
  if (votingUser.vote > 0) {
    await Song.findOneAndUpdate({
      _id: mongoose.Types.ObjectId(video_id),
    },
    {
      $inc: isUpvote === true ? { upvote: 1 } : { downvote: 1 },
    });
    await User.findOneAndUpdate({ username: username }, { $inc: { vote: -1 } });
    return 'Successfully voted!';
  }
  throw new Error('Out of vote!');
}

async function getPlaylist() {
  const playList = await Song.find({});
  playList.sort(function descendingVote(song1, song2) {
    return (song2.upvote - song2.downvote) - (song1.upvote - song1.downvote);
  });
  if (playList.length > 0) {
    return playList;
  }
  throw new Error('There is no song in the play list now!');
}

async function reset() {
  await Song.deleteMany({});
  return 'Successfully Reset Song!';
}

function filterResult(videolist) {
  let filteredList = videolist.map(item => {
    return {
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnails: item.snippet.thumbnails.medium.url,
    };
  });
  return filteredList;
}

function convertTime(duration) { // convert youtube duration format
  // return an array that match the regex (sequential digits).
  let hmsArray = duration.match(/\d+/g);
  // indexOf >= 0 : found
  // indexOf == -1 : not found
  if (duration.indexOf('M') >= 0 &&
    duration.indexOf('H') === -1 &&
    duration.indexOf('S') === -1) {
    hmsArray = [0, hmsArray[0], 0];
  }

  if (duration.indexOf('H') >= 0 &&
    duration.indexOf('M') === -1) {
    hmsArray = [hmsArray[0], 0, hmsArray[1]];
  }
  if (duration.indexOf('H') >= 0 &&
    duration.indexOf('M') === -1 &&
    duration.indexOf('S') === -1) {
    hmsArray = [hmsArray[0], 0, 0];
  }

  duration = 0;

  if (hmsArray.length === 3) {
    duration = duration + parseInt(hmsArray[0], 10) * 3600;
    duration = duration + parseInt(hmsArray[1], 10) * 60;
    duration = duration + parseInt(hmsArray[2], 10);
  }

  if (hmsArray.length === 2) {
    duration = duration + parseInt(hmsArray[0], 10) * 60;
    duration = duration + parseInt(hmsArray[1], 10);
  }

  if (hmsArray.length === 1) {
    duration = duration + parseInt(hmsArray[0], 10);
  }

  return duration;
}
