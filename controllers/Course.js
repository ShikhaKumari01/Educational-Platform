const Course=require("../models/Course")
const User=require("../models/User")
const Category=require("../models/Category")
const {uploadImageToCloudinary}=require("../utils/imageUploader")
require("dotenv").config()


exports.createCourse=async (req,res)=>{
    try{
        //fetch data
        const {name,description,whatYouWillLearn,price,category}=req.body;

        //fetch file
        const thumbnail=req.files.thumbNailImage


        //data validation
        if(!name || !description || !whatYouWillLearn || !price || !category || !thumbnail){
            return res.status(400).json({
                success:false,
                message:"All fields are mandatory"
            })
        }

        //we need instructor details
        const userId=req.user.id;
        const instructorDetails=await User.findById(userId)

    
        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instructor details not found"
            })
        }

        //check tagId is valid or not
        const categoryDetails= await Category.findById(category)

        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message:"Category details not found"
            })
        }

        //upload image to cloudinary
        const thumbNailImage=await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME)

        const newCourse=await Course.create({
            name,
            description,
            instructor:instructorDetails._id,
            whatYouWillLearn,
            price,
            thumbnail:thumbNailImage.secure_url,
            category:categoryDetails._id,
        }
        )

        //update user
        await User.findByIdAndUpdate({_id:instructorDetails._id},
            {
                $push:{
                    courses:newCourse._id
                }
            },{new:true}
        )


        //update Tag Schema
        await Category.findByIdAndUpdate({_id:categoryDetails._id},
            {
                $push:{
                    course:newCourse._id
                }
            },{new:true}
        )

        //return res
        return res.status(200).json({
            success:true,
            messgae:"Course created successfully",
            data:newCourse
        })
    }
    catch(error){
        console.log(error);
        
        return res.status(500).json({
            success:false,
            message:"Failed to create course",
            error:error.message
        })
    }
}

exports.showAllCourses=async (req,res)=>{
    try{
        const allCourses= await Course.find({});
        return res.status(200).json({
            success:true,
            message:"All courses returned successfully",
            data:allCourses
        })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"Cannot fetch course data",
            error:error.message
        })
    }
}
