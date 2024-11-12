const Section=require("../models/Section")
const Course=require("../models/Course");
const { create } = require("../models/Category");

exports.createSection=async (req,res)=>{
    try{
        const {sectionName,courseId}=req.body;
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"Missing properties"
            })
        }

        const newSection=await Section.create({sectionName})

        const updateCourse=await Course.findByIdAndUpdate(courseId,
            {
                $push:{
                    courseContent:newSection._id
                }
            },{new:true});
        
        return res.status(200).json({
            success:true,
            message:"Section created successfully",
            updateCourse
        })
      
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to create section",
            error:error.message
        })
    }
}



exports.updateSection=async (req,res)=>{
    try{
        const {sectionName,sectionId}=req.body;
        if(!sectionName|| !sectionId){
            return res.status(400).json({
                success:false,
                message:"All fields are mandatory"
            })
        }

        const updateSection=await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true})

        return res.status(200).json({
            success:true,
            message:"Section updated successfully"
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to update section",
            error:error.message
        }) 
    }
}


exports.deleteSection=async(req,res)=>{
    try{
        //const {sectionId}=req.body;
        const {sectionId}=req.params
        await Section.findByIdAndDelete(sectionId)

        return res.status(200).json({
            success:true,
            message:"Section deleted successfully"
        }) 

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to delete section",
            error:error.message
        }) 
    }
}