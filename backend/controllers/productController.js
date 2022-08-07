const productModel =require('../models/productModel')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError=require('../middleware/catchAsyncError');
const ApiFeature = require('../utils/apiFeature');
const cloudinary=require('cloudinary')

//Create Product ---admin

exports.createProduct= catchAsyncError(async(req,res,next)=>{
   
    let images=[]
    if(typeof req.body.images==='string'){
        images.push(req.body.images)
    }else{
        images=req.body.images;
    }
    
    const imagesLink=[];
    for(let i=0;i<images.length;i++){
        const result=await cloudinary.v2.uploader.upload(images[i],{folder:'products'})
        imagesLink.push({
            public_id:result.public_id,
            url:result.secure_url
        })
    }
    
    req.body.images=imagesLink;
    req.body.user=req.user.id
    const product=await productModel.create(req.body)
    res.status(201).json({
        success:true,
        product
    })
});


//Get all Products

exports.getAllProducts = catchAsyncError(async (req, res, next) => {
    const resultPerPage = 8;
    const productsCount = await productModel.countDocuments()-1;
  
    const apiFeature = new ApiFeature(productModel.find(), req.query)
      .search()
      .filter();
  
    let products = await apiFeature.query;
  
    let filteredProductsCount = products.length;
  
    apiFeature.pagination(resultPerPage);
  
    products = await apiFeature.query;
  
    res.status(200).json({
      success: true,
      products,
      productsCount,
      resultPerPage,
      filteredProductsCount,
    });
  });

//get All Products--Admin
exports.getAllProductsAdmin = catchAsyncError(async (req, res, next) => {
    let products = await productModel.find();
    res.status(200).json({
      success: true,
      products,
    });
  });

//Get 1 Product Details
exports.getProductsDetails=catchAsyncError(async(req,res,next)=>{
    let product=await productModel.findById(req.params.id)
    if(!product){
       return next(new ErrorHandler("Product Not Found",404))
    }

    res.status(200).json({
        success:true,
        product
    })
});
//Update the Product--admin

exports.updateProduct=catchAsyncError( async(req,res,next)=>{
    let product=await productModel.findById(req.params.id)
    if(!product){
        return next(new ErrorHandler("Product Not Found",404))
     }

     //Delete Old Images And Add New Images
     let images=[]
     if(typeof req.body.images==='string'){
         images.push(req.body.images)
     }else{
         images=req.body.images;
     }

     if(images!==undefined){
         for(let i=0;i<product.images.length;i++){
             await cloudinary.v2.uploader.destroy(product.images[i].public_id)
            }
            const imagesLink=[];
            for(let i=0;i<images.length;i++){
                const result=await cloudinary.v2.uploader.upload(images[i],{folder:'products'})
                imagesLink.push({
                    public_id:result.public_id,
                    url:result.secure_url
                })
            }   
            req.body.images=imagesLink;
        }
        product=await productModel.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true,useFindAndModify:false})
        
        res.status(200).json({
            success:"Update successfully",
            product
        })
});



//Delete Product
exports.deleteProduct=catchAsyncError(async(req,res)=>{
    let product= await productModel.findById(req.params.id)
    if(!product){
        return next(new ErrorHandler("Product Not Found",404))
     }

     //Delete Images From Coludinary
     for(let i=0;i<product.images.length;i++){
       await cloudinary.v2.uploader.destroy(product.images[i].public_id)
     }

   await product.remove()

     res.status(200).json({
        success:true,
        message:"Product Delete successfully"
    })
});


//Create New Review or Update the Review 

exports.createProductReview=catchAsyncError(async(req,res,next)=>{
    const {rating,comment,productId}=req.body
    const review={
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment,
    }
    const product=await productModel.findById(productId)
   const isReviwed=product.reviews.find((rev)=>rev.user.toString()===req.user._id.toString())
    if(isReviwed){
        product.reviews.forEach((rev)=>{
            if(rev.user.toString()===req.user._id.toString())
            rev.rating=rating,
            rev.comment=comment
        })
    }else{
        product.reviews.push(review)
        product.numOfReviews=product.reviews.length
    }

    let sum=0;
    product.reviews.forEach((rev)=>{
        sum+=rev.rating      
    })
    product.ratings=sum/product.reviews.length;
    await product.save({validateBeforeSave:false});

    res.status(200).json({
        success:true,

    })
})

//get All reviews of a Product
exports.getProductReviews=catchAsyncError(async(req,res,next)=>{
    const product=await productModel.findById(req.query.productId)
    if(!product){
        return next(new ErrorHandler('product Not Found',404))
    }

    res.status(200).json({
        success:true,
        reviews:product.reviews
    });
})

//Delete Review
exports.deleteReviews=catchAsyncError(async(req,res,next)=>{
    const product=await productModel.findById(req.query.productId)
    if(!product){
        return next(new ErrorHandler('product Not Found',404))
    }
    const reviews=product.reviews.filter((rev)=>rev._id.toString()!==req.query.id.toString())

    let avg=0;

    reviews.forEach((rev)=>{
        avg+=rev.rating
    })

    let ratings=0;
    if(reviews.length===0){
        ratings=0;
    }else{        
        ratings=avg/reviews.length;
    }

    const numOfReviews=reviews.length;

    await productModel.findByIdAndUpdate(req.query.productId,{ratings,numOfReviews,reviews},{new:true,runValidators:true,useFindAndModify:false})

    res.status(200).json({
        success:true,

    })
})