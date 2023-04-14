const express = require('express');
const { protect, restrictTo } = require('../../controllers/authController');
const {
  getAllEvents,
  createEvent,
  updateEvent,
  getEvent,
  deleteEvent,
  acceptInvitation,
  declineInvitation,
  getToday,
  getDate,
  getEventsWeek,
  getPreviousWeek,
  getNextWeek,
  getEventsMonth,
  getPreviousMonth,
  getNextMonth,
  getEventsYear,
  getPreviousYear,
  getNextYear,
} = require('../../controllers/eventController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Event:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The id of the event
 *           example: 64244f5f8eab95f9096a72b9
 *         title:
 *           type: string
 *           description: The title of the event
 *           example: Event Test
 *         description:
 *           type: string
 *           description: The description of the event
 *           example: This is a test for creating events
 *         beginning:
 *           type: string
 *           description: The beginning time of the event
 *           example: 2022-02-28T21:00:00.000Z
 *         end:
 *           type: string
 *           description: The end time of the event
 *           example: 2023-02-28T22:59:00.000Z
 *         organizer:
 *           type: object
 *           description: The user organizing the event
 *           properties:
 *             _id:
 *               type: string
 *               example: 642199e8fcc9f9121f994dfr
 *             username:
 *               type: string
 *               example: werner96
 *         guests:
 *           type: array
 *           description: The user invited to the event that didn't confirm their participation
 *           items:
 *             type: string
 *             description: The id of an user
 *             example: 642199c4fcc9f9121f994dfb
 *         attendees:
 *           type: array
 *           description: The user invited to the event that confirmed their participation
 *           items:
 *             type: string
 *             description: The id of an user
 *             example: 642199e8fcc9f9121f994df3
 */

router.use(protect, restrictTo('student', 'teacher'));

/**
 * @swagger
 * /events:
 *   get:
 *     tags:
 *       - Event
 *     summary: Route used to get the existing events of a specific user (accessible to students and teachers only)
 *     parameters:
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
 *         description: The events of the user
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
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 *       400:
 *         description: Non numerical values for page and limit
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
 *                   example: please provide numerical values for pagination query variables (page and limit).
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
 *         description: Non existing page
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
 *                   example: This page doesn't exist.
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
 *       - Event
 *     summary: Route used to create a new event (accessible to students and teachers only)
 *     requestBody:
 *       description: The new event values
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              title:
 *                type: string
 *                description: The title of the event
 *                example: Next Sunday
 *              description:
 *                type: string
 *                description: The description of the event
 *                example: This is a test for creating events
 *              beginningDate:
 *                type: string
 *                description: The beginning date of the event
 *                example: 2023-05-10
 *              beginningTime:
 *                type: string
 *                description: The beginning time of the event
 *                example: 22:00
 *              endDate:
 *                type: string
 *                description: The end date of the event
 *                example: 2023-05-10
 *              endTime:
 *                type: string
 *                description: The end time of the event
 *                example: 23:00
 *              guests:
 *                type: array
 *                description: The user invited to the event
 *                items:
 *                  type: string
 *                  description: The id of an user
 *                  example: 642199c4fcc9f9121f994dfb
 *     responses:
 *       201:
 *         description: The new created event
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
 *                     event:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           description: The id of the event
 *                           example: 64244f5f8eab95f9096a72b9
 *                         title:
 *                           type: string
 *                           description: The title of the event
 *                           example: Event Test
 *                         description:
 *                           type: string
 *                           description: The description of the event
 *                           example: This is a test for creating events
 *                         beginning:
 *                           type: string
 *                           description: The beginning time of the event
 *                           example: 2022-02-28T21:00:00.000Z
 *                         end:
 *                           type: string
 *                           description: The end time of the event
 *                           example: 2023-02-28T22:59:00.000Z
 *                         organizer:
 *                           type: object
 *                           description: The user organizing the event
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: 642199e8fcc9f9121f994dfr
 *                             username:
 *                               type: string
 *                               example: werner96
 *                         guests:
 *                           type: array
 *                           description: The user invited to the event that didn't confirm their participation
 *                           items:
 *                             type: string
 *                             description: The id of an user
 *                             example: 642199c4fcc9f9121f994dfb
 *                         attendees:
 *                           type: array
 *                           description: The user invited to the event that confirmed their participation
 *                           example: []
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             examples:
 *               nonExistingGuestExample:
 *                 summary: Non existing user as a guest
 *                 value:
 *                   status: fail
 *                   message: "You can't invite non existing guests to an event."
 *               organizerGuestExample:
 *                 summary: Organizer as a guest
 *                 value:
 *                   status: fail
 *                   message: You can't be invited to an event you organize.
 *               invalidBeginningDateExample:
 *                 summary: Invalid beginning date
 *                 value:
 *                   status: fail
 *                   message: Please provide a valid date for the beginning of your event.
 *               invalidBeginningTimeExample:
 *                 summary: Invalid beginning time
 *                 value:
 *                   status: fail
 *                   message: Please provide a valid time for the beginning of your event.
 *               invalidEndDateExample:
 *                 summary: Invalid end date
 *                 value:
 *                   status: fail
 *                   message: Please provide a valid date for the end of your event.
 *               invalidEndTimeExample:
 *                 summary: Invalid end time
 *                 value:
 *                   status: fail
 *                   message: Please provide a valid time for the end of your event.
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
router.route('/').get(getAllEvents).post(createEvent);

/**
 * @swagger
 * /events/week/today:
 *   get:
 *     tags:
 *       - Event
 *     summary: Route used to get the existing events of a specific user in today's week (accessible to students and teachers only)
 *     responses:
 *       200:
 *         description: The events of the user
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
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
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
router.route('/week/today').get(getToday, getEventsWeek);

/**
 * @swagger
 * /events/week/previous:
 *   get:
 *     tags:
 *       - Event
 *     summary: Route used to get the existing events of a specific user in today's previous week (accessible to students and teachers only)
 *     responses:
 *       200:
 *         description: The events of the user
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
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
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
router.route('/week/previous').get(getPreviousWeek, getEventsWeek);

/**
 * @swagger
 * /events/week/next:
 *   get:
 *     tags:
 *       - Event
 *     summary: Route used to get the existing events of a specific user in today's next week (accessible to students and teachers only)
 *     responses:
 *       200:
 *         description: The events of the user
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
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
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
router.route('/week/next').get(getNextWeek, getEventsWeek);

/**
 * @swagger
 * /events/week/{date}:
 *   get:
 *     tags:
 *       - Event
 *     summary: Route used to get the existing events of a specific user in date's week (accessible to students and teachers only)
 *     parameters:
 *       - name: date
 *         in: path
 *         description: 'The date from which we want to retrieve the events of the week (yyyy-mm-dd format)'
 *         schema:
 *           type: string
 *           example: 2023-04-02
 *     responses:
 *       200:
 *         description: The events of the user
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
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 *       400:
 *         description: Invalid date
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
 *                   example: "Please provide a valid date (Format: yyyy-mm-dd)."
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
router.route('/week/:date').get(getDate, getEventsWeek);

/**
 * @swagger
 * /events/month/today:
 *   get:
 *     tags:
 *       - Event
 *     summary: Route used to get the existing events of a specific user in today's month (accessible to students and teachers only)
 *     responses:
 *       200:
 *         description: The events of the user
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
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
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
router.route('/month/today').get(getToday, getEventsMonth);

/**
 * @swagger
 * /events/month/previous:
 *   get:
 *     tags:
 *       - Event
 *     summary: Route used to get the existing events of a specific user in today's previous month (accessible to students and teachers only)
 *     responses:
 *       200:
 *         description: The events of the user
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
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
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
router.route('/month/previous').get(getPreviousMonth, getEventsMonth);

/**
 * @swagger
 * /events/month/next:
 *   get:
 *     tags:
 *       - Event
 *     summary: Route used to get the existing events of a specific user in today's next month (accessible to students and teachers only)
 *     responses:
 *       200:
 *         description: The events of the user
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
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
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
router.route('/month/next').get(getNextMonth, getEventsMonth);

/**
 * @swagger
 * /events/month/{date}:
 *   get:
 *     tags:
 *       - Event
 *     summary: Route used to get the existing events of a specific user in date's month (accessible to students and teachers only)
 *     parameters:
 *       - name: date
 *         in: path
 *         description: 'The date from which we want to retrieve the events of the month (yyyy-mm-dd format)'
 *         schema:
 *           type: string
 *           example: 2023-04-02
 *     responses:
 *       200:
 *         description: The events of the user
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
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 *       400:
 *         description: Invalid date
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
 *                   example: "Please provide a valid date (Format: yyyy-mm-dd)."
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
router.route('/month/:date').get(getDate, getEventsMonth);

/**
 * @swagger
 * /events/year/today:
 *   get:
 *     tags:
 *       - Event
 *     summary: Route used to get the existing events of a specific user in today's year (accessible to students and teachers only)
 *     responses:
 *       200:
 *         description: The events of the user
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
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
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
router.route('/year/today').get(getToday, getEventsYear);

/**
 * @swagger
 * /events/year/previous:
 *   get:
 *     tags:
 *       - Event
 *     summary: Route used to get the existing events of a specific user in today's previous year (accessible to students and teachers only)
 *     responses:
 *       200:
 *         description: The events of the user
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
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
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
router.route('/year/previous').get(getPreviousYear, getEventsYear);

/**
 * @swagger
 * /events/year/next:
 *   get:
 *     tags:
 *       - Event
 *     summary: Route used to get the existing events of a specific user in today's next year (accessible to students and teachers only)
 *     responses:
 *       200:
 *         description: The events of the user
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
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
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
router.route('/year/next').get(getNextYear, getEventsYear);

/**
 * @swagger
 * /events/year/{date}:
 *   get:
 *     tags:
 *       - Event
 *     summary: Route used to get the existing events of a specific user in date's year (accessible to students and teachers only)
 *     parameters:
 *       - name: date
 *         in: path
 *         description: 'The date from which we want to retrieve the events of the year (yyyy-mm-dd format)'
 *         schema:
 *           type: string
 *           example: 2023-04-02
 *     responses:
 *       200:
 *         description: The events of the user
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
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 *       400:
 *         description: Invalid date
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
 *                   example: "Please provide a valid date (Format: yyyy-mm-dd)."
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
router.route('/year/:date').get(getDate, getEventsYear);

/**
 * @swagger
 * /events/{eventId}:
 *   get:
 *     tags:
 *       - Event
 *     summary: Route used to get a specific event (accessible to students and teachers only)
 *     parameters:
 *       - name: eventId
 *         in: path
 *         description: 'The id of the event we want to retrieve'
 *         schema:
 *           type: string
 *           example: 64244f5f8eab95f9096a72b8
 *     responses:
 *       200:
 *         description: The event of the user
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
 *                     event:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           description: The id of the event
 *                           example: 64244f5f8eab95f9096a72b9
 *                         title:
 *                           type: string
 *                           description: The title of the event
 *                           example: Event Test
 *                         description:
 *                           type: string
 *                           description: The description of the event
 *                           example: This is a test for creating events
 *                         beginning:
 *                           type: string
 *                           description: The beginning time of the event
 *                           example: 2022-02-28T21:00:00.000Z
 *                         end:
 *                           type: string
 *                           description: The end time of the event
 *                           example: 2023-02-28T22:59:00.000Z
 *                         organizer:
 *                           type: object
 *                           description: The user organizing the event
 *                           properties:
 *                             _id:
 *                               type: string
 *                               example: 642199e8fcc9f9121f994dfr
 *                             username:
 *                               type: string
 *                               example: werner96
 *                         guests:
 *                           type: array
 *                           description: The user invited to the event that didn't confirm their participation
 *                           items:
 *                             type: object
 *                             description: The user invited to the event
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: 642199c4fcc9f9121f994dfb
 *                               username:
 *                                 type: string
 *                                 example: werner94
 *                         attendees:
 *                           type: array
 *                           description: The user invited to the event that confirmed their participation
 *                           items:
 *                             type: object
 *                             description: The user invited to the event
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: 642199e8fcc9f9121f994df3
 *                               username:
 *                                 type: string
 *                                 example: werner95
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
 *         description: Non existing event
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
 *                   example: No event found with that ID.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *     security:
 *       - bearerAuth: []
 *   patch:
 *     tags:
 *       - Event
 *     summary: Route used to modify an existing event (accessible to students and teachers only)
 *     parameters:
 *       - name: eventId
 *         in: path
 *         description: 'The id of the event we want to modify'
 *         schema:
 *           type: string
 *           example: 64244f5f8eab95f9096a72b8
 *     requestBody:
 *       description: The updated values of the event
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              title:
 *                type: string
 *                description: The title of the event
 *                example: Next Sunday
 *              description:
 *                type: string
 *                description: The description of the event
 *                example: This is a test for creating events
 *              beginningDate:
 *                type: string
 *                description: The beginning date of the event
 *                example: 2023-05-10
 *              beginningTime:
 *                type: string
 *                description: The beginning time of the event
 *                example: 22:00
 *              endDate:
 *                type: string
 *                description: The end date of the event
 *                example: 2023-05-10
 *              endTime:
 *                type: string
 *                description: The end time of the event
 *                example: 23:00
 *              guests:
 *                type: array
 *                description: The user invited to the event
 *                items:
 *                  type: string
 *                  description: The id of an user
 *                  example: 642199c4fcc9f9121f994dfb
 *              attendees:
 *                type: array
 *                description: The user attending the event
 *                items:
 *                  type: string
 *                  description: The id of an user
 *                  example: 642199e8fcc9f9121f994df3
 *     responses:
 *       200:
 *         description: The updated event
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
 *                     event:
 *                       $ref: '#/components/schemas/Event'
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
 *               nonExistingGuestExample:
 *                 summary: Non existing user as a guest
 *                 value:
 *                   status: fail
 *                   message: "You can't invite non existing guests to an event."
 *               organizerGuestExample:
 *                 summary: Organizer as a guest
 *                 value:
 *                   status: fail
 *                   message: You can't be invited to an event you organize.
 *               nonExistingAttendeeExample:
 *                 summary: Non existing user as a attendee
 *                 value:
 *                   status: fail
 *                   message: "A non-existing user can't attend an event."
 *               organizerAttendeeExample:
 *                 summary: Organizer as a attendee
 *                 value:
 *                   status: fail
 *                   message: You can't be an attendee of an event you organize.
 *               invalidBeginningDateExample:
 *                 summary: Invalid beginning date
 *                 value:
 *                   status: fail
 *                   message: Please provide a valid date for the beginning of your event.
 *               invalidBeginningTimeExample:
 *                 summary: Invalid beginning time
 *                 value:
 *                   status: fail
 *                   message: Please provide a valid time for the beginning of your event.
 *               invalidEndDateExample:
 *                 summary: Invalid end date
 *                 value:
 *                   status: fail
 *                   message: Please provide a valid date for the end of your event.
 *               invalidEndTimeExample:
 *                 summary: Invalid end time
 *                 value:
 *                   status: fail
 *                   message: Please provide a valid time for the end of your event.
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
 *               accountNotFoundExample:
 *                 summary: Event not organized by the user
 *                 value:
 *                   status: fail
 *                   message: You are not the organizer of the event.
 *       404:
 *         description: Non existing event
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
 *                   example: No event found with that ID.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     tags:
 *       - Event
 *     summary: Route used to delete an event (accessible to students and teachers only)
 *     responses:
 *       204:
 *         description: Successful deletion
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
 *               accountNotFoundExample:
 *                 summary: Event not organized by the user
 *                 value:
 *                   status: fail
 *                   message: You are not the organizer of the event.
 *       404:
 *         description: Non existing event
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
 *                   example: No event found with that ID.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *     security:
 *       - bearerAuth: []
 */
router.route('/:eventId').get(getEvent).patch(updateEvent).delete(deleteEvent);

/**
 * @swagger
 * /events/{eventId}/accept:
 *   patch:
 *     tags:
 *       - Event
 *     summary: Route used to accept an invitation to an event (accessible to students and teachers only)
 *     parameters:
 *       - name: eventId
 *         in: path
 *         description: 'The id of the event to which we want to accept the invitation'
 *         schema:
 *           type: string
 *           example: 64244f5f8eab95f9096a72b8
 *     responses:
 *       200:
 *         description: The updated event
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
 *                     event:
 *                       $ref: '#/components/schemas/Event'
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
 *               organizerUserExample:
 *                 summary: User organizer of the event
 *                 value:
 *                   status: fail
 *                   message: You're the organizer of this event.
 *               invitationAcceptedExample:
 *                 summary: User already accepted the event
 *                 value:
 *                   status: fail
 *                   message: You already accepted to participate in this event.
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
 *               notInvitedFoundExample:
 *                 summary: User not invited to the event
 *                 value:
 *                   status: fail
 *                   message: You were not invited to this event.
 *       404:
 *         description: Non existing event
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
 *                   example: No event found with that ID.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *     security:
 *       - bearerAuth: []
 */
router.route('/:eventId/accept').patch(acceptInvitation);

/**
 * @swagger
 * /events/{eventId}/refuse:
 *   patch:
 *     tags:
 *       - Event
 *     summary: Route used to decline an invitation to an event (accessible to students and teachers only)
 *     parameters:
 *       - name: eventId
 *         in: path
 *         description: 'The id of the event to which we want to decline the invitation'
 *         schema:
 *           type: string
 *           example: 64244f5f8eab95f9096a72b8
 *     responses:
 *       200:
 *         description: The updated event
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
 *                     event:
 *                       $ref: '#/components/schemas/Event'
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
 *               organizerUserExample:
 *                 summary: User organizer of the event
 *                 value:
 *                   status: fail
 *                   message: You're the organizer of this event.
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
 *               notInvitedFoundExample:
 *                 summary: User not participant to the event
 *                 value:
 *                   status: fail
 *                   message: You are not a participant of this event.
 *       404:
 *         description: Non existing event
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
 *                   example: No event found with that ID.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *     security:
 *       - bearerAuth: []
 */
router.route('/:eventId/refuse').patch(declineInvitation);

module.exports = router;
