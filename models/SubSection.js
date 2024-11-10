const mongoose=require("mongoose");

const subSection=new mongoose.Schema({
    title:{
        type:String,
        trim:true
    },
    description:{
        type:String,
        trim:true
    },
    videoUrl:{
        type:String,
        trim:true
    },
    timeDuration:{
        type:String
    }
})

module.exports=mongoose.model("SubSection",subSection)