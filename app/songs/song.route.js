import express from 'express';
const router = express.Router();
import songController from './song.controller';
import apiDisabler from '../helpers/api-disabler';

router.get('/search/:query', apiDisabler.isDisabled, songController.searchSong);
router.get('/playlist', songController.getPlaylist);
router.post('/add', apiDisabler.isDisabled, songController.addSong);
router.post('/vote', apiDisabler.isDisabled, songController.voteSong);

export default { router };
