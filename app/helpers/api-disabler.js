import dotenv from 'dotenv';
import moment from 'moment';
import httpStatus from 'http-status';

dotenv.config();
export default { isDisabled, isAfter };

function isDisabled(req, res, next) {
  if (moment().isAfter(moment(
    `${process.env.scheduleHour}
        :${process.env.scheduleMinute}
        :${process.env.scheduleSecond}:`, 'hh:mm:ss'))) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Method not allowed',
    });
  };
  return next();
}

function isAfter(hour, minute, second) {
  return moment().isAfter(moment(`${hour}:${minute}:${second}:`, 'hh:mm:ss'));
}
