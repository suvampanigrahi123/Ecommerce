const express = require("express");
const { RegisterUser, loginUser, logoutUser, ForgetPassword, resetPassword, getUserDetails, updatePassword, updateProfile, getAlluser, getSingleUserDetail, updateUser, deleteUser } = require("../controllers/userController");
const { isAuthenticatedUser,authorizeRoles } = require('../middleware/auth');
const Router=express.Router();

Router.route('/register').post(RegisterUser);

Router.route('/login').post(loginUser)

Router.route('/password/forget').post(ForgetPassword)

Router.route('/password/reset/:token').put(resetPassword)

Router.route('/logout').get(logoutUser)

Router.route('/me').get(isAuthenticatedUser,getUserDetails)

Router.route('/me/update').put(isAuthenticatedUser,updateProfile)

Router.route('/password/update').put(isAuthenticatedUser,updatePassword)

Router.route('/admin/users').get(isAuthenticatedUser,authorizeRoles("admin"),getAlluser)

Router.route('/admin/user/:id').get(isAuthenticatedUser,authorizeRoles("admin"),getSingleUserDetail).put(isAuthenticatedUser,authorizeRoles("admin"),updateUser).delete(isAuthenticatedUser,authorizeRoles("admin"),deleteUser)

module.exports=Router