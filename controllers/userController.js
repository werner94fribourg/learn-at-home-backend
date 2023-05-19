const sharp = require('sharp');
const User = require('../models/userModel');
const AppError = require('../utils/classes/AppError');
const Email = require('../utils/classes/Email');
const { TIMEOUTS, SOCKET_CONNECTIONS } = require('../utils/globals');
const { catchAsync, uploadImage } = require('../utils/utils');
const {
  getAll,
  queryOne,
  getOne,
  updateOne,
  deleteOne,
} = require('./handlers/handlerFactory');

exports.getAllUsers = (req, res, next) => {
  // User without filtering
  getAll(User, { role: { $ne: 'admin' }, _id: { $ne: req.user.id } })(
    req,
    res,
    next
  );
};

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

exports.getAllInvitations = catchAsync(async (req, res, next) => {
  const {
    user: { id },
  } = req;

  const { invitations } = await User.findById(id)
    .select('invitations')
    .populate({
      path: 'invitations',
      select: 'username firstname lastname photo',
    });

  res
    .status(200)
    .json({ status: 'success', data: { users: invitations || [] } });
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
    data: { users: contacts || [] },
  });
});

exports.declineInvitation = catchAsync(async (req, res, next) => {
  const {
    params: { userId },
    user: { id },
  } = req;

  if (userId === id) {
    next(
      new AppError("You can't decline a contact invitation to yourself.", 400)
    );
    return;
  }
  const otherUser = await User.findOne({
    _id: userId,
    role: { $ne: 'admin' },
  });

  if (!otherUser) {
    next(new AppError('No user found with that ID.', 404));
    return;
  }

  const connectedUser = await User.findOne({
    _id: id,
  }).select('invitations');

  const { invitations: invitationsVal } = connectedUser;

  const invitations = invitationsVal?.map(user => user.valueOf());

  if (
    !invitations ||
    invitations.findIndex(sender => sender === userId) === -1
  ) {
    next(
      new AppError(
        "The user you want to add hasn't send you a contact request.",
        400
      )
    );
    return;
  }

  const newInvitations = invitations?.filter(sender => sender !== userId);

  await User.findByIdAndUpdate(id, {
    invitations: newInvitations,
  });

  res.status(200).json({
    status: 'success',
    message: 'Contact invitation successfully refused.',
    data: null,
  });
});

exports.sendInvitation = catchAsync(async (req, res, next) => {
  const {
    params: { userId },
    user: { id },
  } = req;

  if (userId === id) {
    next(new AppError("You can't send a contact invitation to yourself.", 400));
    return;
  }

  const otherUser = await User.findOne({
    _id: userId,
    role: { $ne: 'admin' },
  }).select('invitations');

  if (!otherUser) {
    next(new AppError('No user found with that ID.', 404));
    return;
  }

  const { invitations: invitationsVal } = otherUser;

  let invitations = invitationsVal?.map(it => it.valueOf());

  if (invitations?.findIndex(sender => sender === id) !== -1) {
    res.status(200).json({
      status: 'success',
      message: 'Contact invitation successfully sent.',
      data: null,
    });
    return;
  }

  if (invitations) invitations.push(id);
  else invitations = [id];

  await User.findByIdAndUpdate(userId, { invitations });

  res.status(200).json({
    status: 'success',
    message: 'Contact invitation successfully sent.',
    data: null,
  });
});

exports.addContact = catchAsync(async (req, res, next) => {
  const {
    params: { contactId },
    user: { id },
  } = req;

  const { contacts, invitations } = await User.findById(id)
    .select('contacts')
    .select('invitations');

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

  if (invitations?.findIndex(sender => sender.valueOf() === contactId) === -1) {
    next(
      new AppError(
        "The user you want to add hasn't send you a contact request.",
        400
      )
    );
    return;
  }

  if (!contacts?.includes(otherId)) contacts?.push(otherId);

  if (!otherContacts?.includes(id)) otherContacts?.push(id);

  const newInvitations = invitations?.filter(
    sender => sender.valueOf() !== contactId
  );

  await User.findByIdAndUpdate(otherId, { contacts: otherContacts || [id] });

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { contacts: contacts || [otherId], invitations: newInvitations },
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

exports.getConnectionStatus = catchAsync(async (req, res) => {
  const { document: user } = req;

  const socketUser = SOCKET_CONNECTIONS.find(id => id === user._id.valueOf());

  res.status(200).json({
    status: 'success',
    data: {
      connected: !socketUser ? false : true,
    },
  });
});
