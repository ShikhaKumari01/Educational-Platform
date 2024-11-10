const User=require("../models/User")
const OTP=require("../models/OTP")
const otpGenerator=require("otp-generator");
const Profile = require("../models/Profile");
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")

require("dotenv").config()

//sendOTP
exports.sendOTP=async (req,res)=>{
    try{
        const email=req.body;
        const checkUserPresent=await User.findOne({email});
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:"User already exists"
            })
        }

        let otp=otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false
        })

        const result=await OTP.findOne({otp:otp});
        while(result){
            otp=otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false
            })
            result=await OTP.findOne({otp:otp});
        }
        const otpPayload={email,otp};
        const otpBody=await OTP.create(otpPayload)


        return res.status(200).json({
            success:true,
            message:"OTP sent successfully",
            otp
        })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }

}

//signUp
exports.signUp=async (req,res)=>{
    try{
        //data fetch from req body
        const {firstName,lastName,email,password,confirmPassword,accountType,contactNumber,otp}=req.body;
        
        //validate kro
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success:false,
                message:"All fields are required"
            })
        }

        //dono password match karo
        if(password!==confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password and confirmPassword does not match, please try again"
            })
        }
        let checkEmail=await User.findOne({email});
        if(checkEmail){
            return res.status(400).json({
                success:false,
                message:"User is already registerd"
            })
        }
        
        //find most recent otp stored for the user
        const recentOtp=await OTP.find({email}).sort({createdAt:-1}).limit(1);

        if(recentOtp.length==0){
            return res.status(400).json({
                success:false,
                message:"Otp not found"
            })
        }
        else if(recentOtp.otp!==otp){
            return res.status(400).json({
                success:false,
                message:"Otp does not match"
            })
        }


        //hash password
        const hashedPassword= await bcrypt.hash(password,10);
        //create entry in db'

        const profileDetails=await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null
        })
        const user=await User.create({
            firstName,
            lastName,
            email,password:hashedPassword,accountType,
            contactNumber,
            additionalDetails:profileDetails._id,
            image:`https://ui-avatars.com/api/?name=${firstName}+${lastName}`
        })
        //return res
        return res.status(200).json({
            success:true,
            message:"User signed up successfully",
            user
        })

    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Issue while signing up"
        })
    }
}


//logIn

exports.login=async(req,res)=>{
    try{
        //get data from req body
        const {email,password}=req.body;
        //validate data
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All fields are mandatory"
            })
        }
        //user check - exist or not
        let user=await User.findOne({email})
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered, please sign up first"
            })
        }

        
        //password matching
        if(await bcrypt.compare(password,user.password)){
            //generate jwToken
            const payload={
                email:user.email,
                accountType:user.accountType,
                id:user._id
            }

            const token=jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:'2h'
            })

            user.token=token;
            user.password=undefined


            //create cookie and return res
            const options={
                expires:new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true
            }
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in successfully"
            })
        }
        else{
            return res.status(401).json({
                success:false,
                message:"Password is incorrect"
            }) 
        }
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Issue while logging in"
        })
    }
}


//changePassword

exports.changePassword=async(req,res)=>{
    //get data from req body
    //oldPassword,newPassword,confirmNewPassword
    //validation
    //update pwd in DB
    //send mail - Password updated
    //return res
}