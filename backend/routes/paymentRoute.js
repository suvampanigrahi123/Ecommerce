const express=require('express');
const { processPayment, sendStripeKey } = require('../controllers/paymentControllers');
const {isAuthenticatedUser} =require('../middleware/auth')
const router=express.Router()

router.route('/payment/process').post(isAuthenticatedUser,processPayment)
router.route('/stripeapikey').get(isAuthenticatedUser,sendStripeKey)

module.exports=router;