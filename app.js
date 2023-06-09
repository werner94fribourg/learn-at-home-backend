const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { rateLimit } = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const swaggerUI = require('swagger-ui-express');
const apiRouter = require('./routes/apiRoutes');
const {
  PARAMETER_WHITELIST,
  API_ROUTE,
  PUBLIC_FOLDER,
  FRONT_END_URL,
} = require('./utils/globals');
const AppError = require('./utils/classes/AppError');
const errorHandler = require('./controllers/errorController');
const swaggerSpec = require('./utils/swagger');
const User = require('./models/userModel');
const Message = require('./models/messageModel');
const Task = require('./models/taskModel');

const app = express();
const {
  env: { NODE_ENV },
} = process;

app.enable('trust proxy');

// SET STATIC DIRECTORY
app.use(express.static(path.join(__dirname, PUBLIC_FOLDER)));

// SET VIEW TEMPLATE RENDERER
app.set('view engine', 'ejs');

// DEV LOGGING
if (NODE_ENV === 'development') app.use(require('morgan')('dev'));

// SET SECURE SCRIPT POLICIES
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

// SET CORS
app.use(cors({ credentials: true, origin: FRONT_END_URL })); // GET and POST
app.options('*', cors({ credentials: true, origin: FRONT_END_URL })); // OPTIONS CHECK BEFORE PATCH, PUT AND DELETE
/* SET ORIGIN CORS ONCE THE FRONT-END IS DONE
app.use(
  cors({
    origin: 'https://www.natours.com',
  })
);
*/

// LIMIT NB REQUESTS TO API
const limiter = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: (_, res) =>
    res.json({
      status: 'fail',
      message: 'Too many requests from this IP, please try again in an hour!',
    }),
});

app.use('/api', limiter);

// READING BODY CONTENT AS JSON AND LIMIT ITS SIZE TO 10KB
app.use(express.json({ limit: '10kb' }));

// READING ENCODED URL AND LIMIT SIZE
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// READING COOKIE SENT BY USER
app.use(cookieParser());

// MONGODB DATA SANITIZATION AND PROTECTION AGAINST NoSQL INJECTION
app.use(mongoSanitize());

// CLEAN SENT OF MALICIOUS HTML CONTAINING JS SENT TO THE APP
app.use(xss());

// PREVENTING PARAMETER POLLUTION (I.E. REPEATING FIELDS)
app.use(
  hpp({
    whitelist: PARAMETER_WHITELIST,
  })
);

// ZIP COMPRESSION
app.use(compression());

// SET REQUEST TIME MIDDLEWARE
app.use((req, _, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.route('/docs.json').get((_, res) => {
  res.status(200).json(swaggerSpec);
});

app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use(API_ROUTE, apiRouter);

// ERROR MIDDLEWARE IF THE ROUTE DOESN'T EXIST
app.all('*', (req, _, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

setInterval(async () => {
  const testUsers = await User.find({
    $or: [{ username: 'student' }, { username: 'teacher' }],
  });

  await Promise.all(
    testUsers.map(async user => {
      const id = user._id.valueOf();
      await Event.deleteMany({ organizer: id });
      await Message.deleteMany({ $or: [{ sender: id }, { receiver: id }] });
      await Task.deleteMany({ performer: id });
    })
  );
}, 24 * 60 * 60 * 1000);

module.exports = app;
