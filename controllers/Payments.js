const {instance}=require("../config/razorpay")
const Course=require("../models/Course")
const User=require("../models/User")
const mailSender=require('../utils/mailSender')
const {courseEnrollmentEmail}=require("../mail/templates/courseEnrollmentEmail")
const { default: mongoose } = require("mongoose")


//capture the payment and initiate the Razorpay order


exports.capturePayment=async(req,res)=>{
   
        //get courseId, userId
        const userId=req.user.id
        const {courseId}=req.body

        //validation
        //valid courseId
        if(!courseId){
            return res.status(400).json({
                success:false,
                message:"Please provide valid courseId"
            })
        }

    
        //valid courseDetail
        let course;
        try{
            course=await Course.findById(courseId)
            if(!course){
                return res.status(400).json({
                    success:false,
                    message:"Could not find the course"
                })
            }

            //user already pay for the same course

            const uid=new mongoose.Types.ObjectId(userId)

            if(course.studentEnrolled.includes(uid)){
                return res.status(400).json({
                    success:false,
                    message:"Student is already enrolled"
                })
            }

        }
        catch(error){
            console.log(error);
            return res.status(500).json({
                success:false,
                message:error.message
            })
        }
        
        
        //create order

        const amount=course.price
        const currency="INR"

        const options={
            amount:amount*100,
            currency,
            receipt:Math.random(Date.now()).toString(),
            notes:{
                courseId:courseId,
                userId
            }
        }

        try{
            //initiate the payment using razorpay
            const paymentResponse=await instance.orders.create(options)
            console.log(paymentResponse)

            return res.status(200).json({
                success:true,
                courseName:course.courseName,
                courseDescription:course.courseDescription,
                thumbnail:course.thumbnail,
                orderId:paymentResponse.id,
                currency:paymentResponse.currency,
                amount:paymentResponse.amount

            })

        }
        catch(error){
            console.log(error)
            return res.status(500).json({
                success:false,
                message:"Could not initiate order"
            })
        }
        //return res

}


//verify Signature of Razorpay and server

exports.verifySignature=async(req,res)=>{

    //our secret code
    const webhookSecret="12345678"

    //secret code jo razorpay ne bheja hai hash karke
    const signature=req.headers["x-razorpay-signature"]

    //niche ke 3 steps se humara webhookSecret convert hota h encrypted format me
    
    const shasum=crypto.createHmac("sha256",webhookSecret)

    shasum.update(JSON.stringify(req.body))

    const digest=shasum.digest("hex")

    //--------------x---------------

    if(signature===digest){
        console.log("Payment is authorized")

        const {userId,courseId}=req.body.payload.payment.entity.notes

        try{
            //fulfill the action
            //find the course and enroll the student in it

            const enrolledCourse=await Course.findOneAndUpdate(
                {id:courseId},
                {
                    $push:{
                        studentEnrolled:userId
                    },
            
                }
                ,{new:true}
            )

            if(!enrolledCourse){
                return res.status(500).json({
                    success:false,
                    message:"Course not found"
                })
            }
            console.log(enrolledCourse)

            //find the student and add the course to their enrolledCourses

            const enrolledStudent=await User.findOneAndUpdate(
                {_id:userId},
                {
                    $push:{
                        courses:courseId
                    }
                },
                {new:true}
            )

            console.log(enrolledStudent);

            //mail confirmation mail

            const emailResponse=await mailSender(enrolledStudent.email,
                "Congratulations from CodeHelp",
                "Congratulations, you are onboarded into new Course of CodeHelp"
            )

            console.log(emailResponse)

            return res.status(200).json({
                success:true,
                message:"Signature verified and course addded"
            })

        }
        catch(error){
            console.Consolelog(error)
            return res.status(500).json({
                success:false,
                message:error.message
            })
        }
    }

    else{
        return res.status(400).json({
            success:false,
            message:"Invalid request"
        }) 
    }
    

    


}