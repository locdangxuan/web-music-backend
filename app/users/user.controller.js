import userService from './user.service';
import { check, validationResult } from 'express-validator';
import httpStatus from 'http-status';
import db from '../helpers/db';

const User = db.User;

export default {
  authenticate,
  logout,
  register,
  getCurrent,
  getUserById,
  update,
  updatePassword,
  validate,
  checkExist,
};

async function authenticate(req, res) {
  try {
    let user = await userService.authenticate(req.body);
    if (user) {
      return res.status(httpStatus.OK).json({
        message: user,
      });
    }
    return res.status(httpStatus.UNAUTHORIZED).json({
      message: 'Username or password is incorrect',
    });
  } catch (error) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: error.message,
    });
  }
}

async function logout(req, res) {
  try {
    let msg = await userService.logout(req.body);
    return res.status(httpStatus.OK).json({
      message: msg,
    });
  } catch (error) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: error.message,
    });
  }
}

async function register(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
        errors: errors.array(),
      });
    }
    let msg = await userService.create(req.body);
    if (msg) {
      return res.status(httpStatus.CREATED).json({
        message: msg,
      });
    }
  } catch (error) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: error.message,
    });
  }
}

async function getCurrent(req, res) {
  try {
    let user = await userService.getById(req.user.sub);
    if (user) {
      return res.status(httpStatus.OK).json({
        message: user,
      });
    }
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Current user not found',
    });
  } catch (error) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: error.message,
    });
  }
}

async function getUserById(req, res) {
  try {
    let user = await userService.getById(req.params.id);
    if (user) {
      return res.status(httpStatus.OK).json({
        message: user,
      });
    }
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'User not found',
    });
  } catch (error) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: error.message,
    });
  }
}

async function update(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
        errors: errors.array(),
      });
    }
    const msg = await userService.update(req.body);
    return res.status(httpStatus.OK).json({
      message: msg,
    });
  } catch (error) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: error.message,
    });
  }
}

async function updatePassword(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(httpStatus.UNPROCESSABLE_ENTITY).json({
        errors: errors.array(),
      });
    }
    const msg = await userService.updatePassword(req.body);
    res.status(httpStatus.OK).json({
      message: msg,
    });
  } catch (error) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: error.message,
    });
  }
}

function validate(method) {
  switch (method) {
    case 'register': {
      return [
        check('username', 'Username minimum length is 8 characters')
          .exists()
          .isLength({ min: 8 }),
        check('email', 'Invalid email')
          .exists()
          .isEmail(),
        check('password', 'Password minimum length is 8 characters')
          .exists()
          .isLength({ min: 8 }),
      ];
    }
    case 'update': {
      return [
        check('username', 'Username minimum length is 8 characters')
          .optional()
          .isLength({ min: 8 }),
        check('email', 'Invalid email')
          .optional()
          .isEmail(),
      ];
    }
    case 'updatePassword': {
      return [
        check('newPassword', 'New password minimum length is 8 characters')
          .exists()
          .isLength({ min: 8 }),
        check('oldPassword', 'Old password must be correct')
          .exists()
          .isLength({ min: 8 }),
      ];
    }
  }
}

async function checkExist(req, res, next) {
  const checkString = JSON.stringify({
    username: req.body.username,
    password: req.body.password,
  });
  if (/\s/.test(checkString)) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Input contains white space!',
    });
  }
  let existUser = await User.findOne({ username: req.body.username });
  if (existUser) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Username ' + req.body.username + ' is already taken!',
    });
  }
  existUser = await User.findOne({ email: req.body.email });
  if (existUser) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Email ' + req.body.email + ' is already taken!',
    });
  }
  return next();
}
