import express from 'express';
const router = express.Router();
import userController from './user.controller';

export default { router };


router.post('/authenticate', userController.authenticate);
router.post('/logout', userController.logout);
router.post('/register', userController.validate('register'),
  userController.checkExist,
  userController.register);
router.get('/current', userController.getCurrent);
router.get('/:id', userController.getUserById);
router.put('/update', userController.validate('update'), userController.update);
router.put('/update-password', userController.validate('updatePassword'),
  userController.checkExist,
  userController.updatePassword);
