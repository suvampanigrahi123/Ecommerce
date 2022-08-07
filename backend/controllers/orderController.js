const Order=require('../models/orderModel')
const productModel =require('../models/productModel')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncError=require('../middleware/catchAsyncError');


//Create New Order
exports.newOrder=catchAsyncError(async(req,res,next)=>{
    const {shippingInfo,orderItems,paymentInfo,itemPrice,taxPrice,shippingPrice,totalPrice}=req.body;

    const order=await Order.create({
        shippingInfo,orderItems,paymentInfo,itemPrice,taxPrice,shippingPrice,totalPrice,paidAt:Date.now(),user:req.user._id
    })

    res.status(201).json({
        success:true,
        order
    })
})

//get Single Order
exports.getSingleOrder=catchAsyncError(async(req,res,next)=>{
    const order=await Order.findById(req.params.id).populate("user","name email");
    if(!order){
        return next(new ErrorHandler("Order Not Found with this Id ",404))
    }

    res.status(200).json({
        success:true,
        order,
    })
})


//get Loggedin User Order
exports.myOrders=catchAsyncError(async(req,res,next)=>{
    const orders=await Order.find({user:req.user._id});
    res.status(200).json({
        success:true,
        orders,
    })
})


//get all Orders--Admin
exports.getAllOrders=catchAsyncError(async(req,res,next)=>{
    const orders=await Order.find();

    let totalAmount=0;
    orders.forEach((ord)=>{
        totalAmount+=ord.totalPrice;
    })

    res.status(200).json({
        success:true,
        orders,
        totalAmount
    })
})


//update Order Status--Admin
exports.updateOrder=catchAsyncError(async(req,res,next)=>{
    const order=await Order.findById(req.params.id);
    if(!order){
        return next(new ErrorHandler("Order Not Found with this Id ",404))
    }
    if(order.orderStatus==='Delivered'){
        return next(new ErrorHandler("you have Already delivered this order",400))
    }
    if(order.orderStatus==='Shipped'){
        order.orderItems.forEach(async(order)=>{
            await updateStock(order.product,order.quantity)
        })
    }


    order.orderStatus=req.body.status;
    if(req.body.status==="Delivered"){
        order.deliveredAt=Date.now()
    }

    await order.save({validateBeforeSave:false})
    res.status(200).json({
        success:true,
        order,
    })
})

async function updateStock(id,quantity){
    const product=await productModel.findById(id)
    product.stock-=quantity
    await product.save()
}

//Delete Order--Admin
exports.deleteOrder=catchAsyncError(async(req,res,next)=>{
    const order=await Order.findById(req.params.id)

    if(!order){
        return next(new ErrorHandler("Order Not Found with this Id ",404))
    }
    await order.remove();

    res.status(200).json({
        success:true,
    })
})

// exports.newOrder=catchAsyncError(async(req,res,next)=>{})