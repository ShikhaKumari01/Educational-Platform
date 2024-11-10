const User=require("../models/User")
const mailSender=require("../utils/mailSender")
const bcrypt=require("bcrypt")


//resetPasswordToken -- mail send karne ka kaam yahi kar rhe h

exports.resetPasswordToken=async (req,res)=>{
    try{
        //fetch email from req body
        const email=req.body.email;
        //check user for this email, email validation
        const user=await User.findOne({email:email})
        if(!user){
            return res.status(403).json({
                success:false,
                message:"Your email is not registered with us "
            })
        }
        //generate token
        const token=crypto.randomUUID();
        //update user by adding token and expiration time
        const updatedDetails=await User.findByIdAndUpdate({email},{token:token,resetPasswordExpires:Date.now()+5*60*1000},{new:true})
        //create url for resetPassword
        const url=`https://localhost:3000/update-password/${token}`
        //send mail containing url
        await mailSender(email,"Password reset link ",`Password Reset Link :${url}`)
        //return res

        return res.status(200).json({
            success:true,
            message:"Email set successfully"
        })
        

    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Facing error while sending email to reset the password"
        })
    }
}

//resetPassword -- dB me new Password reset kiya jaa raha h isse

exports.resetPassword=async (req,res)=>{
    try{
        //data fetch
        const {password,confirmPassword,token}=req.body
        //validation
        if(password!==confirmPassword){
            return res.status(401).json({
                success:false,
                message:"Password not matching"
            })
        }
        //get userDetails from db using token
        const userDetails=await User.findOne({token:token})
        //if no entry--invalid token / time expires
        if(!userDetails){
            return res.status(401).json({
                success:false,
                message:"Token is invalid"
            })
        }
        if(userDetails.resetPasswordExpires<Date.now()){
            return res.status(401).json({
                success:false,
                message:"Token time expires,please regenerate your password"
            })
        }
        //hash password
        const hashedPassword=await bcrypt.hash(password,10);

        //update password
        await User.findByIdAndUpdate({token:token},{password:hashedPassword},{new:true})
        //return res
        return res.status(200).json({
            success:true,
            message:"Password reset successful"
        })

    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:true,
            message:"Fail to reset the password"
        })
    }
}