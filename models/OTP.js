const mongoose=require("mongoose");

const otpSchema=new mongoose.Schema({
    email:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60
    },
    otp:{
        type:String,
        required:true
    }
})


// pre-save hook: kyuki db me entry save karne se pehle mail send karna h otp verification ke liye

async function sendVerificationEmail(email,otp) {
    try{
        const mailResponse=await mailSender(email,"Verification mail from StudyNotion", otp)
        console.log("Email sent successfully",mailResponse)
    }
    catch(error){
        console.log("Error occurred while sending mail",error)
        throw error
    }
}

otpSchema.pre("save", async function(next) {
    await sendVerificationEmail(this.email,this.otp)
    next()
})

module.exports=mongoose.model("OTP",otpSchema)