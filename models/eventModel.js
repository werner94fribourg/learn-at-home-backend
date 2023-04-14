const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true,
    minLength: [1, 'A title must have at least 1 character.'],
    maxLength: [20, 'A title must have at most 20 characters.'],
  },
  description: {
    type: String,
    trim: true,
    required: true,
    minLength: [1, 'A description must have at least 1 character.'],
    maxLength: [255, 'A description must have at most 255 characters.'],
  },
  beginning: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
    validate: {
      validator: function (date) {
        return this.beginning.getTime() <= date.getTime();
      },
      message: "The end date can't happen before the beginning date.",
    },
  },
  organizer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  guests: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
  attendees: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
