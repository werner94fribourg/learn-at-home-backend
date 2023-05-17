const PasswordValidator = require('password-validator');

const PASSWORD_VALIDATOR = new PasswordValidator();

PASSWORD_VALIDATOR.is()
  .min(8, 'The password must contain at least 8 characters.') // Minimum length 8
  .is()
  .max(100, 'The password must contain at most 100 characters.') // Maximum length 100
  .has()
  .uppercase(1, 'The password must contain at least 1 letter in uppercase.') // Must have uppercase letters
  .has()
  .lowercase(1, 'The password must contain at least 1 letter in lowercase.') // Must have lowercase letters
  .has()
  .digits(1, 'The password must contain at least 1 digit.') // Must have at least 1 digits
  .has()
  .symbols(1, 'The password must contain at least 1 special character.') // Must contain at least 1 symbol
  .has()
  .not()
  .spaces(1, 'The password must not contain spaces.'); // Must not contain spaces

exports.PASSWORD_VALIDATOR = PASSWORD_VALIDATOR;

exports.PARAMETER_WHITELIST = ['sent', 'beginning', 'end'];

exports.FRONT_END_URL = 'http://localhost:3000';

exports.API_ROUTE = '/api/v1';

exports.PUBLIC_FOLDER = 'public';

exports.IMG_FOLDER = exports.PUBLIC_FOLDER + '/img';

exports.USERS_FOLDER = exports.IMG_FOLDER + '/users';

exports.CONVERSATIONS_FOLDER = exports.IMG_FOLDER + '/conversations';

exports.LAST_AGGR_OBJ = [
  {
    $sort: {
      sent: -1,
    },
  },
  {
    $lookup: {
      from: 'users',
      localField: 'sender',
      foreignField: '_id',
      as: 'sender',
    },
  },
  {
    $lookup: {
      from: 'users',
      localField: 'receiver',
      foreignField: '_id',
      as: 'receiver',
    },
  },
  {
    $group: {
      _id: {
        sender: { $first: '$sender.username' },
        receiver: { $first: '$receiver.username' },
      },
      sender: { $first: '$sender._id' },
      senderPhoto: { $first: { $first: '$sender.photo' } },
      receiver: { $first: '$receiver._id' },
      receiverPhoto: { $first: { $first: '$receiver.photo' } },
      sent: {
        $max: '$sent',
      },
      files: {
        $first: '$files',
      },
      content: {
        $first: '$content',
      },
      read: {
        $first: '$read',
      },
    },
  },
  {
    $match: {
      $or: [
        {
          '_id.receiver': { $exists: true },
          '_id.sender': { $exists: true },
        },
      ],
    },
  },
  {
    $sort: {
      sent: -1,
    },
  },
];

exports.UNREAD_AGGR_OBJ = [
  {
    $match: {
      read: false,
    },
  },
  {
    $group: {
      _id: null,
      count: { $sum: 1 },
    },
  },
];

exports.TIMEZONE = 'Europe/Zurich';

exports.WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

exports.MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

exports.TIMEOUTS = {};

exports.SOCKET_CONNECTIONS = [];

exports.CHAT_ROOM = 'chatroom';
