import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import jwt from './helpers/jwt';
import { errorHandler } from './helpers/error-handler';
import http from 'http';
import socketIO from 'socket.io';
import userRouter from './users/user.route';
import songRouter from './songs/song.route';
import dotenv from 'dotenv';
import httpStatus from 'http-status';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO.listen(server);


export { io };

import socketHandler from './sockets/socket-handler';

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// use JWT to secure the api
app.use(jwt.jwt());

// api routes
app.get('/api', (req, res) => {
  res.send({ msg: 'Hello! Server is up and running' });
});

app.use('/api/users', userRouter.router);
app.use('/api/songs', songRouter.router);

// catch all remaining routes
app.all('*', (req, res) => {
  res.status(httpStatus.NOT_FOUND).send({ msg: 'Not Found' });
});

// global error handler
app.use(errorHandler);

socketHandler.pingHeroku();
socketHandler.serverSchedule();
socketHandler.refreshDatabase();

// start server
const port = process.env.NODE_ENV === 'production' ?
  (process.env.PORT || 80) : 3000;
server.listen(port, function() {
  console.log('Server listening on port ' + port);
});

// handle socket connection to server
io.sockets.on('connection', async function connect(socket) {
  socketHandler.socketConnect(socket);
});
