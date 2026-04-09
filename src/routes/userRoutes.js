const express = require('express');
const authController = require('./../controllers/authControllers');
const userController = require('./../controllers/usersControllers');
const router = express.Router();


router.post('/signup',authController.signup);
router.post('/login',authController.login);
router.post('/forgetPassword',authController.forgetPassword);
router.patch('/resetPassword/:token',authController.resetPassword);
router.patch('/updateMyPassword',authController.protect,authController.updatePassword);
//router.route('/').get(authController.protect,authController.restrictTo('admin'),userController.getUsers);


module.exports=router;