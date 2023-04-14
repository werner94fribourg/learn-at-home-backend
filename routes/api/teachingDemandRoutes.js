const express = require('express');
const {
  protect,
  restrictTo,
  restrictReceiverToTeacher,
} = require('../../controllers/authController');
const {
  getDemand,
  sendDemand,
  acceptDemand,
  cancelDemand,
} = require('../../controllers/teachingDemandController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     TeachingDemand:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The id of the teaching demand
 *           example: 642ad71c39c0a38fed5b4d48
 *         sent:
 *           type: string
 *           description: The creation date of the teaching demand
 *           example: 2023-04-03T12:24:20.358Z
 *         sender:
 *           type: string
 *           description: The id of the sender of the teaching demand
 *           example: 642199e8fcc9f9121f994dfr
 *         receiver:
 *           type: string
 *           description: The id of the receiver of the teaching demand
 *           example: 642199c4fcc9f9121f994dfb
 *         accepted:
 *           type: boolean
 *           description: The acceptation status of the teaching demand
 *           example: true
 *         cancelled:
 *           type: boolean
 *           description: The cancellation status of the teaching demand
 *           example: false
 */

router.use(protect);

/**
 * @swagger
 * /teaching-demands/user/{userId}:
 *   get:
 *     tags:
 *       - Teaching Demand
 *     summary: Route used to get a teaching demand with another user (restricted to student and teacher)
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: 'The id of the user with whom we want to retrieve the teaching demand'
 *         schema:
 *           type: string
 *           example: 641c7de953f7dcad45936b4e
 *     responses:
 *       200:
 *         description: The teaching demand involving the connected user and the other one
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
 *                     teachingDemand:
 *                       nullable: true
 *                       $ref: '#/components/schemas/TeachingDemand'
 *       400:
 *         description: Invalid id
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
 *                   example: "Invalid receiver: 642199c4fcc9f9"
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
 *   post:
 *     tags:
 *       - Teaching Demand
 *     summary: Route used to send a new teaching demand to a teacher (accessible to students only)
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: 'The id of the teacher to whom we want to send a teaching demand'
 *         schema:
 *           type: string
 *           example: 641c7de953f7dcad45936b4e
 *     responses:
 *       201:
 *         description: The new created teaching demand
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
 *                     teachingDemand:
 *                       $ref: '#/components/schemas/TeachingDemand'
 *       400:
 *         description: Invalid id
 *         content:
 *           application/json:
 *             examples:
 *               invalidIdExample:
 *                 summary: Invalid id (format)
 *                 value:
 *                   status: fail
 *                   message: "Invalid receiver: 642199c4fcc9f9"
 *               nonTeacherExample:
 *                 summary: Teaching demand sent to a non-teacher user
 *                 value:
 *                   status: fail
 *                   message: You can't send a teaching demand to an user that is not a teacher.
 *               collaboratingTeacherExample:
 *                 summary: Existing teaching collaboration with the user
 *                 value:
 *                   status: fail
 *                   message: You are already collaborating with this teacher.
 *               pendingDemandExample:
 *                 summary: Existing pending teaching collaboration with the user
 *                 value:
 *                   status: fail
 *                   message: There is a pending teaching request sent to this teacher.
 *               approvedDemandExample:
 *                 summary: Existing mentor for the student
 *                 value:
 *                   status: fail
 *                   message: You can't have multiple mentors.
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
router
  .route('/user/:userId')
  .get(restrictTo('student', 'teacher'), getDemand)
  .post(restrictTo('student'), restrictReceiverToTeacher, sendDemand);

/**
 * @swagger
 * /teaching-demands/{demandId}/accept:
 *   patch:
 *     tags:
 *       - Teaching Demand
 *     summary: Route used to accept a pending teaching demand (accessible to teachers only)
 *     parameters:
 *       - name: demandId
 *         in: path
 *         description: 'The id of the demand we want to accept'
 *         schema:
 *           type: string
 *           example: 642ad71c39c0a38fed5b4d41
 *     responses:
 *       200:
 *         description: The updated teaching demand
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
 *                     teachingDemand:
 *                       $ref: '#/components/schemas/TeachingDemand'
 *       400:
 *         description: Invalid id
 *         content:
 *           application/json:
 *             examples:
 *               invalidIdExample:
 *                 summary: Invalid id (format)
 *                 value:
 *                   status: fail
 *                   message: "Invalid _id: 642199c4fcc9f9"
 *               cancelledDemandExample:
 *                 summary: Cancelled demand acceptation attempt
 *                 value:
 *                   status: fail
 *                   message: You can't accept demands that were cancelled.
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
 *         description: Forbidden access
 *         content:
 *           application/json:
 *             examples:
 *               roleAccessExample:
 *                 summary: Forbidden access due to role
 *                 value:
 *                   status: fail
 *                   message: You don't have permission to perform this action.
 *               notReceiverExample:
 *                 summary: Not the receiver of the demand
 *                 value:
 *                   status: fail
 *                   message: You can't accept demands that weren't sent to you.
 *       404:
 *         description: Non existing teaching demand
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
 *                   example: No teaching demand found with that ID.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *     security:
 *       - bearerAuth: []
 */
router.route('/:demandId/accept').patch(restrictTo('teacher'), acceptDemand);

/**
 * @swagger
 * /teaching-demands/{demandId}/cancel:
 *   patch:
 *     tags:
 *       - Teaching Demand
 *     summary: Route used to cancel a pending teaching demand (accessible to students and teachers only)
 *     parameters:
 *       - name: demandId
 *         in: path
 *         description: 'The id of the demand we want to cancel'
 *         schema:
 *           type: string
 *           example: 642ad71c39c0a38fed5b4d41
 *     responses:
 *       200:
 *         description: The updated teaching demand
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
 *                     teachingDemand:
 *                       $ref: '#/components/schemas/TeachingDemand'
 *       400:
 *         description: Invalid id
 *         content:
 *           application/json:
 *             examples:
 *               invalidIdExample:
 *                 summary: Invalid id (format)
 *                 value:
 *                   status: fail
 *                   message: "Invalid _id: 642199c4fcc9f9"
 *               cancelledDemandExample:
 *                 summary: Accepted demand cancellation attempt
 *                 value:
 *                   status: fail
 *                   message: You can't cancel demands that were accepted.
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
 *         description: Forbidden access
 *         content:
 *           application/json:
 *             examples:
 *               roleAccessExample:
 *                 summary: Forbidden access due to role
 *                 value:
 *                   status: fail
 *                   message: You don't have permission to perform this action.
 *               notReceiverExample:
 *                 summary: Not the receiver of the demand
 *                 value:
 *                   status: fail
 *                   message: You can't accept demands that weren't sent to you.
 *               notSenderExample:
 *                 summary: Not the sender of the demand
 *                 value:
 *                   status: fail
 *                   message: You can't cancel demands that you didn't sent.
 *       404:
 *         description: Non existing teaching demand
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
 *                   example: No teaching demand found with that ID.
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
  .route('/:demandId/cancel')
  .patch(restrictTo('student', 'teacher'), cancelDemand);

module.exports = router;
