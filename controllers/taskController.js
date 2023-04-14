const Task = require('../models/taskModel');
const User = require('../models/userModel');
const AppError = require('../utils/classes/AppError');
const { catchAsync } = require('../utils/utils');

exports.getAllTasks = catchAsync(async (req, res, next) => {
  const {
    user: { id: performer },
  } = req;

  const tasks = await Task.find({ performer });

  res.status(200).json({
    status: 'success',
    data: { tasks },
  });
});

exports.createTask = catchAsync(async (req, res, next) => {
  const {
    user: { id: performer },
    body: { title },
  } = req;

  const newTask = await Task.create({ title, performer });

  res.status(201).json({ status: 'success', data: { task: newTask } });
});

exports.completeTask = catchAsync(async (req, res, next) => {
  const {
    user: { id: performer },
    params: { taskId: id },
  } = req;

  const task = await Task.findById(id);

  if (!task) {
    next(new AppError('No task found with that ID.', 404));
    return;
  }

  if (task.performer.valueOf() !== performer) {
    next(new AppError('You are not the performer of the task.', 403));
    return;
  }

  const updatedTask = await Task.findByIdAndUpdate(
    id,
    { done: true },
    { new: true }
  );

  res.status(200).json({ status: 'success', data: { task: updatedTask } });
});

exports.validateTask = catchAsync(async (req, res, next) => {
  const {
    user: { id: teacher },
    params: { taskId: id },
  } = req;

  const task = await Task.findById(id);

  if (!task) {
    next(new AppError('No task found with that ID.', 404));
    return;
  }

  const student = await User.findById(task.performer.valueOf()).select(
    'supervisor'
  );

  if (student.supervisor.valueOf() !== teacher) {
    next(
      new AppError(
        'You are not the supervisor of the student performing the task.',
        403
      )
    );
    return;
  }

  if (!task.done) {
    next(new AppError("You can't validate a non-completed task.", 400));
    return;
  }

  const updatedTask = await Task.findByIdAndUpdate(
    id,
    { validated: true, validator: teacher },
    { new: true }
  );

  res.status(200).json({ status: 'success', data: { task: updatedTask } });
});

exports.createTaskStudent = catchAsync(async (req, res, next) => {
  const {
    user: { id: teacher },
    params: { studentId: student },
    body: { title },
  } = req;

  const studentObj = await User.findById(student).select('supervisor');

  if (!student) {
    next(new AppError('No user found with that ID.', 404));
    return;
  }

  if (studentObj.supervisor.valueOf() !== teacher) {
    next(new AppError('You are not the supervisor of this student.', 403));
    return;
  }

  const newTask = await Task.create({ title, performer: student });

  res.status(201).json({ status: 'success', data: { task: newTask } });
});

exports.getValidatedStudentTasks = catchAsync(async (req, res, next) => {
  const {
    user: { id: teacher },
  } = req;

  const tasks = await Task.find({ validator: teacher });

  res.status(200).json({ status: 'success', data: { tasks } });
});

exports.getDoneStudentTasks = catchAsync(async (req, res, next) => {
  const {
    user: { supervised },
  } = req;

  const supervisedIds = supervised?.map(objId => objId.valueOf()) || [];

  const tasks = await Task.find({
    done: true,
    validated: false,
    performer: { $in: supervisedIds },
  });

  res.status(200).json({ status: 'success', data: { tasks } });
});

exports.getTodoStudentTasks = catchAsync(async (req, res, next) => {
  const {
    user: { supervised },
  } = req;

  const supervisedIds = supervised?.map(objId => objId.valueOf()) || [];

  const tasks = await Task.find({
    done: false,
    validated: false,
    performer: { $in: supervisedIds },
  });

  res.status(200).json({ status: 'success', data: { tasks } });
});
