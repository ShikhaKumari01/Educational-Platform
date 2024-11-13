const Profile=require("../models/Profile")
const User=require("../models/User")



exports.updateProfile=async(req,res)=>{
    try{
        const {gender,dateOfBirth="",about="",contactNumber}=req.body;

        const userId=req.user.id

        if(!gender || !contactNumber || !userId){
            return res.status(400).json({
                success:false,
                message:"Fill the required fields"
            })
        }

        const userDetails=await User.findById(userId)

        const profileId=userDetails.additionalDetails

        const profileDetails=await Profile.findById(profileDetails)

        profileDetails.gender=gender,
        profileDetails.dateOfBirth=dateOfBirth,
        profileDetails.about=about,
        profileDetails.contactNumber=contactNumber

        await profileDetails.save()

        return res.status(200).json({
             success:true,
            message:"Profile details updated successfully",
            profileDetails

        })

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to update profile details",
            error:error.message
        })
    }
}


//delete account

exports.deleteAccount=async (req,res)=>{
    try{
        const userId=req.user.id;
        const userDetails=await User.findById(userId)

        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }

        
        const profileId=userDetails.additionalDetails;

        await Profile.findByIdAndDelete({_id:profileId})

        await User.findByIdAndDelete({_id:userId})

        return res.status(200).json({
            success:true,
            message:"User account deleted successfully"
        })


    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to delete user profile",
            error:error.message
        })
    }
}

exports.getAllUserDetails=async(req,res)=>{
    try{
         const userId=req.user.id

         const userDetails=await User.findById(userId).populate("additionalDetails").exec()
         
         return res.status(200).json({
            success:true,
            message:"Fetched userDetails successfully",
            userDetails
        })

    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to fetch all user details",
            error:error.message
        })
    }
}
