const fs = require('fs');
const { ObjectId } = require('mongodb');
const { default: mkdirp } = require('mkdirp');
const path = require('path');
const sharp = require('sharp');
const { promisify } = require('util');
const Message = require('../models/messageModel');
const AppError = require('../utils/classes/AppError');
const {
  CONVERSATIONS_FOLDER,
  LAST_AGGR_OBJ,
  UNREAD_AGGR_OBJ,
} = require('../utils/globals');
const {
  catchAsync,
  uploadMessageFiles,
  getLastMessagesBetweenTwoUsers,
} = require('../utils/utils');

exports.getConversation = catchAsync(async (req, res, next) => {
  const {
    otherUser: { id: receiver },
    user: { id: sender },
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

  const conversation = await Message.find({
    $or: [
      { sender: { $in: [sender, receiver] } },
      { receiver: { $in: [sender, receiver] } },
    ],
  })
    .sort({ sent: 'desc' })
    .populate({
      path: 'sender',
      select: '_id username photo',
    })
    .populate({
      path: 'receiver',
      select: '_id username photo',
    })
    .skip(+skip)
    .limit(+limit);

  if (conversation.length === 0 && +page > 1) {
    next(new AppError("This page doesn't exist.", 404));
    return;
  }

  res.status(200).json({
    status: 'success',
    data: { messages: conversation },
  });
});

exports.sendMessage = catchAsync(async (req, res, next) => {
  const {
    body: { content, files },
    params: { userId: receiver },
    user: { id: sender },
  } = req;

  if (!files?.length && !content?.trim().length) {
    next(new AppError("The content can't be empty.", 400));
  }

  const lastMessage = await Message.findOne({
    $or: [
      { $and: [{ sender }, { receiver }] },
      { $and: [{ sender: receiver }, { receiver: sender }] },
    ],
  })
    .select('indexMessage')
    .sort({ sent: -1 })
    .limit(1);

  const newMessage = await Message.create({
    content,
    sender,
    receiver,
    sent: Date.now(),
    indexMessage: lastMessage ? ++lastMessage.indexMessage : 1,
    files,
  });

  res.status(201).json({
    status: 'success',
    data: { message: newMessage },
  });
});

exports.getLastMessage = catchAsync(async (req, res, next) => {
  const {
    otherUser: { id: otherId },
    user: { id: userId },
  } = req;

  const userObjectId = new ObjectId(userId);

  const otherObjectId = new ObjectId(otherId);

  const queryMessages = await Message.aggregate([
    {
      $match: {
        $or: [
          {
            $and: [
              {
                sender: userObjectId,
              },
              {
                receiver: otherObjectId,
              },
            ],
          },
          {
            $and: [
              {
                sender: otherObjectId,
              },
              {
                receiver: userObjectId,
              },
            ],
          },
        ],
      },
    },
    ...LAST_AGGR_OBJ,
  ]);

  const [message] = getLastMessagesBetweenTwoUsers(queryMessages);

  res.status(200).json({
    status: 'success',
    data: {
      message,
    },
  });
});

exports.getLastMessages = catchAsync(async (req, res, next) => {
  const {
    user: { id },
  } = req;

  const userObjectId = new ObjectId(id);
  const queryMessages = await Message.aggregate([
    {
      $match: {
        $or: [
          {
            sender: userObjectId,
          },
          {
            receiver: userObjectId,
          },
        ],
      },
    },
    ...LAST_AGGR_OBJ,
  ]);

  const messages = getLastMessagesBetweenTwoUsers(queryMessages);

  res.status(200).json({
    status: 'success',
    data: {
      messages,
    },
  });
});

exports.getUnreadFromUser = catchAsync(async (req, res, next) => {
  const {
    otherUser: { id: sender },
    user: { id: receiver },
  } = req;

  const senderObjectId = new ObjectId(sender);
  const receiverObjectId = new ObjectId(receiver);

  const [unread] = await Message.aggregate([
    {
      $match: {
        $and: [{ sender: senderObjectId }, { receiver: receiverObjectId }],
      },
    },
    ...UNREAD_AGGR_OBJ,
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      unread,
    },
  });
});

exports.getTotalUnreadMessages = catchAsync(async (req, res, next) => {
  const {
    user: { id },
  } = req;

  const userObjectId = new ObjectId(id);
  const [unread] = await Message.aggregate([
    {
      $match: {
        receiver: userObjectId,
      },
    },
    ...UNREAD_AGGR_OBJ,
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      unread,
    },
  });
});

exports.readMessage = catchAsync(async (req, res, next) => {
  const {
    message: { id },
  } = req;

  const updatedMessage = await Message.findByIdAndUpdate(
    id,
    { read: true },
    { new: true, runValidators: false }
  );

  res
    .status(200)
    .json({ status: 'success', data: { message: updatedMessage } });
});

exports.uploadFiles = uploadMessageFiles.array('files', 10);

exports.saveFiles = catchAsync(async (req, res, next) => {
  const {
    params: { userId: receiver },
    user: { id: sender },
  } = req;
  const { files } = req;

  if (!files) {
    next();
    return;
  }

  const conversationFolder = [sender, receiver]
    .sort((sender, receiver) => (sender < receiver ? 1 : -1))
    .join('_');

  req.body.files = [];

  await Promise.all(
    files.map(async file => {
      const { originalname } = file;
      const extension = path.extname(originalname);
      const filename = originalname.slice(0, -extension.length);
      let retry = true;
      let fileCount = 0;
      let fileString;
      while (retry) {
        fileString = fileCount
          ? `${filename}(${fileCount})${extension}`
          : filename + extension;
        const folder = `${CONVERSATIONS_FOLDER}/${conversationFolder}`;
        const location = `${folder}/${fileString}`;
        try {
          await promisify(fs.access)(location, fs.F_OK);
          ++fileCount;
        } catch (err) {
          await mkdirp(folder);
          await sharp(file.buffer)
            .toFormat(extension.slice(1))
            .toFile(location);
          retry = false;
          req.body.files.push(`${conversationFolder}/${fileString}`);
        }
      }
    })
  );
  next();
});
