import expressJwt from 'express-jwt';
import config from '../configs/config.json';
import userService from '../users/user.service';
import User from '../users/user.model';

export default {
  jwt,
  isValid,
};

function jwt() {
  const secret = config.secret;
  return expressJwt({ secret, isRevoked }).unless({
    path: [
      // public routes that don't require authentication
      '/socket-io',
      '/api',
      '/api/users/authenticate',
      '/api/users/register',
      '/api/songs/playlist',
      /^\/api\/songs\/search\/.*/,
    ],
  });
}

async function isRevoked(req, payload, done) {
  const user = await userService.getById(payload.sub);
  // revoke token if user no longer exists
  if (!user) {
    return done(null, true);
  }
  done();
};

async function isValid(req) {
  const token = req.headers.authorization.split('Bearer ')[1];
  try {
    const user = await User.findOne({ token });
    if (user.token) {
      return user;
    }
  } catch (error) {
    return null;
  }
}
