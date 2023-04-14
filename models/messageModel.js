const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({
  content: {
    type: String,
    trim: true,
    maxLength: [255, 'A content must have at most 255 characters'],
  },
  sent: {
    type: Date,
    default: Date.now(),
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  files: [String],
  indexMessage: {
    type: Number,
    required: true,
    select: false,
  },
  read: {
    type: Boolean,
    default: false,
  },
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
