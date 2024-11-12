const SubSection=require("../models/SubSection")
const Section=require("../models/Section")
const {imageUploader}=require("../utils/imageUploader")
require("dotenv").config()

exports.createSubSection=async(req,res)=>{
    try{
        const {title,timeDuration,description,sectionId}=req.body

        const video=req.files.videoFile

        if(!title || !timeDuration || !description || !video || !sectionId){
            return res.status(400).json({
                success:false,
                message:"All fields are required"
            })
        }

        const videoFile=await imageUploader(video,process.env.FOLDER_NAME)


        const newSubsection= await SubSection.create({title:title,
            timeDuration:timeDuration,
            description:description,videoUrl:videoFile.secure_url});

        const updateSection=await Section.findByIdAndUpdate({_id:sectionId},{
            $push:{
                subSection:newSubsection._id
            }
        },{new:true})

        return res.status(200).json({
            success:true,
            message:"Subsection created successfully",
            updateSection
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to create Subsection",
            error:error.message
        })
    }
}


exports.updateSubSection=async(req,res)=>{
    try{

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to update Subsection",
            error:error.message
        })
    }
}

exports.deleteSubSection=async(req,res)=>{
    try{

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to delete Subsection",
            error:error.message
        })
    }
}