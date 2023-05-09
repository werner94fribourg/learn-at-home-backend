const express = require('express');
const {
  protect,
  restrictTo,
  restrictToReceiver,
  checkOtherUser,
} = require('../../controllers/authController');
const {
  getConversation,
  sendMessage,
  uploadFiles,
  saveFiles,
  getLastMessages,
  getLastMessage,
  getTotalUnreadMessages,
  getUnreadFromUser,
  readMessage,
} = require('../../controllers/messageController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The id of the message
 *           example: 642ac5749a75c968494496a9
 *         content:
 *           type: string
 *           description: The content of the message
 *           example: Hi Cedric
 *         sent:
 *           type: string
 *           description: The creation date of the message
 *           example: 2023-04-03T12:24:20.358Z
 *         sender:
 *           type: object
 *           description: The sender of the message
 *           properties:
 *             _id:
 *               type: string
 *               description: The id of the sender
 *               example: 642199e8fcc9f9121f994dfr
 *             username:
 *               type: string
 *               description: The username of the sender
 *               example: werner94
 *             photo:
 *               type: string
 *               description: The profile picture of the sender
 *               example: default.jpg
 *         receiver:
 *           type: object
 *           description: The receiver of the message
 *           properties:
 *             _id:
 *               type: string
 *               description: The id of the receiver
 *               example: 642199c4fcc9f9121f994dfb
 *             username:
 *               type: string
 *               description: The username of the receiver
 *               example: werner94
 *             photo:
 *               type: string
 *               description: The profile picture of the receiver
 *               example: default.jpg
 *         files:
 *           type: array
 *           items:
 *            type: string
 *            description: An attached file of a message
 *            example: text.pdf
 *         read:
 *           type: boolean
 *           description: The read status of the message
 *           example: true
 */

router.use(protect, restrictTo('student', 'teacher'));

/**
 * @swagger
 * /messages/conversation/{userId}:
 *   get:
 *     tags:
 *       - Message
 *     summary: Route used to get a conversation with a specific user (accessible to teachers and students only)
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: 'The id of the user from whom we want to retrieve the conversation'
 *         schema:
 *           type: string
 *           example: 641c7de953f7dcad45936b4e
 *       - name: page
 *         in: query
 *         description: 'The page number we want to display in the array of results (page 1 by default)'
 *         schema:
 *           type: number
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: 'The number of elements per page we want to display (10 by default)'
 *         schema:
 *           type: number
 *           example: 10
 *     responses:
 *       200:
 *         description: The messages of the conversation with the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Message'
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             examples:
 *               invalidIdExample:
 *                 summary: Invalid id
 *                 value:
 *                   status: fail
 *                   message: "Invalid _id: 642199c4fcc9f9"
 *               selfConversationExample:
 *                 summary: Self conversation attempt
 *                 value:
 *                   status: fail
 *                   message: You can't get conversations with yourself.
 *               nonNumericalPaginationExample:
 *                 summary: Non numerical values for page and limit
 *                 value:
 *                   status: fail
 *                   message: please provide numerical values for pagination query variables (page and limit).
 *       401:
 *         description: User login problems
 *         content:
 *           application/json:
 *             examples:
 *               notLoggedInExample:
 *                 summary: User Not logged in
 *                 value:
 *                   status: fail
 *                   message: You are not logged in! Please log in to get access.
 *               accountNotFoundExample:
 *                 summary: Account not found or deleted
 *                 value:
 *                   status: fail
 *                   message: The requested account doesn't exist or was deleted.
 *               passwordChangedExample:
 *                 summary: Password changed after the token was issued
 *                 value:
 *                   status: fail
 *                   message: User recently changed password ! Please log in again.
 *       403:
 *         description: Forbidden access due to role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: You don't have permission to perform this action.
 *       404:
 *         description: Non existing resources
 *         content:
 *           application/json:
 *             examples:
 *               nonExistingUserExample:
 *                 summary: Non existing user
 *                 value:
 *                   status: fail
 *                   message: No user found with that ID.
 *               nonExistingPageExample:
 *                 summary: Non existing page
 *                 value:
 *                   status: fail
 *                   message: This page doesn't exist.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *     security:
 *       - bearerAuth: []
 *   post:
 *     tags:
 *       - Message
 *     summary: Route used to send a message to a specific user (accessible to teachers and students only)
 *     requestBody:
 *       description: The new user values
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              content:
 *                type: string
 *                description: The content of the message
 *                example: Hello
 *         multipart/form-data:
 *           schema:
 *            type: object
 *            properties:
 *              content:
 *                type: string
 *                description: The content of the message
 *                example: Hello
 *              files:
 *                type: array
 *                items:
 *                  type: string
 *                  description: The message's attached files
 *                  format: binary
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: 'The id of the user to whom we want to send a message'
 *         schema:
 *           type: string
 *           example: 641c7de953f7dcad45936b4e
 *     responses:
 *       201:
 *         description: The new sent message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       $ref: '#/components/schemas/Message'
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             examples:
 *               emptyContentExample:
 *                 summary: Empty content
 *                 value:
 *                   status: fail
 *                   message: The content can't be empty.
 *               invalidIdExample:
 *                 summary: Invalid id
 *                 value:
 *                   status: fail
 *                   message: "Invalid _id: 642199c4fcc9f9"
 *               selfConversationExample:
 *                 summary: Self conversation attempt
 *                 value:
 *                   status: fail
 *                   message: You can't get conversations with yourself.
 *       401:
 *         description: User login problems
 *         content:
 *           application/json:
 *             examples:
 *               notLoggedInExample:
 *                 summary: User Not logged in
 *                 value:
 *                   status: fail
 *                   message: You are not logged in! Please log in to get access.
 *               accountNotFoundExample:
 *                 summary: Account not found or deleted
 *                 value:
 *                   status: fail
 *                   message: The requested account doesn't exist or was deleted.
 *               passwordChangedExample:
 *                 summary: Password changed after the token was issued
 *                 value:
 *                   status: fail
 *                   message: User recently changed password ! Please log in again.
 *       403:
 *         description: Forbidden access due to role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: You don't have permission to perform this action.
 *       404:
 *         description: Non existing user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: No user found with that ID.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *     security:
 *       - bearerAuth: []
 */
router
  .route('/conversation/:userId')
  .get(checkOtherUser, getConversation)
  .post(checkOtherUser, uploadFiles, saveFiles, sendMessage);

/**
 * @swagger
 * /messages/last:
 *   get:
 *     tags:
 *       - Message
 *     summary: Route used to get all last messages with each user with whom the connected one had a conversation (accessible to teachers and students only)
 *     responses:
 *       200:
 *         description: All last messages with each user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: object
 *                             properties:
 *                               sender:
 *                                 type: string
 *                                 example: werner94
 *                               receiver:
 *                                 type: string
 *                                 example: werner95
 *                           sender:
 *                             type: string
 *                             example: 642199e8fcc9f9121f994dfr
 *                           senderPhoto:
 *                             type: string
 *                             example: default.png
 *                           receiver:
 *                             type: string
 *                             example: 642199e8fcc9f9121f994dfr
 *                           receiverPhoto:
 *                             type: string
 *                             example: default.png
 *                           sent:
 *                             type: string
 *                             description: The creation date of the message
 *                             example: 2023-04-03T12:24:20.358Z
 *                           files:
 *                             type: array
 *                             items:
 *                              type: string
 *                              description: An attached file of a message
 *                              example: text.pdf
 *                           content:
 *                             type: string
 *                             description: The content of the message
 *                             example: Hi Cedric
 *                           read:
 *                             type: boolean
 *                             description: The read status of the message
 *                             example: false
 *       401:
 *         description: User login problems
 *         content:
 *           application/json:
 *             examples:
 *               notLoggedInExample:
 *                 summary: User Not logged in
 *                 value:
 *                   status: fail
 *                   message: You are not logged in! Please log in to get access.
 *               accountNotFoundExample:
 *                 summary: Account not found or deleted
 *                 value:
 *                   status: fail
 *                   message: The requested account doesn't exist or was deleted.
 *               passwordChangedExample:
 *                 summary: Password changed after the token was issued
 *                 value:
 *                   status: fail
 *                   message: User recently changed password ! Please log in again.
 *       403:
 *         description: Forbidden access due to role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: You don't have permission to perform this action.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *     security:
 *       - bearerAuth: []
 */
router.route('/last').get(getLastMessages);

/**
 * @swagger
 * /messages/last/{userId}:
 *   get:
 *     tags:
 *       - Message
 *     summary: Route used to get the last message sent to / received from a specific user with whom the connected one had a conversation (accessible to teachers and students only)
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: 'The id of the user from whom we want to retrieve the last message'
 *         schema:
 *           type: string
 *           example: 641c7de953f7dcad45936b4e
 *     responses:
 *       200:
 *         description: The last message with the specified user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: object
 *                           properties:
 *                             sender:
 *                               type: string
 *                               example: werner94
 *                             receiver:
 *                               type: string
 *                               example: werner95
 *                         sender:
 *                           type: string
 *                           example: 642199e8fcc9f9121f994dfr
 *                         receiver:
 *                           type: string
 *                           example: 642199c4fcc9f9121f994dfb
 *                         sent:
 *                           type: string
 *                           description: The creation date of the message
 *                           example: 2023-04-03T12:24:20.358Z
 *                         files:
 *                           type: array
 *                           items:
 *                            type: string
 *                            description: An attached file of a message
 *                            example: text.pdf
 *                         content:
 *                           type: string
 *                           description: The content of the message
 *                           example: Hi Cedric
 *                         read:
 *                           type: boolean
 *                           description: The read status of the message
 *                           example: false
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             examples:
 *               invalidIdExample:
 *                 summary: Invalid id
 *                 value:
 *                   status: fail
 *                   message: "Invalid _id: 642199c4fcc9f9"
 *               selfConversationExample:
 *                 summary: Self conversation attempt
 *                 value:
 *                   status: fail
 *                   message: You can't get conversations with yourself.
 *       401:
 *         description: User login problems
 *         content:
 *           application/json:
 *             examples:
 *               notLoggedInExample:
 *                 summary: User Not logged in
 *                 value:
 *                   status: fail
 *                   message: You are not logged in! Please log in to get access.
 *               accountNotFoundExample:
 *                 summary: Account not found or deleted
 *                 value:
 *                   status: fail
 *                   message: The requested account doesn't exist or was deleted.
 *               passwordChangedExample:
 *                 summary: Password changed after the token was issued
 *                 value:
 *                   status: fail
 *                   message: User recently changed password ! Please log in again.
 *       403:
 *         description: Forbidden access due to role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: You don't have permission to perform this action.
 *       404:
 *         description: Non existing user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: No user found with that ID.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *     security:
 *       - bearerAuth: []
 */
router.route('/last/:userId').get(checkOtherUser, getLastMessage);

/**
 * @swagger
 * /messages/unread:
 *   get:
 *     tags:
 *       - Message
 *     summary: Route used to get the number of unread messages for the connected user (accessible to teachers and students only)
 *     responses:
 *       200:
 *         description: The total number of unread messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     unread:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           nullable: true
 *                           example: null
 *                         count:
 *                           type: number
 *                           example: 3
 *       401:
 *         description: User login problems
 *         content:
 *           application/json:
 *             examples:
 *               notLoggedInExample:
 *                 summary: User Not logged in
 *                 value:
 *                   status: fail
 *                   message: You are not logged in! Please log in to get access.
 *               accountNotFoundExample:
 *                 summary: Account not found or deleted
 *                 value:
 *                   status: fail
 *                   message: The requested account doesn't exist or was deleted.
 *               passwordChangedExample:
 *                 summary: Password changed after the token was issued
 *                 value:
 *                   status: fail
 *                   message: User recently changed password ! Please log in again.
 *       403:
 *         description: Forbidden access due to role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: You don't have permission to perform this action.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *     security:
 *       - bearerAuth: []
 */
router.route('/unread').get(getTotalUnreadMessages);

/**
 * @swagger
 * /messages/unread/{userId}:
 *   get:
 *     tags:
 *       - Message
 *     summary: Route used to get the number of unread messages in a conversation with a specific user (accessible to teachers and students only)
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: 'The id of the user from whom we want to retrieve the number of unread messages'
 *         schema:
 *           type: string
 *           example: 641c7de953f7dcad45936b4e
 *     responses:
 *       200:
 *         description: The total number of unread messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     unread:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           nullable: true
 *                           example: null
 *                         count:
 *                           type: number
 *                           example: 3
 *       401:
 *         description: User login problems
 *         content:
 *           application/json:
 *             examples:
 *               notLoggedInExample:
 *                 summary: User Not logged in
 *                 value:
 *                   status: fail
 *                   message: You are not logged in! Please log in to get access.
 *               accountNotFoundExample:
 *                 summary: Account not found or deleted
 *                 value:
 *                   status: fail
 *                   message: The requested account doesn't exist or was deleted.
 *               passwordChangedExample:
 *                 summary: Password changed after the token was issued
 *                 value:
 *                   status: fail
 *                   message: User recently changed password ! Please log in again.
 *       403:
 *         description: Forbidden access due to role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: You don't have permission to perform this action.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *     security:
 *       - bearerAuth: []
 */
router.route('/unread/:userId').get(checkOtherUser, getUnreadFromUser);

/**
 * @swagger
 * /messages/{messageId}/read:
 *   patch:
 *     tags:
 *       - Message
 *     summary: Route used to change the read status of a message (accessible to teachers and students only)
 *     parameters:
 *       - name: messageId
 *         in: path
 *         description: 'The id of the message we want to change the status'
 *         schema:
 *           type: string
 *           example: 6421b2594d4cf0e124083e74
 *     responses:
 *       200:
 *         description: The read message with the read status updated to true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       $ref: '#/components/schemas/Message'
 *       401:
 *         description: User login problems
 *         content:
 *           application/json:
 *             examples:
 *               notLoggedInExample:
 *                 summary: User Not logged in
 *                 value:
 *                   status: fail
 *                   message: You are not logged in! Please log in to get access.
 *               accountNotFoundExample:
 *                 summary: Account not found or deleted
 *                 value:
 *                   status: fail
 *                   message: The requested account doesn't exist or was deleted.
 *               passwordChangedExample:
 *                 summary: Password changed after the token was issued
 *                 value:
 *                   status: fail
 *                   message: User recently changed password ! Please log in again.
 *       403:
 *         description: Forbidden accesses
 *         content:
 *           application/json:
 *             examples:
 *               forbiddenAccessExample:
 *                 summary: Forbidden access due to role
 *                 value:
 *                   status: fail
 *                   message: You don't have permission to perform this action.
 *               nonReceiverExample:
 *                 summary: User is not the receiver of the message
 *                 value:
 *                   status: fail
 *                   message: You can't read messages of which you are not the receiver.
 *       404:
 *         description: Non existing message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: fail
 *                 message:
 *                   type: string
 *                   example: No message found with that ID.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *     security:
 *       - bearerAuth: []
 */
router.route('/:messageId/read').patch(restrictToReceiver, readMessage);

module.exports = router;
