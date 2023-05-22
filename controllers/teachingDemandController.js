const TeachingDemand = require('../models/teachingDemandModel');
const User = require('../models/userModel');
const AppError = require('../utils/classes/AppError');
const { catchAsync } = require('../utils/utils');

exports.getAllDemands = catchAsync(async (req, res, next) => {
  const {
    user: { id, role },
  } = req;

  const reqObject = {
    [role === 'student' ? 'sender' : 'teacher']: id,
  };

  const teachingDemands = await TeachingDemand.find(reqObject)
    .populate({
      path: 'sender',
      select: '_id username',
    })
    .populate({
      path: 'receiver',
      select: '_id username',
    });

  res.status(200).json({
    status: 'success',
    data: { teachingDemands },
  });
});

exports.getDemand = catchAsync(async (req, res, next) => {
  const {
    user: { id },
    params: { userId: otherId },
  } = req;

  const teachingDemand = await TeachingDemand.findOne({
    $or: [
      {
        sender: id,
        receiver: otherId,
      },
      {
        sender: otherId,
        receiver: id,
      },
    ],
  })
    .populate({
      path: 'sender',
      select: '_id username',
    })
    .populate({
      path: 'receiver',
      select: '_id username',
    });

  res.status(200).json({
    status: 'success',
    data: { teachingDemand },
  });
});

exports.sendDemand = catchAsync(async (req, res, next) => {
  const {
    teacher: { id: receiver },
    user: { id: sender },
  } = req;

  const existingDemand = await TeachingDemand.findOne({
    sender,
    receiver,
    cancelled: false,
  });

  if (existingDemand) {
    next(
      new AppError(
        existingDemand.accepted
          ? 'You are already collaborating with this teacher.'
          : 'There is a pending teaching request sent to this teacher.',
        400
      )
    );
    return;
  }

  const existingApprovedDemand = await TeachingDemand.findOne({
    sender,
    accepted: true,
  });

  if (existingApprovedDemand) {
    next(new AppError("You can't have multiple mentors.", 400));
    return;
  }

  const newDemand = await TeachingDemand.create({
    sender,
    receiver,
    sent: Date.now(),
    accepted: false,
    cancelled: false,
  })
    .populate({
      path: 'sender',
      select: '_id username',
    })
    .populate({
      path: 'receiver',
      select: '_id username',
    });

  res.status(201).json({
    status: 'success',
    data: { teachingDemand: newDemand },
  });
});

exports.acceptDemand = catchAsync(async (req, res, next) => {
  const {
    user: { id: receiver },
    params: { demandId },
  } = req;

  const demand = await TeachingDemand.findById(demandId);

  if (!demand) {
    next(new AppError('No teachind demand found with that Id.', 404));
    return;
  }

  if (demand.receiver.valueOf() !== receiver) {
    next(
      new AppError("You can't accept demands that weren't sent to you.", 403)
    );
    return;
  }

  if (demand.cancelled) {
    next(new AppError("You can't accept demands that were cancelled.", 400));
    return;
  }

  const updatedDemand = await TeachingDemand.findOneAndUpdate(
    {
      _id: demand._id,
    },
    { accepted: true },
    { new: true }
  )
    .populate({
      path: 'sender',
      select: '_id username',
    })
    .populate({
      path: 'receiver',
      select: '_id username',
    });

  await TeachingDemand.updateMany(
    {
      $and: [
        { sender: updatedDemand.sender },
        { receiver: { $ne: updatedDemand.receiver } },
      ],
    },
    { cancelled: true }
  );

  await User.findByIdAndUpdate(updatedDemand.sender.valueOf(), {
    supervisor: updatedDemand.receiver.valueOf(),
  });

  const supervisor = await User.findById(updatedDemand.receiver.valueOf());

  const supervised = supervisor.supervised?.map(objId => objId.valueOf()) || [];

  supervised.push(updatedDemand.sender.valueOf());

  await User.findByIdAndUpdate(updatedDemand.receiver.valueOf(), {
    supervised,
  });

  res.status(200).json({
    status: 'success',
    data: { teachingDemand: updatedDemand },
  });
});

exports.cancelDemand = catchAsync(async (req, res, next) => {
  const {
    user: { id },
    params: { demandId },
  } = req;

  const demand = await TeachingDemand.findById(demandId);

  if (!demand) {
    if (!demand) {
      next(new AppError('No teaching demand found with that ID.', 404));
      return;
    }
  }

  if (demand.receiver.valueOf() !== id) {
    if (demand.sender.valueOf() !== id) {
      next(new AppError("You can't cancel demands that you didn't sent.", 403));
      return;
    }
    next(
      new AppError("You can't cancel demands that weren't sent to you.", 403)
    );
    return;
  }

  if (demand.accepted) {
    next(new AppError("You can't cancel demands that were accepted.", 400));
    return;
  }

  const updatedDemand = await TeachingDemand.findOneAndUpdate(
    {
      _id: demand._id,
    },
    { cancelled: true },
    { new: true }
  )
    .populate({
      path: 'sender',
      select: '_id username',
    })
    .populate({
      path: 'receiver',
      select: '_id username',
    });

  res
    .status(200)
    .json({ status: 'success', data: { teachingDemand: updatedDemand } });
});
