const express=require('express')
const app=express();
const cookieParser=require('cookie-parser')
const errorMiddleWare=require('./middleware/error')
const path=require('path')
// Config
if (process.env.NODE_ENV !== "PRODUCTION") {
    require("dotenv").config({ path: "backend/config/config.env" });
  }
const bodyParser=require('body-parser')

const fileUpload=require('express-fileupload')

const product=require('./routes/productsRoute')
const user=require('./routes/userRoute')
const order=require('./routes/orderRoute')
const payment=require('./routes/paymentRoute')
app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended:true}))
app.use(fileUpload())
//Set the Route
app.use('/api/v1',product);
app.use('/api/v1',user);
app.use('/api/v1',order)
app.use('/api/v1',payment)

// app.use(express.static(path.join(__dirname+"../frontend/build")))
// app.use(express.static('public'));

// app.get('*',(req,res)=>{
//   res.sendFile(path.resolve(__dirname+"../frontend/build/index.html"))
// })

//Middleware for Error
app.use(errorMiddleWare)



module.exports=app;