const sharp = require('sharp');
const User = require('../models/userModel');
const AppError = require('../utils/classes/AppError');
const Email = require('../utils/classes/Email');
const { TIMEOUTS } = require('../utils/globals');
const { catchAsync, uploadImage } = require('../utils/utils');
const {
  getAll,
  queryOne,
  getOne,
  updateOne,
  deleteOne,
} = require('./handlers/handlerFactory');
const { upload } = require('azure-blobv2');

exports.getAllUsers = getAll(User, { role: { $ne: 'admin' } });

exports.queryUser = queryOne(User, { role: { $ne: 'admin' } });

exports.getUser = getOne(User);

exports.createUser = (_, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'Please use /signup instead.' });
};

exports.updateUser = updateOne(User);

exports.deleteUser = deleteOne(User);

exports.queryMe = (req, res, next) => {
  req.params.id = req.user.id;

  // User without filtering
  queryOne(User)(req, res, next);
};

exports.deleteMe = catchAsync(async (req, res, next) => {
  const { user } = req;
  const { id } = user;
  const updatedUser = await User.findByIdAndUpdate(id, {
    isDeleted: true,
    deletedAt: Date.now(),
  });

  await new Email(user, '').sendAccountDelete();

  const deleteTimeout = setTimeout(async () => {
    console.log(`Delete user ${id} : Definitive deletion time expired.`);
    const deleted = await User.findByIdAndDelete(id, {
      disableMiddlewares: true,
    });
    TIMEOUTS[id] = undefined;
    await new Email(updatedUser, '').sendPermanentDelete();
  }, 30 * 1000 /*90 * 24 * 60 * 60 * 1000*/);

  TIMEOUTS[id] = deleteTimeout;
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.setRole = catchAsync(async (req, res, next) => {
  const {
    params: { id },
    body: { role },
  } = req;
  const user = await User.findById(id);

  // 1) Create Error if the requested user is an admin
  if (user.role === 'admin') {
    next(new AppError("You can't update the role of an admin user.", 403));
    return;
  }
  // 2) Update the user
  const updatedUser = await User.findByIdAndUpdate(
    user.id,
    { role },
    {
      new: true,
      runValidators: true,
    }
  );

  // 3) Send the updated User
  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});

exports.uploadUserPhoto = uploadImage.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  const {
    file,
    user: { id },
  } = req;
  if (!file) {
    next();
    return;
  }
  const filename = `user-${id}-${Date.now()}.jpeg`;
  await sharp(file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 100 })
    .toFile(`public/img/users/${filename}`);
  file.filename = filename;
  next();
});

exports.getAllContacts = catchAsync(async (req, res) => {
  const {
    user: { id },
  } = req;

  const { contacts } = await User.findById(id).select('contacts').populate({
    path: 'contacts',
    select: 'username firstname lastname photo',
  });

  res.status(200).json({
    status: 'success',
    data: { users: contacts },
  });
});

exports.addContact = catchAsync(async (req, res, next) => {
  const {
    params: { contactId },
    user: { id },
  } = req;

  const { contacts } = await User.findById(id).select('contacts');
  const otherUser = await User.findOne({
    _id: contactId,
    role: { $ne: 'admin' },
  }).select('contacts');

  if (!otherUser) {
    next(new AppError('No user found with that Id.', 404));
    return;
  }
  const { contacts: otherContacts, id: otherId } = otherUser;

  if (otherId === id) {
    next(new AppError("You can't add yourself to your contact list.", 400));
    return;
  }

  if (!contacts?.includes(otherId)) {
    contacts?.push(otherId);
    otherContacts?.push(id);
  }

  await User.findByIdAndUpdate(otherId, { contacts: otherContacts || [id] });

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { contacts: contacts || [otherId] },
    {
      new: true,
      runValidators: false,
    }
  )
    .select('contacts')
    .populate({
      path: 'contacts',
      select: 'username firstname lastname photo',
    });

  res.status(200).json({
    status: 'success',
    message: 'User successfully added to your contacts.',
    data: { users: updatedUser.contacts },
  });
});

exports.deleteContact = catchAsync(async (req, res, next) => {
  const {
    params: { contactId },
    user: { id },
  } = req;

  const { contacts } = await User.findById(id).select('contacts');
  const otherUser = await User.findOne({
    _id: contactId,
    role: { $ne: 'admin' },
  }).select('contacts');

  if (!otherUser) {
    next(new AppError('No user found with that Id.', 404));
    return;
  }
  const { contacts: otherContacts, id: otherId } = otherUser;

  let updatedContacts = [];
  let updatedOtherContacts = [];
  if (contacts?.includes(otherId)) {
    updatedContacts = contacts.filter(
      storedId => storedId.valueOf() !== otherId
    );
    updatedOtherContacts = otherContacts.filter(
      storedId => storedId.valueOf() !== id
    );
  }

  await User.findByIdAndUpdate(otherId, { contacts: updatedOtherContacts });

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { contacts: updatedContacts },
    {
      new: true,
      runValidators: false,
    }
  )
    .select('contacts')
    .populate({
      path: 'contacts',
      select: 'username firstname lastname photo',
    });

  res.status(200).json({
    status: 'success',
    message: 'User successfully removed from your contacts.',
    data: { users: updatedUser.contacts },
  });
});

exports.getSupervisedStudents = catchAsync(async (req, res, next) => {
  const {
    user: { id },
  } = req;

  const { supervised: users } = await User.findById(id)
    .select('supervised')
    .populate({
      path: 'supervised',
      select: '_id email username firstname lastname photo role',
    });

  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});
