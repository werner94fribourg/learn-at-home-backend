const User = require('../models/userModel');

const creationMock = session =>
  async function (creationObj) {
    const model = require(`../models/${this.modelName.toLowerCase()}Model`);

    const [newValue] = await model.create([creationObj], { session });

    return newValue;
  };

const findMock = session =>
  async function (findObj) {
    const model = require(`../models/${this.modelName.toLowerCase()}Model`);
    return await this.findOne({ findObj }).session(session);
  };

const registrationObj = {
  username: 'werner97',
  email: 'werner97@hotmail.com',
  firstname: 'Werner',
  lastname: 'Schmid',
  role: 'student',
  password: 'Test@1234',
  passwordConfirm: 'Test@1234',
};

const loginObj = {
  username: 'teacher',
  password: 'Test@1234',
};

const connPromise = mongoose.connect(DB_CONNECTION, {});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST /users/signup', () => {
  let session;
  beforeEach(async () => {
    jest.spyOn(Email.prototype, 'sendWelcome').mockImplementation(function () {
      return this.url;
    });
    const conn = await connPromise;
    session = await conn.startSession();
    jest
      .spyOn(mongoose.Model, 'create')
      .mockImplementationOnce(creationMock(session));
  });

  afterEach(async () => {
    session.endSession();
    jest.restoreAllMocks();
  });

  it('201 : Successful registration', async () => {
    session.startTransaction();
    const {
      statusCode,
      body: { status, message },
    } = await request(app)
      .post(`${API_ROUTE}/users/signup`)
      .send(registrationObj);

    expect(statusCode).toBe(201);
    expect(status).toBe('success');
    expect(message).toBe(
      'Successful registration.\nPlease confirm your e-mail address by accessing the link we sent in your inbox before 10 days.'
    );
    await session.abortTransaction();
  });

  it('400: Invalid field', async () => {
    const newRegistrationObj = { ...registrationObj };
    newRegistrationObj.email = 'werner97';
    session.startTransaction();
    const {
      statusCode,
      body: {
        status,
        message,
        error: { name },
      },
    } = await request(app)
      .post(`${API_ROUTE}/users/signup`)
      .send(newRegistrationObj);

    expect(statusCode).toBe(500);
    expect(status).toBe('error');
    expect(name).toBe('ValidationError');
    expect(message).toMatch(/email/i);
    await session.abortTransaction();
  });

  it('400: Duplicate field value', async () => {
    const newRegistrationObj = { ...registrationObj };
    newRegistrationObj.username = loginObj.username;
    session.startTransaction();

    const {
      statusCode,
      body: {
        status,
        message,
        error: { code },
      },
    } = await request(app)
      .post(`${API_ROUTE}/users/signup`)
      .send(newRegistrationObj);

    expect(statusCode).toBe(500);
    expect(status).toBe('error');
    expect(code).toBe(11000);
    expect(message).toMatch(/username/i);
    await session.abortTransaction();
  });

  it('403: Admin user creation attempt', async () => {
    const newRegistrationObj = { ...registrationObj };
    newRegistrationObj.role = 'admin';
    session.startTransaction();

    const {
      statusCode,
      body: { status, message },
    } = await request(app)
      .post(`${API_ROUTE}/users/signup`)
      .send(newRegistrationObj);

    expect(statusCode).toBe(403);
    expect(status).toBe('fail');
    expect(message).toBe('You cannot create an admin user using this route.');

    await session.abortTransaction();
  });
});

describe('POST /users/check-password', () => {
  const passwordObj = {
    password: 'hello',
  };

  it('200: Password checking (non valid password)', async () => {
    const {
      statusCode,
      body: {
        status,
        data: { validations },
      },
    } = await request(app)
      .post(`${API_ROUTE}/users/check-password`)
      .send(passwordObj);

    expect(statusCode).toBe(200);
    expect(status).toBe('success');
    expect(validations.length).not.toBe(0);
  });

  it('200: Password checking (valid password)', async () => {
    const {
      statusCode,
      body: {
        status,
        data: { validations },
      },
    } = await request(app)
      .post(`${API_ROUTE}/users/check-password`)
      .send({ password: 'Test@1234' });

    expect(statusCode).toBe(200);
    expect(status).toBe('success');
    expect(validations.length).toBe(0);
  });
});

describe('GET /users/confirm/:confirmToken', () => {
  let confirmToken = 'a';
  beforeEach(async () => {});

  afterEach(async () => {
    await User.findOneAndDelete({ email: registrationObj.email });
  });

  it('200: Successful confirmation', async () => {
    jest.spyOn(Email.prototype, 'sendWelcome').mockImplementation(function () {
      confirmToken = this.url.split('confirm/')[1];
      return this.url;
    });

    await request(app).post(`${API_ROUTE}/users/signup`).send(registrationObj);

    const {
      statusCode,
      body: { status, token },
    } = await request(app).get(`${API_ROUTE}/users/confirm/${confirmToken}`);

    expect(statusCode).toBe(200);
    expect(status).toBe('success');
    expect(token).toBeTruthy();
  });

  describe('404: invalid confirmation token', () => {
    it('Previously used token', async () => {
      expect(confirmToken).not.toBe('a');
      const {
        statusCode,
        body: { status, message },
      } = await request(app).get(`${API_ROUTE}/users/confirm/${confirmToken}`);

      expect(statusCode).toBe(404);
      expect(status).toBe('fail');
      expect(message).toBe('Invalid link !');
    });

    it('Random token', async () => {
      confirmToken = 'test';
      expect(confirmToken).toBe('test');
      const {
        statusCode,
        body: { status, message },
      } = await request(app).get(`${API_ROUTE}/users/confirm/${confirmToken}`);

      expect(statusCode).toBe(404);
      expect(status).toBe('fail');
      expect(message).toBe('Invalid link !');
    });
  });
});

describe('POST /users/login', () => {
  afterEach(async () => {
    await User.findOneAndDelete({ email: registrationObj.email });
  });

  it('200: Successful login', async () => {
    const res = await request(app)
      .post(`${API_ROUTE}/users/login`)
      .send(loginObj);
    const {
      statusCode,
      body: { status, token },
    } = res;

    expect(statusCode).toBe(200);
    expect(status).toBe('success');
    expect(token).toBeTruthy();
  });

  it('400: Missing fields', async () => {
    const {
      statusCode,
      body: { status, message },
    } = await request(app)
      .post(`${API_ROUTE}/users/login`)
      .send({ username: loginObj.username });

    expect(statusCode).toBe(400);
    expect(status).toBe('fail');
    expect(message).toBe('Please provide email and password!');
  });

  it('401: Incorrect credentials', async () => {
    const {
      statusCode,
      body: { status, message },
    } = await request(app)
      .post(`${API_ROUTE}/users/login`)
      .send({ username: loginObj.username, password: 'hello@123' });

    expect(statusCode).toBe(401);
    expect(status).toBe('fail');
    expect(message).toBe('Incorrect credentials.');
  });

  it('403: Non confirmed account', async () => {
    jest.spyOn(Email.prototype, 'sendWelcome').mockImplementation(function () {
      return this.url;
    });

    await request(app).post(`${API_ROUTE}/users/signup`).send(registrationObj);

    const {
      statusCode,
      body: { status, message },
    } = await request(app).post(`${API_ROUTE}/users/login`).send({
      email: registrationObj.email,
      password: registrationObj.password,
    });

    expect(statusCode).toBe(403);
    expect(status).toBe('fail');
    expect(message).toBe(
      'Please confirm your e-mail address (link sent by e-mail).'
    );
  });
});
/*
describe('POST /users/forgot-password', () => {
  let session;
  let resetToken;

  const forgotObj = {
    username: loginObj.username,
  };

  beforeEach(async () => {
    const conn = await connPromise;
    session = await conn.startSession();

    jest
      .spyOn(Email.prototype, 'sendPasswordReset')
      .mockImplementation(function () {
        resetToken = this.url.split('reset-password/')[1];
        return this.url;
      });

    jest
      .spyOn(mongoose.Model, /^findOne/)
      .mockImplementationOnce(findMock(session));
  });

  afterEach(async () => {
    await session.abortTransaction();

    session.endSession();
    jest.restoreAllMocks();
  });

  it('200: Successful change link sent to email', async () => {
    session.startTransaction();
    expect(resetToken).toBeUndefined();
    const {
      statusCode,
      body: { status, message },
    } = await request(app)
      .post(`${API_ROUTE}/users/forgot-password`)
      .send(forgotObj);

    expect(statusCode).toBe(200);
    expect(status).toBe('success');
    expect(message).toBe('Reset link sent to email!');
    expect(resetToken).not.toBeUndefined();
  });
});
*/
