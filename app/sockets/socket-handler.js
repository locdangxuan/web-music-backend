import dotenv from 'dotenv';
import apiDisabler from '../helpers/api-disabler';
import cron from 'node-schedule';
import songService from '../songs/song.service';
import userService from '../songs/song.service';
import http from 'http';
import { io } from '../server';

dotenv.config();
let currentSong;
let scheduleTime = [];
let playlist = [];
let endTime;

export default {
  serverSchedule,
  refreshDatabase,
  pingHeroku,
  socketConnect,
};

function serverSchedule() {
  // scheduleTime[0] : start scheduling everything at 17:29
  scheduleTime[0] = new cron.RecurrenceRule();
  scheduleTime[0].hour = parseInt(process.env.scheduleHour, 10);
  scheduleTime[0].minute = parseInt(process.env.scheduleMinute, 10);
  scheduleTime[0].second = parseInt(process.env.scheduleSecond, 10);
  // schedule the playlist at 17:30 pm then lock all api calls and functions
  cron.scheduleJob(scheduleTime[0], async function lock() {
    await scheduleEachSong();
    emitEachSong();
  });
}

async function scheduleEachSong() {
  
  // the playlist start at 17:30:00 pm
  scheduleTime[0].second += 5;
  let remainingTime = 23400; // from 17:30 till 23:59 in second
  playlist = (await songService.getPlaylist());
  // loop and calculate schedule time for songs in the list
  for (let i = 1; i <= playlist.length; i++) {
    if (remainingTime - playlist[i - 1].duration <= 0) {
      break;
    }
    const duration = playlist[i - 1].duration;
    const hour = (duration / 3600 | 0);
    const minute = ((duration - 3600 * hour) / 60 | 0);
    const sec = duration - 3600 * hour - 60 * minute;
    scheduleTime[i] = new cron.RecurrenceRule();
    scheduleTime[i].hour = scheduleTime[i - 1].hour + hour;
    scheduleTime[i].minute = scheduleTime[i - 1].minute + minute;
    scheduleTime[i].second = scheduleTime[i - 1].second + sec;
    if (scheduleTime[i].second >= 60) {
      scheduleTime[i].second = scheduleTime[i].second % 60;
      scheduleTime[i].minute += 1;
    }
    if (scheduleTime[i].minute >= 60) {
      scheduleTime[i].minute = scheduleTime[i].minute % 60;
      scheduleTime[i].hour += 1;
    }
    playlist[i - 1].startAt = {
      hour: scheduleTime[i - 1].hour,
      minute: scheduleTime[i - 1].minute,
      second: scheduleTime[i - 1].second,
    };
    remainingTime -= playlist[i - 1].duration;
  }
}

function emitEachSong() {
  // schedule each song
  scheduleTime.slice(0, scheduleTime.length - 2).map((item, index) => {
    cron.scheduleJob(item, function current() {
      currentSong = playlist[index];
      io.sockets.emit('play', playlist[index]);
    });
  });
  endTime = scheduleTime[scheduleTime.length - 1];
  // schedule an anouncement when the playlist is finished
  cron.scheduleJob(endTime, function reset() {
    io.sockets.emit('end', 'Finished playing videos!');
  });
}

function refreshDatabase() {
  // schedule to reset everything at 12:00 am
  const rule = new cron.RecurrenceRule();
  rule.hour = 23;
  rule.minute = 59;
  rule.second = 59;
  cron.scheduleJob(rule, function reset() {
    io.sockets.emit('end', 'Finished playing videos!');
    userService.reset();
    songService.reset();
  });
}

function pingHeroku() {
  setInterval(function() {
    http.get(process.env.PING_URL);
  }, 1740000);
}

function socketConnect(socket) {
  // handle users that enter the app after 17:30 pm
  if (apiDisabler.isAfter(
    scheduleTime[0].hour,
    scheduleTime[0].minute,
    scheduleTime[0].second)) {
    if (apiDisabler.isAfter(endTime.hour, endTime.minute, endTime.second)) {
      socket.emit('end', 'Finished playing videos!');
    } else {
      socket.emit('play', currentSong);
    }
  }
}
