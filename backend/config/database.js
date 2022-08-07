const mongoose=require('mongoose')

const ConnectDatabase=()=>{

    
    mongoose.connect(process.env.MONGO_URL,{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true}).then((data)=>{
        console.log(`Mongodb Server Connected With Server : ${data.connection.host}`);
    })
}

module.exports=ConnectDatabase




