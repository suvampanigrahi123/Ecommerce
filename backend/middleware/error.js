const ErrorHandler=require('../utils/errorHandler')


module.exports=(err,req,res,next)=>{
    err.statuscode = err.statuscode || 500
    err.message=err.message || 'Internal Server Error'


    //Wrong Mongodb id Error
    if(err.name==='CastError'){
        const message=`ReSource Not Found Invalid:-${err.path} `;
        err=new ErrorHandler(message,400)
    }

    //mongodb Duplicate Key Error
    if(err.code===11000){
        const message=`Duplicate ${Object.keys(err.keyValue)} Entered`
        err=new ErrorHandler(message,400)
    }

    //JsonWebtoken Error
    if(err.name==='JsonWebTokenError'){
        const message=`Json WebToken Invalid ,try Again`
        err=new ErrorHandler(message,400)
    }

    //Jwt Expire Error
    if(err.name==='TokenExpiredError'){
        const message=`Json WebToken Expired ,try Again`
        err=new ErrorHandler(message,400)
    }

    res.status(err.statuscode).json({
        success:false,
        message:err.message,
    })
}