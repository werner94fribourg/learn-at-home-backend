const Event = require('../models/eventModel');
const AppError = require('../utils/classes/AppError');
const {
  catchAsync,
  transformTime,
  validateGuestOrAttendees,
  validateDateAndTime,
  setDateAndTime,
  getDateAndTime,
  formatDate,
  isValidDate,
  getEvents,
  getNext,
  getPrevious,
  isBefore,
} = require('../utils/utils');
const moment = require('moment-timezone');
const User = require('../models/userModel');
const { TIMEZONE } = require('../utils/globals');

exports.getAllEvents = catchAsync(async (req, res, next) => {
  const {
    user: { id: userId },
    query,
  } = req;

  const page = query.page || 1;
  const limit = query.limit || 10;
  const skip = (+page - 1) * +limit;

  if (isNaN(+page) || isNaN(+limit)) {
    next(
      new AppError(
        'please provide numerical values for pagination query variables (page and limit).',
        400
      )
    );
    return;
  }

  const events = await Event.find({
    $or: [{ organizer: userId }, { guests: userId }, { attendees: userId }],
  })
    .populate({
      path: 'organizer',
      select: 'username',
    })
    .sort({ beginning: -1 })
    .skip(+skip)
    .limit(+limit);

  if (events.length === 0 && +page > 1) {
    next(new AppError("This page doesn't exist.", 404));
    return;
  }

  res.status(200).json({ status: 'success', data: { events } });
});

exports.getTodayEvents = catchAsync(async (req, res) => {
  const {
    user: { id: userId },
  } = req;

  const today = moment(Date.now()).tz(TIMEZONE);
  const start = today.clone().startOf('day');
  const end = today.clone().endOf('day');

  const events = await Event.find({
    $and: [
      {
        $and: [{ beginning: { $gte: start } }, { beginning: { $lte: end } }],
      },
      {
        $or: [{ organizer: userId }, { guests: userId }, { attendees: userId }],
      },
    ],
  })
    .populate({
      path: 'organizer',
      select: 'username',
    })
    .sort({ beginning: -1 });

  res.status(200).json({ status: 'success', data: { events } });
});

exports.getEvent = catchAsync(async (req, res, next) => {
  const {
    user: { id: userId },
    params: { eventId: id },
  } = req;

  const event = await Event.findOne({
    _id: id,
    $or: [{ organizer: userId }, { guests: userId }, { attendees: userId }],
  })
    .populate({
      path: 'organizer',
      select: 'username',
    })
    .populate({
      path: 'guests',
      select: 'username',
    })
    .populate({
      path: 'attendees',
      select: 'username',
    });

  if (!event) {
    next(new AppError('No event found with that ID.', 404));
    return;
  }

  res.status(200).json({ status: 'success', data: { event } });
});

exports.createEvent = catchAsync(async (req, res, next) => {
  const {
    user: { id: organizer },
    body: {
      title,
      description,
      beginningDate,
      beginningTime: begBeforeTrans,
      endDate,
      endTime: endBeforeTrans,
    },
  } = req;
  const beginningTime = transformTime(begBeforeTrans);
  const endTime = transformTime(endBeforeTrans);
  const guests =
    req.body.guests?.filter((element, index) => {
      return req.body.guests.indexOf(element) === index;
    }) || [];
  const guestUsers = await Promise.all(
    guests.map(
      async id => await User.findOne({ _id: id, role: { $ne: 'admin' } })
    )
  );
  if (!validateGuestOrAttendees(guestUsers, organizer, next)) {
    return;
  }

  if (!validateDateAndTime(beginningTime, beginningDate, next)) {
    return;
  }

  if (!validateDateAndTime(endTime, endDate, next, 'end')) {
    return;
  }

  const beginning = setDateAndTime(beginningDate, beginningTime);
  const end = setDateAndTime(endDate, endTime);

  const newEvent = await Event.create({
    title,
    description,
    beginning,
    end,
    organizer,
    guests,
  });

  res.status(201).json({ status: 'success', data: { event: newEvent } });
});

exports.updateEvent = catchAsync(async (req, res, next) => {
  const {
    user: { id: organizer },
    body: {
      title,
      description,
      beginningTime: begBeforeTrans,
      endTime: endBeforeTrans,
      guests: guestArray,
      attendees: attendeesArray,
    },
    params: { eventId: id },
  } = req;
  let {
    body: { beginningDate, endDate },
  } = req;
  let beginningTime = transformTime(begBeforeTrans);
  let endTime = transformTime(endBeforeTrans);

  const guests =
    guestArray?.filter((element, index) => {
      return (
        guestArray.indexOf(element) === index &&
        !attendeesArray?.includes(element)
      );
    }) || [];
  const attendees =
    attendeesArray?.filter((element, index) => {
      return attendeesArray.indexOf(element) === index;
    }) || [];
  const guestUsers = await Promise.all(
    guests.map(
      async id => await User.findOne({ _id: id, role: { $ne: 'admin' } })
    )
  );
  const attendeesUsers = await Promise.all(
    attendees.map(
      async id => await User.findOne({ _id: id, role: { $ne: 'admin' } })
    )
  );

  const event = await Event.findOne({
    _id: id,
    $or: [
      { organizer: organizer },
      { guests: organizer },
      { attendees: organizer },
    ],
  });

  if (!event) {
    next(new AppError('No event found with that ID.', 404));
    return;
  }

  if (event.organizer.valueOf() !== organizer) {
    next(new AppError('You are not the organizer of the event.', 403));
    return;
  }

  if (!validateGuestOrAttendees(guestUsers, organizer, next)) {
    return;
  }

  if (!validateGuestOrAttendees(attendeesUsers, organizer, next, false)) {
    return;
  }

  const [storedBeginningDate, storedBeginningTime] = getDateAndTime(
    event.beginning
  );

  const [storedEndDate, storedEndTime] = getDateAndTime(event.end);

  if (!beginningDate) beginningDate = storedBeginningDate;
  if (!beginningTime) beginningTime = storedBeginningTime;
  if (!endDate) endDate = storedEndDate;
  if (!endTime) endTime = storedEndTime;

  if (!validateDateAndTime(beginningTime, beginningDate, next)) {
    return;
  }

  if (!validateDateAndTime(endTime, endDate, next, 'end')) {
    return;
  }

  const updateObj = {
    beginning: setDateAndTime(beginningDate, beginningTime),
    end: setDateAndTime(endDate, endTime),
    guests,
    attendees,
  };

  if (!isBefore(updateObj.beginning, updateObj.end)) {
    next(
      new AppError("The end date can't happen before the beginning date.", 400)
    );
    return;
  }

  if (title) updateObj.title = title;

  if (description) updateObj.description = description;

  const updatedEvent = await Event.findByIdAndUpdate(id, updateObj, {
    new: true,
    runValidators: false,
  });

  res.status(200).json({ status: 'success', data: { event: updatedEvent } });
});

exports.deleteEvent = catchAsync(async (req, res, next) => {
  const {
    user: { id: organizer },
    params: { eventId: id },
  } = req;

  const event = await Event.findById(id);

  if (!event) {
    next(new AppError('No event found with that ID.', 404));
    return;
  }

  if (event.organizer.valueOf() !== organizer) {
    next(new AppError('You are not the organizer of the event.', 403));
    return;
  }

  await Event.findByIdAndDelete(id);

  res.status(204).json({ status: 'success' });
});

exports.acceptInvitation = catchAsync(async (req, res, next) => {
  const {
    user: { id: userId },
    params: { eventId: id },
  } = req;

  const event = await Event.findById(id);

  if (!event) {
    next(new AppError('No event found with that ID.', 404));
    return;
  }

  if (event.organizer.valueOf() === userId) {
    next(new AppError("You're the organizer of this event.", 400));
    return;
  }

  const guests = event.guests?.map(objId => objId.valueOf()) || [];
  const attendees = event.attendees?.map(objId => objId.valueOf()) || [];

  const guestIndex = guests.indexOf(userId);

  if (guestIndex === -1) {
    const attendeeIndex = attendees.indexOf(userId);
    if (attendeeIndex === -1) {
      next(new AppError('You were not invited to this event.', 403));
      return;
    }
    next(
      new AppError('You already accepted to participate in this event.', 400)
    );
    return;
  }

  attendees.push(userId);
  guests.splice(guestIndex, 1);

  const updatedEvent = await Event.findByIdAndUpdate(
    id,
    { guests, attendees },
    {
      new: true,
    }
  );

  res.status(200).json({ status: 'success', data: { event: updatedEvent } });
});

exports.declineInvitation = catchAsync(async (req, res, next) => {
  const {
    user: { id: userId },
    params: { eventId: id },
  } = req;

  const event = await Event.findById(id);

  if (!event) {
    next(new AppError('No event found with that ID.', 404));
    return;
  }

  if (event.organizer.valueOf() === userId) {
    next(new AppError("You're the organizer of this event.", 400));
    return;
  }

  const guests = event.guests?.map(objId => objId.valueOf()) || [];
  const attendees = event.attendees?.map(objId => objId.valueOf()) || [];

  const guestIndex = guests.indexOf(userId);

  if (guestIndex === -1) {
    const attendeeIndex = attendees.indexOf(userId);
    if (attendeeIndex === -1) {
      next(new AppError('You are not a participant of this event.', 403));
      return;
    }

    attendees.splice(attendeeIndex, 1);
  } else guests.splice(guestIndex, 1);

  const updatedEvent = await Event.findByIdAndUpdate(
    id,
    { guests, attendees },
    {
      new: true,
    }
  );

  res.status(200).json({ status: 'success', data: { event: updatedEvent } });
});

exports.getToday = (req, res, next) => {
  const now = new Date();

  req.date = moment(formatDate(now)).tz(TIMEZONE).utc().format();

  next();
};

exports.getPreviousWeek = (req, res, next) => {
  const now = new Date();

  req.date = getPrevious(formatDate(now), 'weeks');
  next();
};

exports.getNextWeek = (req, res, next) => {
  const now = new Date();

  req.date = getNext(formatDate(now), 'weeks');

  next();
};

exports.getPreviousMonth = (req, res, next) => {
  const now = new Date();

  req.date = getPrevious(formatDate(now), 'months');
  next();
};

exports.getNextMonth = (req, res, next) => {
  const now = new Date();

  req.date = getNext(formatDate(now), 'months');

  next();
};

exports.getPreviousYear = (req, res, next) => {
  const now = new Date();

  req.date = getPrevious(formatDate(now), 'years');
  next();
};

exports.getNextYear = (req, res, next) => {
  const now = new Date();

  req.date = getNext(formatDate(now), 'years');

  next();
};

exports.getDate = catchAsync(async (req, res, next) => {
  const {
    params: { date },
  } = req;

  if (!isValidDate(date)) {
    next(
      new AppError('Please provide a valid date (Format: yyyy-mm-dd).', 400)
    );
    return;
  }

  req.date = moment(`${date} 00:00:00`).tz(TIMEZONE).utc().format();

  next();
});

exports.getEventsWeek = catchAsync(getEvents.bind(null, 'week'));

exports.getEventsMonth = catchAsync(getEvents.bind(null, 'month'));

exports.getEventsYear = catchAsync(getEvents.bind(null, 'year'));
