const express = require('express');
const {
  signup,
  confirmRegistration,
  checkPassword,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  restrictTo,
  restrictUpdatePassword,
  restrictUpdateRole,
  isResetLinkValid,
} = require('../../controllers/authController');
const {
  getAllUsers,
  createUser,
  updateUser,
  queryUser,
  getUser,
  deleteUser,
  queryMe,
  setRole,
  uploadUserPhoto,
  resizeUserPhoto,
  deleteMe,
  addContact,
  deleteContact,
  getAllContacts,
  getSupervisedStudents,
  getConnectionStatus,
  sendInvitation,
  declineInvitation,
  getAllInvitations,
} = require('../../controllers/userController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           description: The status of the response
 *           example: success
 *         token:
 *           type: string
 *           description: The login token
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0MmJmN2I3YWIzOTY2Njc5MmZlNWE2ZiIsImlhdCI6MTY4MDYwNDUxMCwiZXhwIjoxNjgwNjA4MTEwfQ.o7R-5d-mb7mmi3EychbcIl_AfHW6Cuq0SGOo0UG99V4
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ServerError:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           description: The status of the response
 *           example: error
 *         message:
 *           type: string
 *           description: The error message
 *           example: Something went wrong. Try Again !
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The id of the user
 *           example: 642c38f3b7ed1dbd25858e9e
 *         email:
 *           type: string
 *           description: The email of the user
 *           example: user@example.com
 *         username:
 *           type: string
 *           description: The username of the user
 *           example: johndoe27
 *         firstname:
 *           type: string
 *           description: The first name of the user
 *           example: John
 *         lastname:
 *           type: string
 *           description: The last name of the user
 *           example: Doe
 *         photo:
 *           type: string
 *           description: The profile picture of the user
 *           example: https://learnathome.blob.core.windows.net/public/default.jpg
 *         role:
 *           type: string
 *           description: The role of the user
 *           example: student
 */

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - User
 *     summary: Route used to get all the users (students and teachers) in the application
 *     parameters:
 *       - name: sort
 *         in: query
 *         description: 'Sort the results by the fields given in the parameter (separated by a comma)'
 *         schema:
 *           type: string
 *           example: username,email
 *       - name: fields
 *         in: query
 *         description: 'The fields we want to display in the retrieved results (separeted by a comma)'
 *         schema:
 *           type: string
 *           example: username,email
 *       - name: page
 *         in: query
 *         description: 'The page number we want to display in the array of results (page 1 by default if limit is defined)'
 *         schema:
 *           type: number
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: 'The number of elements per page we want to display (10 by default if page is defined)'
 *         schema:
 *           type: number
 *           example: 10
 *       - name: role
 *         in: query
 *         description: 'Other filtering options regarding to the existing fields (example with role)'
 *         schema:
 *           type: string
 *           example: teacher
 *     responses:
 *       200:
 *         description: List of all users
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
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
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
 *       - User
 *     summary: Route used to create a new user (not implemented)
 *     responses:
 *       500:
 *         description: Route error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Please use /signup instead.
 */
router.route('/').get(protect, getAllUsers).post(createUser);

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags:
 *       - User
 *     summary: Route used to get the logged user informations
 *     responses:
 *       200:
 *         description: The logged user
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
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
 *       - User
 *     summary: Route used to modify the logged user
 *     requestBody:
 *       description: The new user values
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                description: The username
 *                example: test123
 *              email:
 *                type: string
 *                description: The user's email
 *                example: test@example.com
 *              firstname:
 *                type: string
 *                description: The user's firstname
 *                example: John
 *              lastname:
 *                type: string
 *                description: The user's lastname
 *                example: Doe
 *         multipart/form-data:
 *           schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                description: The username
 *                example: test123
 *              email:
 *                type: string
 *                description: The user's email
 *                example: test@example.com
 *              firstname:
 *                type: string
 *                description: The user's firstname
 *                example: John
 *              lastname:
 *                type: string
 *                description: The user's lastname
 *                example: Doe
 *              photo:
 *                type: string
 *                description: The user's photo
 *                format: binary
 *     responses:
 *       200:
 *         description: The updated logged user , with his new values
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid updates
 *         content:
 *           application/json:
 *             examples:
 *               restrictUpdatePasswordExample:
 *                 summary: Update password attempt
 *                 value:
 *                   status: fail
 *                   message: Use the reset password mechanisms to update the password.
 *               restrictUpdateRoleExample:
 *                 summary: Update role attempt
 *                 value:
 *                   status: fail
 *                   message: Use the /set-role route to update the role.
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
 *       - User
 *     summary: Route used to delete the logged user
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
  .route('/me')
  .get(protect, queryMe, getUser)
  .patch(
    protect,
    restrictUpdatePassword,
    restrictUpdateRole,
    uploadUserPhoto,
    resizeUserPhoto,
    queryMe,
    updateUser
  )
  .delete(protect, queryMe, deleteMe);

/**
 * @swagger
 * /users/contacts:
 *   get:
 *     tags:
 *       - User
 *     summary: Route used to get all the contacts of the logged user (accessible to teachers and students only)
 *     responses:
 *       200:
 *         description: The array of contacts of the logged user
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
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
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
  .route('/contacts')
  .get(protect, restrictTo('student', 'teacher'), getAllContacts);

/**
 * @swagger
 * /users/invitations:
 *   get:
 *     tags:
 *       - User
 *     summary: Route used to get all the contact's invitations of the logged user (accessible to teachers and students only)
 *     responses:
 *       200:
 *         description: The array of contact's invitations of the logged user
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
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
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
  .route('/invitations')
  .get(protect, restrictTo('student', 'teacher'), getAllInvitations);

/**
 * @swagger
 * /users/contacts/{contactId}:
 *   patch:
 *     tags:
 *       - User
 *     summary: Route used to add an user to the logged user's contacts (accessible to teachers and students only)
 *     parameters:
 *       - name: contactId
 *         in: path
 *         description: 'The id of the user we want to add as a contact'
 *         schema:
 *           type: string
 *           example: 641c7de953f7dcad45936b4e
 *     responses:
 *       200:
 *         description: The updated array of contacts of the logged user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User successfully added to your contacts.
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid updates
 *         content:
 *           application/json:
 *             examples:
 *               invalidIdExample:
 *                 summary: Invalid id
 *                 value:
 *                   status: fail
 *                   message: "Invalid _id: 642199c4fcc9f9"
 *               invalidSelfAddingExample:
 *                 summary: Self adding attempt
 *                 value:
 *                   status: fail
 *                   message: You can't add yourself to your contact list.
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
 *   delete:
 *     tags:
 *       - User
 *     summary: Route used to remove an user from the logged user's contacts (accessible to teachers and students only)
 *     parameters:
 *       - name: contactId
 *         in: path
 *         description: 'The id of the user we want to remove from the contact list'
 *         schema:
 *           type: string
 *           example: 641c7de953f7dcad45936b4e
 *     responses:
 *       200:
 *         description: The updated array of contacts of the logged user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User successfully removed from your contacts.
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid updates
 *         content:
 *           application/json:
 *             examples:
 *               invalidIdExample:
 *                 summary: Invalid id
 *                 value:
 *                   status: fail
 *                   message: "Invalid _id: 642199c4fcc9f9"
 *               noSentInvitationExample:
 *                 summary: No invitation sent to the logged user
 *                 value:
 *                   status: fail
 *                   message: The user you want to add hasn't send you a contact request.
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
  .route('/contacts/:contactId')
  .patch(protect, restrictTo('student', 'teacher'), addContact)
  .delete(protect, restrictTo('student', 'teacher'), deleteContact);

/**
 * @swagger
 * /users/contacts/{userId}/invite:
 *   patch:
 *     tags:
 *       - User
 *     summary: Route used to send a contact's invitation to an user (accessible to teachers and students only)
 *     parameters:
 *       - name: contactId
 *         in: path
 *         description: 'The id of the user we want to send a contact invitation '
 *         schema:
 *           type: string
 *           example: 641c7de953f7dcad45936b4e
 *     responses:
 *       200:
 *         description: Successfull invitation sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Contact invitation successfully sent.
 *                 data:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Invalid updates
 *         content:
 *           application/json:
 *             examples:
 *               invalidIdExample:
 *                 summary: Invalid id
 *                 value:
 *                   status: fail
 *                   message: "Invalid _id: 642199c4fcc9f9"
 *               invalidSelfInvitationExample:
 *                 summary: Self invitation attempt
 *                 value:
 *                   status: fail
 *                   message: You can't send a contact invitation to yourself.
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
  .route('/contacts/:userId/invite')
  .patch(protect, restrictTo('student', 'teacher'), sendInvitation);

/**
 * @swagger
 * /users/contacts/{userId}/decline:
 *   patch:
 *     tags:
 *       - User
 *     summary: Route used to decline a contact's invitation from an user (accessible to teachers and students only)
 *     parameters:
 *       - name: contactId
 *         in: path
 *         description: 'The id of the user we want to decline the contact invitation'
 *         schema:
 *           type: string
 *           example: 641c7de953f7dcad45936b4e
 *     responses:
 *       200:
 *         description: Invitation successfully declined
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Contact invitation successfully refused.
 *                 data:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       400:
 *         description: Invalid updates
 *         content:
 *           application/json:
 *             examples:
 *               invalidIdExample:
 *                 summary: Invalid id
 *                 value:
 *                   status: fail
 *                   message: "Invalid _id: 642199c4fcc9f9"
 *               invalidSelfRefusalExample:
 *                 summary: Self refusal attempt
 *                 value:
 *                   status: fail
 *                   message: You can't decline a contact invitation to yourself.
 *               noInvitationExample:
 *                 summary: The user hasn't invite the connected one
 *                 value:
 *                   status: fail
 *                   message: The user you want to add hasn't send you a contact request.
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
  .route('/contacts/:userId/decline')
  .patch(protect, restrictTo('student', 'teacher'), declineInvitation);

/**
 * @swagger
 * /users/supervised:
 *   get:
 *     tags:
 *       - User
 *     summary: Route used to get all supervised students (accessible to teachers only)
 *     responses:
 *       200:
 *         description: The list of the supervised students
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
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
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
router.get(
  '/supervised',
  protect,
  restrictTo('teacher'),
  getSupervisedStudents
);

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     tags:
 *       - User
 *     summary: Route used to get a specific user
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: 'The id of the user we want to retrieve'
 *         schema:
 *           type: string
 *           example: 641c7de953f7dcad45936b4e
 *     responses:
 *       200:
 *         description: The user we want to retrieve
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
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
 *                   example: "Invalid _id: 642199c4fcc9f9"
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
 */
router.route('/:id').get(queryUser, getUser);

/**
 * @swagger
 * /users/{userId}/connection-status:
 *   get:
 *     tags:
 *       - User
 *     summary: Route used to get a specific user's connection status
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: 'The id of the user we want to get the connection status'
 *         schema:
 *           type: string
 *           example: 641c7de953f7dcad45936b4e
 *     responses:
 *       200:
 *         description: The connection status of the user
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
 *                     connected:
 *                       type: boolean
 *                       example: false
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
 *                   example: "Invalid _id: 642199c4fcc9f9"
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
 *         description: Internal server error
 *         content:
 *           application/json:
 *             examples:
 *               emailSendingExample:
 *                 summary: E-mail sending error
 *                 value:
 *                   status: error
 *                   message: There was an error sending the confirmation email. Please contact us at admin-learn@home.com!
 *               internalServerErrorExample:
 *                 summary: Generic internal server error
 *                 value:
 *                   status: error
 *                   message: Something went wrong. Try Again !
 */
router
  .route('/:id/status')
  .get(
    protect,
    restrictTo('student', 'teacher'),
    queryUser,
    getConnectionStatus
  );
/**
 * @swagger
 * /users/signup:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Route to signup the user
 *     requestBody:
 *       description: The registration values
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            required:
 *              - email
 *              - username
 *              - firstname
 *              - lastname
 *              - password
 *              - passwordConfirm
 *            properties:
 *              username:
 *                type: string
 *                description: The username
 *                example: test123
 *              email:
 *                type: string
 *                description: The user's email
 *                example: test@example.com
 *              firstname:
 *                type: string
 *                description: The user's firstname
 *                example: John
 *              lastname:
 *                type: string
 *                description: The user's lastname
 *                example: Doe
 *              role:
 *                type: string
 *                description: The user's role
 *                enum: [student, teacher]
 *                example: student
 *              password:
 *                type: string
 *                description: The user's password
 *                example: Test@1234
 *              passwordConfirm:
 *                type: string
 *                description: The user's password confirmation
 *                example: Test@1234
 *     responses:
 *       201:
 *         description: Successful registration
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Successful registration.\nPlease confirm your e-mail address by accessing the link we sent in your inbox before 10 days."
 *       400:
 *         description: Incorrect field validation
 *         content:
 *           application/json:
 *             examples:
 *               invalidInputExample:
 *                 summary: Invalid field
 *                 value:
 *                   status: fail
 *                   message: Invalid input data.
 *                   fields: [email: Please provide a valid email address.]
 *               duplicateFieldExample:
 *                 summary: Duplicate field value (email or username)
 *                 value:
 *                   status: fail
 *                   message: "Duplicate field value: \"werner97@hotmail.com\". Please use another value!"
 *       403:
 *         description: Admin user creation attempt
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
 *                   example: You cannot create an admin user using this route.
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             examples:
 *               emailSendingExample:
 *                 summary: E-mail sending error
 *                 value:
 *                   status: error
 *                   message: There was an error sending the confirmation email. Please contact us at admin-learn@home.com!
 *               internalServerErrorExample:
 *                 summary: Generic internal server error
 *                 value:
 *                   status: error
 *                   message: Something went wrong. Try Again !
 */
router.post('/signup', signup);

/**
 * @swagger
 * /users/check-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Route to check the validation of a password
 *     requestBody:
 *       description: The password we want to check
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 description: The password
 *                 example: Test@1234
 *     responses:
 *       200:
 *         description: Password checking
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 validations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       validation:
 *                         type: string
 *                         example: uppercase
 *                       arguments:
 *                         type: number
 *                         example: 1
 *                       message:
 *                         type: string
 *                         example: The password must contain at least 1 letter in uppercase.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 */
router.post('/check-password', checkPassword);

/**
 * @swagger
 * /users/confirm/{confToken}:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Route used to confirm the registration for an user
 *     parameters:
 *       - name: confToken
 *         in: path
 *         description: 'The confirmation token used to validate the registration of an user (accessible via a link sent to the user by e-mail)'
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful confirmation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       404:
 *         description: Invalid confirmation token (confirmation time expired or inexistant token)
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
 *                   example: Invalid link !
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 */
router.get('/confirm/:confToken', confirmRegistration);

/**
 * @swagger
 * /users/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Route used to login in the application
 *     requestBody:
 *       description: The login values - we can specify the email and/or the username
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            required:
 *              - email
 *              - username
 *              - password
 *            properties:
 *              username:
 *                type: string
 *                description: The username
 *                example: test123
 *              email:
 *                type: string
 *                description: The user's email
 *                example: test@example.com
 *              password:
 *                type: string
 *                description: The user's password
 *                example: Test@1234
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Missing fields
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
 *                   example: Please provide email and password!
 *       401:
 *         description: Incorrect credentials
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
 *                   example: Incorrect credentials.
 *       403:
 *         description: Non confirmed account
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
 *                   example: Please confirm your e-mail address (link sent by e-mail).
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 */
router.post('/login', login);

/**
 * @swagger
 * /users/forgot-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Route used to send a forgot password request
 *     requestBody:
 *       description: The email of the user
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            required:
 *              - email
 *            properties:
 *              email:
 *                type: string
 *                description: The user's email
 *                example: test@example.com
 *     responses:
 *       200:
 *         description: Successful change link sent to email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Reset link sent to email!
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             examples:
 *               emailSendingExample:
 *                 summary: E-mail sending error
 *                 value:
 *                   status: error
 *                   message: There was an error sending the email. Try Again !'
 *               internalServerErrorExample:
 *                 summary: Generic internal server error
 *                 value:
 *                   status: error
 *                   message: Something went wrong. Try Again !
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /users/reset-password/{resetToken}:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Route used to get the validity of a reset password token link
 *     parameters:
 *       - name: resetToken
 *         in: path
 *         description: 'The reset token used to reset the password of an user (accessible via a link sent to the user by e-mail)'
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The validity of the reset token link
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
 *                     valid:
 *                       type: boolean
 *                       example: false
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             examples:
 *               emailSendingExample:
 *                 summary: E-mail sending error
 *                 value:
 *                   status: error
 *                   message: There was an error sending the confirmation email. Please contact us at admin-learn@home.com!
 *               internalServerErrorExample:
 *                 summary: Generic internal server error
 *                 value:
 *                   status: error
 *                   message: Something went wrong. Try Again !
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Route used to reset a forgotten password
 *     parameters:
 *       - name: resetToken
 *         in: path
 *         description: 'The reset token used to reset the password of an user (accessible via a link sent to the user by e-mail)'
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: The new password of the user
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            required:
 *              - password
 *              - passwordConfirm
 *            properties:
 *              password:
 *                type: string
 *                description: The user's new password
 *                example: Test@1234
 *              passwordConfirm:
 *                type: string
 *                description: The user's new password confirmation
 *                example: Test@1234
 *     responses:
 *       200:
 *         description: Successful reset
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0MmJmN2I3YWIzOTY2Njc5MmZlNWE2ZiIsImlhdCI6MTY4MDYwNDUxMCwiZXhwIjoxNjgwNjA4MTEwfQ.o7R-5d-mb7mmi3EychbcIl_AfHW6Cuq0SGOo0UG99V4
 *                 message:
 *                   type: string
 *                   example: Password successfully changed !
 *       400:
 *         description: Invalid reset token (confirmation time expired or inexistant token)
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
 *                   example: Token is invalid or has expired.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 */
router
  .route('/reset-password/:resetToken')
  .get(isResetLinkValid)
  .post(resetPassword);

router.use(protect);

/**
 * @swagger
 * /users/update-password:
 *   patch:
 *     tags:
 *       - User
 *     summary: Route used to modify your own password
 *     requestBody:
 *       description: The new password of the user
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            required:
 *              - passwordCurrent
 *              - password
 *              - passwordConfirm
 *            properties:
 *              passwordCurrent:
 *                type: string
 *                description: The user's old password
 *                example: Test@1234
 *              password:
 *                type: string
 *                description: The user's new password
 *                example: Test@12345
 *              passwordConfirm:
 *                type: string
 *                description: The user's new password confirmation
 *                example: Test@12345
 *     responses:
 *       200:
 *         description: Successful modification
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Invalid password fields
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
 *                   example: Invalid input data.
 *                 fields:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       password:
 *                         type: string
 *                       passwordConfirm:
 *                         type: string
 *                   example: [password: Please provide a valid password.,passwordConfirm: Passwords are not the same.]
 *       401:
 *         description: User login problems and wrong current password
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
 *               incorrectCredentialsExample:
 *                 summary: Wrong current password
 *                 value:
 *                   status: fail
 *                   message: Your current password is wrong.
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServerError'
 *     security:
 *       - bearerAuth: []
 */
router.patch('/update-password', updatePassword);

router.use(restrictTo('admin'));

/**
 * @swagger
 * /users/{userId}:
 *   patch:
 *     tags:
 *       - User
 *     summary: Route used to modify a specific user (accessible to admins only)
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: 'The id of the user we want to modify'
 *         schema:
 *           type: string
 *           example: 641c7de953f7dcad45936b4e
 *     requestBody:
 *       description: The new user values
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                description: The username
 *                example: test123
 *              email:
 *                type: string
 *                description: The user's email
 *                example: test@example.com
 *              firstname:
 *                type: string
 *                description: The user's firstname
 *                example: John
 *              lastname:
 *                type: string
 *                description: The user's lastname
 *                example: Doe
 *     responses:
 *       200:
 *         description: The user we just updated, with his new values
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid updates
 *         content:
 *           application/json:
 *             examples:
 *               invalidIdExample:
 *                 summary: Invalid id
 *                 value:
 *                   status: fail
 *                   message: "Invalid _id: 642199c4fcc9f9"
 *               restrictUpdatePasswordExample:
 *                 summary: Update password attempt
 *                 value:
 *                   status: fail
 *                   message: Use the reset password mechanisms to update the password.
 *               restrictUpdateRoleExample:
 *                 summary: Update role attempt
 *                 value:
 *                   status: fail
 *                   message: Use the /set-role route to update the role.
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
 *   delete:
 *     tags:
 *       - User
 *     summary: Route used to delete a specific user (accessible to admins only)
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: 'The id of the user we want to delete'
 *         schema:
 *           type: string
 *           example: 641c7de953f7dcad45936b4e
 *     responses:
 *       204:
 *         description: Successful deletion
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
 *                   example: "Invalid _id: 642199c4fcc9f9"
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
  .route('/:id')
  .patch(restrictUpdatePassword, restrictUpdateRole, queryUser, updateUser)
  .delete(queryUser, deleteUser);

/**
 * @swagger
 * /users/{userId}/role:
 *   patch:
 *     tags:
 *       - User
 *     summary: Route used to modify the role of an user (accessible to admins only)
 *     parameters:
 *       - name: userId
 *         in: path
 *         description: 'The id of the user we want to modify'
 *         schema:
 *           type: string
 *           example: 641c7de953f7dcad45936b4e
 *     requestBody:
 *       description: The new role value
 *       content:
 *         application/json:
 *           schema:
 *            type: object
 *            properties:
 *              role:
 *                type: string
 *                description: The new role of the user
 *                example: admin
 *     responses:
 *       200:
 *         description: The user we just updated, with his new role
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid updates
 *         content:
 *           application/json:
 *             examples:
 *               invalidIdExample:
 *                 summary: Invalid id
 *                 value:
 *                   status: fail
 *                   message: "Invalid _id: 642199c4fcc9f9"
 *               restrictUpdatePasswordExample:
 *                 summary: Update password attempt
 *                 value:
 *                   status: fail
 *                   message: Use the reset password mechanisms to update the password.
 *               restrictUpdateRoleExample:
 *                 summary: Update role attempt
 *                 value:
 *                   status: fail
 *                   message: Use the /set-role route to update the role.
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
router.patch('/:id/role', queryUser, setRole);

module.exports = router;
