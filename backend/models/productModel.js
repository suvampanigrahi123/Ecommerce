const mongoose=require('mongoose')

const ProductSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please Enter Product Name'],
        trim:true
    },
    description:{
        type:String,
        required:[true,'Please Enter Description']
    },
    price:{
        type:Number,
        required:[true,'Please Enter product Price'],
        maxlength:[8,'price Cannot Exceed 8 Charcters']
    },
    ratings:{
        type:Number,
        default:0
    },
    images:[{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    }
],
category:{
    type:String,
    required:[true,"Please Enter Product Category"],
},
stock:{
    type:Number,
    required:[true,"Please Enter Product Category"],
    maxlength:[4,"Stock Cannot Exceed 4 Character"],
    default:1
},
numOfReviews:{
    type:Number,
    default:0
},
reviews:[
    {
        user:{
        type:mongoose.Schema.ObjectId,
        ref:"user",
        required:true  
    },
        name:{
            type:String,
            required:true
        },
        rating:{
            type:Number,
            maxlength:5
        },
        comment:{
            type:String,
            required:true
        }
    }
],
    createdAt:{
        type:Date,
        default:Date.now()
    }
})

const productModel=mongoose.model('Products',ProductSchema)

module.exports=productModel