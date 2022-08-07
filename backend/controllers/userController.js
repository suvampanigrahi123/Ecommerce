const userModel=require('../models/userModel')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError=require('../middleware/catchAsyncError');
const sendToken = require('../utils/jwtToken');
const sendEmail=require('../utils/sendEmail')
const crypto=require('crypto')
const cloudinary=require('cloudinary')
//Register a User

exports.RegisterUser=catchAsyncError(async(req,res,next)=>{

    const mycloud=await cloudinary.v2.uploader.upload(req.body.avatar,{
        folder:'avatars',
        width:150,
        crop:'scale'
    })

    const {name,email,password}=req.body

    const user=await userModel.create({
        name,email,password,
        avatar:{
            public_id:mycloud.public_id,
            url:mycloud.secure_url
        }
    });

    sendToken(user,201,res)
})

//Login User

exports.loginUser=catchAsyncError(async(req,res,next)=>{
    const {email,password}=req.body

    //Checking if User has Give password And Email Both

    if(!email || !password){
        return next(new ErrorHandler("please Enter Email & Password",400))
    }

    const user=await userModel.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHandler("InValid Email Or Password",401))
    }
    const isPasswordMatched=await user.comparePassword(password)
    if(!isPasswordMatched){
        return next(new ErrorHandler("InValid Email Or Password",401))
    }
    sendToken(user,200,res)
    
});


// logout User

exports.logoutUser=catchAsyncError(async(req,res,next)=>{

    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true
    })

    res.status(200).json({
        sucess:true,
        message:"Logged out SucessFully"
    })
})

//Forget password 
exports.ForgetPassword=catchAsyncError(async(req,res,next)=>{
    const user=await userModel.findOne({email:req.body.email})

    if(!user){
        return next(new ErrorHandler("User Not Found",404))
    }

    //get ResetPassword
    const resetToken= user.getresetPasswordToken();
    await user.save({ validateBeforeSave:false})

    const resetPasswordUrl=`${process.env.FRONTEND_URL}}/password/reset/${resetToken}`
    const message=`Your Password Reset Token is temp :- \n\n ${resetPasswordUrl} \n\n if you have not requested this email then Please ignore It`

    try {
        await sendEmail({
            email:user.email,
            subject:'Ecommerce Password Recovery',
            message:message
        });
        res.status(200).json({
            sucess:true,
            message:'Email sent to user SucessFully'
        })
    } catch (error) {
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;
        await user.save({ validateBeforeSave:false})

        return next(new ErrorHandler(error.message,400))
    }

})


//Reset Password
exports.resetPassword=catchAsyncError(async(req,res,next)=>{
    const resetPasswordToken=crypto.createHash('sha256').update(req.params.token).digest("hex")
    const user=await userModel.findOne({resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()}
    });
    if(!user){
       return next( new ErrorHandler('Reset Password token is invalid or Has been expired',404))
    }

    if(req.body.password!==req.body.confrimPassword){
        return next( new ErrorHandler('Password Not Matched',404))
    }

    user.password=req.body.password;
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;

    await user.save()
    sendToken(user,200,res)
})

//Get User Details
exports.getUserDetails=catchAsyncError(async(req,res,next)=>{
    const user=await userModel.findById(req.user.id)
    res.status(200).json({
        sucess:true,
        user
    })

})


//Update Password
exports.updatePassword=catchAsyncError(async(req,res,next)=>{
    const user=await userModel.findById(req.user.id).select('+password')

    const isPasswordMatched=await user.comparePassword(req.body.oldPassword)

    if(!isPasswordMatched){
      return  next(new ErrorHandler('oldPassword is inCorrect ',400))
    }
    if(req.body.newPassword !== req.body.confrimPassword){
        return   next(new ErrorHandler('confrim password is incorrect',400))
    }
    user.password=req.body.newPassword
    await user.save();
    sendToken(user,200,res)
})



//Update user Profile
exports.updateProfile=catchAsyncError(async(req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email,
    }

    if(req.body.avatar!=''){
        const user=await userModel.findById(req.user.id);
        const imageId=user.avatar.public_id;
        await cloudinary.v2.uploader.destroy(imageId);

        const mycloud=await cloudinary.v2.uploader.upload(req.body.avatar,{
            folder:'avatars',
            width:150,
            crop:'scale'
        })
        newUserData.avatar={
            public_id:mycloud.public_id,
            url:mycloud.secure_url
        }

    }

    const user=await userModel.findByIdAndUpdate(req.user.id,newUserData,{new:true,runValidators:true,useFindAndModify:false});
    res.status(200).json({
        success:true,
    })
})

//get All User --Admin
exports.getAlluser=catchAsyncError(async(req,res,next)=>{
    const users=await userModel.find();
    res.status(200).json({
        sucess:true,
        users
    })
})

//get Single User Details(Admin)
exports.getSingleUserDetail=catchAsyncError(async(req,res,next)=>{
    const user=await userModel.findById(req.params.id);
    if(!user){
        return next(new ErrorHandler(`User Doesn't Exist with id :${req.params.id}`,403))
    }
    res.status(200).json({
        sucess:true,
        user
    })
})

//Update user Profile--Admin
exports.updateUser=catchAsyncError(async(req,res,next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    }
    let user=userModel.findById(req.params.id)
    if(!user){
        return next(new ErrorHandler(`User Doesn't Exist with id :${req.params.id}`,403))
    }

     user=await userModel.findByIdAndUpdate(req.params.id,newUserData,{new:true,runValidators:true,useFindAndModify:false});
    res.status(200).json({
        success:true,
        user
    })
})

//Delete user ---Admin
exports.deleteUser=catchAsyncError(async(req,res,next)=>{
    const user=await userModel.findById(req.params.id)
    if(!user){
        return next(new ErrorHandler(`User Doesn't Exist with id :${req.params.id}`,403))
    }
    const imageId= user.avatar.public_id;
    await cloudinary.v2.uploader.destroy(imageId)
    await user.remove();
    res.status(200).json({
        success:true,
        message:"User Delete Succesfully" 
    })
})