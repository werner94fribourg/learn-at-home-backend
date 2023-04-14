const mongoose = require('mongoose');

const teachingDemandSchema = mongoose.Schema({
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
  accepted: {
    type: Boolean,
    default: false,
    required: true,
  },
  cancelled: {
    type: Boolean,
    default: false,
    required: true,
  },
});

const TeachingDemand = mongoose.model('Teaching_demand', teachingDemandSchema);

module.exports = TeachingDemand;
