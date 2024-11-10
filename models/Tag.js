const mongoose=require("mongoose");

const tags=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
    }
})


module.exports=mongoose.model("Tag",tags)