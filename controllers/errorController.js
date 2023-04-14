const {
  handleCastErrorDB,
  handleDuplicateFieldsDB,
  handleValidationErrorDB,
  handleJWTError,
  handleJWTExpiredError,
  sendErrorDev,
  sendErrorProd,
} = require('../utils/utils');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  // eslint-disable-next-line prettier/prettier, node/no-unsupported-features/es-syntax
  let error = err;

  if (err.name === 'CastError') error = handleCastErrorDB(err);

  if (err.code === 11000) error = handleDuplicateFieldsDB(err);

  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);

  if (err.name === 'JsonWebTokenError') error = handleJWTError(err);

  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError(err);

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')
    sendErrorDev(err, res);
  else if (process.env.NODE_ENV === 'production') sendErrorProd(error, res);

  next();
};
