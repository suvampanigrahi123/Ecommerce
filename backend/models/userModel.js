const mongoose=require('mongoose')
const validator=require('validator')
const bcryptjs = require('bcryptjs');
const crypto=require('crypto')
const jwt=require('jsonwebtoken')

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        require:[true,'Please Enter Your Name'],
        maxLength:[30,'name Cannot Exceed 30 charcters'],
        minLength:[5,'name Should Have atleast 5 charcters'],
    },
    email:{
        type:String,
        required:[true,'please Enter Your Email'],
        unique:true,
        validate:[validator.isEmail,"please Enter a Valid Email"]
    },
    password:{
        type:String,
        required:[true,'please Enter Your password'],
        minLength:[8,'password Should Have atleast 8 charcters'],
        select:false,
    },
    avatar:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },
    role:{
        type:String,
        default:"user"
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date,
});

//Saltify The Password[hashing]
userSchema.pre("save",async function(next){

    if(!this.isModified("password")){
        next();    
    }
    this.password=await bcryptjs.hash(this.password,10);
})

//JWT TOKEN
userSchema.methods.getJWTToken=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE,
    });
};

//Compare Password

userSchema.methods.comparePassword=async function(password){
    return await bcryptjs.compare(password,this.password);
}


//Generating Password Reset Token

userSchema.methods.getresetPasswordToken=function(){
    //Create Reset Token
    const resetToken=crypto.randomBytes(20).toString("hex")

    //Hashing and adding to UserSchema

    this.resetPasswordToken=crypto.createHash('sha256').update(resetToken).digest("hex");

    this.resetPasswordExpire=Date.now() + 15 * 60 * 1000

    return resetToken;
}


const userModel=mongoose.model("users",userSchema)

module.exports=userModel;
