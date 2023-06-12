const express = require('express');
const { restrictTo, protect } = require('../../controllers/authController');
const {
  getAllTasks,
  createTask,
  completeTask,
  validateTask,
  createTaskStudent,
  getValidatedStudentTasks,
  getDoneStudentTasks,
  getTodoStudentTasks,
} = require('../../controllers/taskController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The id of the task
 *           example: 642ac72b1c4504f0d78f7daf
 *         title:
 *           type: string
 *           description: The title of the task
 *           example: Review Maths
 *         performer:
 *           type: object
 *           description: The performer (student) of the task
 *           properties:
 *             _id:
 *               type: string
 *               description: The id of the user executing the task
 *               example: 642199e8fcc9f9121f994dfr
 *             username:
 *               type: string
 *               description: The username of the user executing the task
 *               example: werner95
 *         done:
 *           type: boolean
 *           description: The completion status of the task
 *           example: false
 *         validated:
 *           type: boolean
 *           description: The validation status of the task
 *           example: false
 */

router.use(protect);

/**
 * @swagger
 * /tasks:
 *   get:
 *     tags:
 *       - Task
 *     summary: Route used to get all tasks of a connected user (accessible to students only)
 *     responses:
 *       200:
 *         description: The tasks of the user
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
 *                     tasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Task'
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
 *       - Task
 *     summary: Route used to create a new task (accessible to students only)
 *     requestBody:
 *       description: The new task title
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              title:
 *                type: string
 *                description: The title of the task
 *                example: Review Geography
 *     responses:
 *       201:
 *         description: The new created task
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
 *                     task:
 *                       $ref: '#/components/schemas/Task'
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
  .route('/')
  .get(restrictTo('student'), getAllTasks)
  .post(restrictTo('student'), createTask);

/**
 * @swagger
 * /tasks/students/validated:
 *   get:
 *     tags:
 *       - Task
 *     summary: Route used to get all validated tasks of the user's supervised students (accessible to teachers only)
 *     responses:
 *       200:
 *         description: The validated tasks of the students
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
 *                     tasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Task'
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
  .route('/students/validated')
  .get(restrictTo('teacher'), getValidatedStudentTasks);

/**
 * @swagger
 * /tasks/students/done:
 *   get:
 *     tags:
 *       - Task
 *     summary: Route used to get all completed tasks of the user's supervised students (accessible to teachers only)
 *     responses:
 *       200:
 *         description: The completed tasks of the students
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
 *                     tasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Task'
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
router.route('/students/done').get(restrictTo('teacher'), getDoneStudentTasks);

/**
 * @swagger
 * /tasks/students/todo:
 *   get:
 *     tags:
 *       - Task
 *     summary: Route used to get all in-process tasks of the user's supervised students (accessible to teachers only)
 *     responses:
 *       200:
 *         description: The in-process tasks of the students
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
 *                     tasks:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Task'
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
router.route('/students/todo').get(restrictTo('teacher'), getTodoStudentTasks);

/**
 * @swagger
 * /tasks/students/{studentId}:
 *   post:
 *     tags:
 *       - Task
 *     summary: Route used to affect a new task to a supervised student (accessible to teachers only)
 *     requestBody:
 *       description: The new task title
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              title:
 *                type: string
 *                description: The title of the task
 *                example: Finish Math Homework
 *     parameters:
 *       - name: studentId
 *         in: path
 *         description: 'The id of the student we want to affect a task'
 *         schema:
 *           type: string
 *           example: 641c7de953f7dcad45936b4e
 *     responses:
 *       201:
 *         description: The new created task
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
 *                     task:
 *                       $ref: '#/components/schemas/Task'
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
 *                 summary: Student not supervised by the user
 *                 value:
 *                   status: fail
 *                   message: You are not the supervisor of this student.
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
  .route('/students/:studentId')
  .post(restrictTo('teacher'), createTaskStudent);

/**
 * @swagger
 * /tasks/{taskId}/complete:
 *   patch:
 *     tags:
 *       - Task
 *     summary: Route used to change the completion status of a task to true (accessible to students only)
 *     parameters:
 *       - name: taskId
 *         in: path
 *         description: 'The id of the task we want to modify'
 *         schema:
 *           type: string
 *           example: 642ac72b1c4504f0d78f7daf
 *     responses:
 *       200:
 *         description: The updated task
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
 *                     task:
 *                       $ref: '#/components/schemas/Task'
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
 *                 summary: Task not executed by the user
 *                 value:
 *                   status: fail
 *                   message: You are not the performer of the task.
 *       404:
 *         description: Non existing task
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
 *                   example: No task found with that ID.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *     security:
 *       - bearerAuth: []
 */
router.route('/:taskId/complete').patch(restrictTo('student'), completeTask);

/**
 * @swagger
 * /tasks/{taskId}/validate:
 *   patch:
 *     tags:
 *       - Task
 *     summary: Route used to change the validation status of a task to true (accessible to teachers only)
 *     parameters:
 *       - name: taskId
 *         in: path
 *         description: 'The id of the task we want to modify'
 *         schema:
 *           type: string
 *           example: 642ac72b1c4504f0d78f7daf
 *     responses:
 *       200:
 *         description: The updated task
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
 *                     task:
 *                       $ref: '#/components/schemas/Task'
 *       400:
 *         description: Non-completed task validation attempt
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
 *                   example: You can't validate a non-completed task.
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
 *                 summary: Student not supervised by the user
 *                 value:
 *                   status: fail
 *                   message: You are not the supervisor of the student performing the task.
 *       404:
 *         description: Non existing task
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
 *                   example: No task found with that ID.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *     security:
 *       - bearerAuth: []
 */
router.route('/:taskId/validate').patch(restrictTo('teacher'), validateTask);

module.exports = router;
