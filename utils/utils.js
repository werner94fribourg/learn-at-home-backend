const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const moment = require('moment-timezone');
const AppError = require('./classes/AppError');
const { TIMEZONE, MONTHS, SOCKET_CONNECTIONS } = require('./globals');
const Event = require('../models/eventModel');

const signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.catchAsync = fn => (req, res, next) => {
  fn(req, res, next).catch(err => next(err));
};

exports.shutDownAll = async (server, dbConnection, message, error) => {
  try {
    console.log(message);
    if (error) console.error(error.name, error.message);
    if (dbConnection) {
      console.log('Close DB connection.');
      await dbConnection.close();
    }
    
    if (server)
      server.close(() => {
        console.log('Close server.');
        process.exit(1);
      });
    else process.exit(1);
  } catch (err) {
    console.error(err.name, err.message);
    process.exit(1);
  }
};

exports.handleCastErrorDB = error => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

exports.handleDuplicateFieldsDB = error => {
  const [value] = error.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/);

  const message = `Duplicate field value: ${value}. Please use another value!`;

  return new AppError(message, 400);
};

exports.handleValidationErrorDB = error => {
  const message = `Invalid input data.`;
  const errors = Object.entries(error.errors).map(([key, value]) => ({
    [key]: value.message,
  }));

  const appError = new AppError(message, 400);
  appError.fields = errors;
  return appError;
};

exports.handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

exports.handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again!', 401);

exports.sendErrorDev = (error, res) => {
  const { statusCode, status, message, stack } = error;
  res.status(statusCode).json({ status, error, message, stack });
};

exports.sendErrorProd = (err, res) => {
  if (err.isOperational) {
    const { statusCode, status, message, fields } = err;
    res.status(statusCode).json({ status, message, fields });
    return;
  }
  // Log error
  console.error('ERROR: ', err);

  // Send generic message
  res
    .status(500)
    .json({ status: 'error', message: 'Something went wrong. Try Again !' });
};

exports.createSendToken = (user, statusCode, req, res, message = '') => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 600 * 1000
    ),
    httpOnly: true,
    sameSite: 'none',
    secure: req.secure || req.header('x-forwarded-proto') === 'https',
    domain: req.get('origin'),
  };
  const resObject = {
    status: 'success',
    token,
  };

  if (message) resObject.message = message;
  // send it as a cookie
  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json(resObject);
};

exports.createLinkToken = () => {
  const token = crypto.randomBytes(32).toString('hex');

  return [token, crypto.createHash('sha256').update(token).digest('hex')];
};

exports.uploadImage = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, callback) => {
    const { mimetype } = file;
    if (mimetype.startsWith('image')) {
      callback(null, true);
      return;
    }
    callback(
      new AppError('Not an image! Please upload only images.', 400),
      false
    );
  },
});

exports.uploadMessageFiles = multer({
  storage: multer.memoryStorage(),
});

exports.getLastMessagesBetweenTwoUsers = queryMessages =>
  queryMessages.reduce((acc, message) => {
    const {
      _id: { sender, receiver },
      sent,
    } = message;
    message.sender = message.sender[0];
    message.receiver = message.receiver[0];

    const otherIndex = acc.findIndex(el => {
      const {
        _id: { sender: otherSender, receiver: otherReceiver },
      } = el;

      return otherSender === receiver && otherReceiver === sender;
    });

    if (otherIndex === -1) {
      acc.push(message);
      return acc;
    }

    const { sent: otherSent } = acc[otherIndex];

    if (otherSent.getTime() < sent.getTime()) acc[otherIndex] = message;

    return acc;
  }, []);

exports.transformTime = str => {
  if (!str) return str;
  let transform = str.trim();
  if (transform.slice(-2) === 'AM') {
    transform = transform.slice(0, -3);
  } else if (transform.slice(-2) === 'PM') {
    const time = transform.slice(0, -3);
    const [hours, minutes] = time.split(':');
    transform = `${Number(hours) + 12}:${minutes}`;
  }

  return transform;
};

exports.isValidTime = str => {
  if (!str) return false;

  let regex = new RegExp(/^([01]\d|2[0-3]):?([0-5]\d)$/);

  return regex.test(str);
};

exports.isValidDate = str => {
  if (str == null) return false;

  var validatePattern = /^(\d{4})(\/|-)(\d{1,2})(\/|-)(\d{1,2})$/;

  dateValues = str.match(validatePattern);

  if (dateValues == null) return false;

  var dtYear = dateValues[1];
  dtMonth = dateValues[3];
  dtDay = dateValues[5];

  if (dtMonth < 1 || dtMonth > 12) return false;
  else if (dtDay < 1 || dtDay > 31) return false;
  else if (
    (dtMonth == 4 || dtMonth == 6 || dtMonth == 9 || dtMonth == 11) &&
    dtDay == 31
  )
    return false;
  else if (dtMonth == 2) {
    var isleap = dtYear % 4 == 0 && (dtYear % 100 != 0 || dtYear % 400 == 0);
    if (dtDay > 29 || (dtDay == 29 && !isleap)) return false;
  }

  return true;
};

exports.validateGuestOrAttendees = (users, organizer, next, guest = true) => {
  let nonExisting = false;
  let organizing = false;
  let admin = false;

  for (const user of users) {
    if (!user || user.isDeleted) {
      nonExisting = true;
      break;
    }

    if (user.id.valueOf() === organizer) {
      organizing = true;
      break;
    }

    if (user.role === 'admin') {
      admin = true;
      break;
    }
  }

  if (nonExisting || admin) {
    const message = guest
      ? "You can't invite non existing guests to an event."
      : "A non-existing user can't attend an event.";
    next(new AppError(message, 400));
    return false;
  }

  if (organizing) {
    const message = guest
      ? "You can't be invited to an event you organize."
      : "You can't be an attendee of an event you organize.";
    next(new AppError(message, 400));
    return false;
  }

  return true;
};

exports.validateDateAndTime = (time, date, next, type = 'beginning') => {
  if (!exports.isValidDate(date)) {
    next(
      new AppError(
        `Please provide a valid date for the ${type} of your event.`,
        400
      )
    );
    return false;
  }

  if (!exports.isValidTime(time)) {
    next(
      new AppError(
        `Please provide a valid time for the ${type} of your event.`,
        400
      )
    );
    return false;
  }

  return true;
};

exports.getDateAndTime = utcString => {
  return moment(utcString).tz(TIMEZONE).format().slice(0, -6).split('T');
};

exports.setDateAndTime = (date, time) => {
  return moment.tz(`${date} ${time}`, TIMEZONE).utc().format();
};

exports.formatDate = date => {
  const [_, monthStr, dayStr, yearStr] = date.toDateString().split(' ');

  const month = String(MONTHS.indexOf(monthStr) + 1).padStart(2, '0');

  return `${yearStr}-${month}-${dayStr} 00:00:00`;
};

exports.getEvents = async (type, req, res, next) => {
  const {
    user: { id: userId },
    date,
  } = req;
  const start = moment(date).startOf(type).utc().format();
  const end = moment(date).endOf(type).utc().format();

  const events = await Event.find({
    $and: [
      {
        $and: [{ beginning: { $gte: start } }, { beginning: { $lte: end } }],
      },
      {
        $or: [{ organizer: userId }, { guests: userId }, { attendees: userId }],
      },
    ],
  });

  res.status(200).json({ status: 'success', data: { events } });
};

exports.getPrevious = (date, type) => {
  return moment(date).tz(TIMEZONE).subtract(1, type).utc().format();
};

exports.getNext = (date, type) => {
  return moment(date).tz(TIMEZONE).add(1, type).utc().format();
};
