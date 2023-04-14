const mongoose = require('mongoose');
const request = require('supertest');
const dotenv = require('dotenv');
const app = require('../app');
const { API_ROUTE } = require('../utils/globals');
const Email = require('../utils/classes/Email');

module.exports = () => {
  dotenv.config({ path: './config.env' });

  const {
    env: {
      USERNAME1,
      USERNAME2,
      PASSWORD,
      HOST,
      TEST_DATABASE,
      TEST_CONNECTION_STRING,
    },
  } = process;
  const USERNAME = [USERNAME1, USERNAME2].join('');

  const DB_CONNECTION = TEST_CONNECTION_STRING.replace('<USERNAME>', USERNAME)
    .replace('<PASSWORD>', PASSWORD)
    .replace('<HOST>', HOST)
    .replace('<TEST_DATABASE>', TEST_DATABASE);

  global.DB_CONNECTION = DB_CONNECTION;
  global.API_ROUTE = API_ROUTE;
  global.app = app;
  global.request = request;
  global.mongoose = mongoose;
  global.Email = Email;
};
