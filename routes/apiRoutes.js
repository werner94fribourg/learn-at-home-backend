const express = require('express');
const userRouter = require('./api/userRoutes');
const messageRouter = require('./api/messageRoutes');
const teachingDemandRouter = require('./api/teachingDemandRoutes');
const eventRouter = require('./api/eventRoutes');
const taskRouter = require('./api/taskRoutes');

const router = express.Router();

router.use('/users', userRouter);

router.use('/messages', messageRouter);

router.use('/teaching-demands', teachingDemandRouter);

router.use('/events', eventRouter);

router.use('/tasks', taskRouter);

module.exports = router;
