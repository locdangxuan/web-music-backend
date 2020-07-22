import config from '../configs/config.json';
import jwt from 'jsonwebtoken';
import db from '../helpers/db';
import bcrypt from 'bcryptjs';
const User = db.User;

export default {
  authenticate,
  logout,
  getById,
  create,
  update,
  updatePassword,
  reset,
};

async function authenticate({ username, password }) {
  const user = await User.findOne({ username });
  if (user && bcrypt.compareSync(password, user.password)) {
    // eslint-disable-next-line
    const { password, ...userWithoutHash } = user.toObject();
    const token = jwt.sign({ sub: user.id },
      config.secret,
      { expiresIn: '1d' });
    userWithoutHash.token = token;
    user.token = token;
    await user.save();
    return {
      ...userWithoutHash,
    };
  }
}

async function logout({ username }) {
  const user = await User.findOne({ username });
  user.token = null;
  await user.save();
  return 'Successfully Logout';
}

async function getById(id) {
  return await User.findById(id).select('-password');
}

async function create(userParam) {
  const user = new User(userParam);
  // hash password
  if (userParam.password) {
    user.password = bcrypt.hashSync(userParam.password, 10);
  }
  // save user
  await user.save();
  return 'User successfully created!';
}

async function update(userParam) {
  const user = await User.findById(userParam.id);
  // validate
  if (!user) throw new Error('User not found');
  // copy userParam properties to user
  Object.assign(user, userParam);
  await user.save();
  return 'User successfully updated!';
}

async function updatePassword(userParam) {
  const user = await User.findById(userParam.id);
  // validate
  if (!user) throw new Error('User not found!');
  if (!bcrypt.compareSync(userParam.oldPassword, user.password)) {
    throw new Error('Old password is not correct!');
  }
  // encrypt new password and save
  user.password = bcrypt.hashSync(userParam.newPassword, 10);
  await user.save();
  return 'Password successfully updated!';
}

async function reset() {
  await User.find({}, function(err, users) {
    if (err) throw new Error(err);
    users.forEach(function(user) {
      user.vote = 5;
      user.songAdd = 1;
      user.save();
    });
  });
  return 'Successfully Reset Users!';
}

