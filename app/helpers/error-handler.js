import httpStatus from 'http-status';

export { errorHandler };

function errorHandler(err, req, res, next) {
  if (typeof (err) === 'string') {
    // custom application error
    return res.status(httpStatus.BAD_REQUEST).json({ message: err });
  }

  if (err.name === 'ValidationError') {
    // mongoose validation error
    return res.status(httpStatus.BAD_REQUEST).json({ message: err.message });
  }

  if (err.name === 'UnauthorizedError') {
    // jwt authentication error
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Invalid Token!',
    });
  }
  return res.status(httpStatus.BAD_REQUEST).json({ message: err.message });
}
