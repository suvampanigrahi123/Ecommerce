const app=require('./app')
const dotenv=require('dotenv')
 const ConnectDatabase=require('./config/database')
const cloudinary=require('cloudinary')

 //Handling Uncaught Exception

 process.on('uncaughtException',(err)=>{
     console.log(`Error :- ${err.message}`);
     console.log(`Shouting the Server Due to uncaught Exception`);
         process.exit(1)
 })


//config

dotenv.config({path:'backend/config/config.env'})


//Connecting to Database
ConnectDatabase();


//add Cloudinary

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

app.get('/',(req,res)=>{
    res.send('<h1>Hello World</h1>')
})

const server=app.listen(process.env.PORT,()=>{
    console.log(`Server is Working at http://${process.env.ENDPOINT}:${process.env.PORT}`);
})



//unHandled Promise Rejection
process.on('unhandledRejection',err=>{
    console.log(` Error :- ${err.message} `)
    console.log('Shouting Down the Server Due to unhandled Promise rejection');
    server.close(()=>{
        process.exit(1);
    })
})