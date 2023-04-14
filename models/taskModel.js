const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true,
    minLength: [1, 'A title must have at least 1 character.'],
    maxLength: [20, 'A title must have at most 20 characters.'],
  },
  performer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  done: {
    type: Boolean,
    required: true,
    default: false,
  },
  validated: {
    type: Boolean,
    required: true,
    default: false,
  },
  validator: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
