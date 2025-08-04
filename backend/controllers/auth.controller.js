import bcryptjs  from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/user.model.js';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
// import { sendVerificationEmail, sendWelcomeEmail , sendPasswordResetEmail, sendResetSuccessEmail } from '../mailtrap/emails.js';
import {
  sendSMTPVerificationEmail,
  sendSMTPPasswordResetEmail,
  sendSMTPResetSuccessEmail,
  sendSMTPWelcomeEmail
} from '../mailtrap/smtpEmails.js';

export const signup = async (req, res)=>{
    const {email, password, name} = req.body;
    try {
        if(!email || !password || !name){
            throw new Error("All feilds are requuired");
        }
        const userAlreadyExists = await User.findOne({email});
        console.log("userAlreadyExist ", userAlreadyExists);
        if(userAlreadyExists){
            return res.status(400).json({success: false , message : "User Already Exist"})

        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();


        const user = new User({email, password: hashedPassword, name, verificationToken, verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000}) //24 hours

        await user.save();

        //jwt 
        generateTokenAndSetCookie(res, user._id);
        // await sendVerificationEmail(user.email, verificationToken)
        await sendSMTPVerificationEmail(user.email, verificationToken);



        res.status(201).json({success: true, message:"User Created Successfully", user:{
            ...user._doc,
            password: undefined,
        } })

    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

export const verifyEmail = async (req, res)=>{
    const {code} = req.body;

    try{
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        })

        if(!user){
            return res.status(400).json({success: false, message: "Invalid or expired Verification Code"});

        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        // await sendWelcomeEmail(user.email, user.name);
        await sendSMTPWelcomeEmail(user.email, user.name);
        res.status(200).json({
            success: true,
             message: "Email Verified Successfully",
              user: {
                    ...user._doc,
                    password: undefined,
                },
    });
    }catch(error){
        console.error("Error verifying email:", error);
    res.status(500).json({
        success: false,
        message: "Internal Server Error",
    });
    }


}

export const login = async (req, res)=>{
    const {email, password} = req.body;
    try {
       const user = await User.findOne({email});
       if(!user){
        return res.status(400).json({success: false, message: "Invalid Credentials"});

       }

       const isPasswordValid = await bcryptjs.compare(password, user.password);
       if(!isPasswordValid){
        return res.status(400).json({success: false, message: "Invalid Password"});
       }

       generateTokenAndSetCookie(res, user._id);

       user.lastLogin = new Date();
       await user.save();

       res.status(200).json({success:true, message: "Logged In successfully", user:{
        ...user._doc,
        password: undefined,
       },
    });
    } catch (error) {
        console.log("Failed to logged in ", error);
        res.status(500).json({success: false,  message: error})
    }
}

export const logout = async (req, res)=>{
    res.clearCookie("token");
    res.status(200).json({success: true, message: "Logged out Successfully"})
}

export const forgotPassword = async(req, res)=>{
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
    if(!user){
        return res.status(400).json({success: false, message: "Invalid Email"});
    }
    //Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; //1 hour 

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();

    // await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);
   await sendSMTPPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

    res.status(200).json({success: true, message: "Password Reset link sent to your Registered Email"});
    } catch (error) {
        console.log("Failed to Forgot Email ", error);
        res.status(500).json({success: false, message: error.message})
    }
}

export const resetPassword = async(req, res)=>{
    try {
        const {token} = req.params;
        const {password} = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: {$gt: Date.now()}
        });
        if(!user){
            return res.status(400).json({success: false, message: "Invalid or expired reset Token"});
        }
        const hashedPassword = await bcryptjs.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken= undefined;
        user.resetPasswordExpiresAt= undefined
        await user.save();

        // await sendResetSuccessEmail(user.email);
        await sendSMTPResetSuccessEmail(user.email);

        res.status(200).json({success: true, message: "Password updated successfully", user:{
            ...user._doc,
            password: undefined
    }});

    } catch (error) {
        console.log("Error in reset Password ", error);
        res.status(500).json({success: false, message: error.message});
    }
}

export const checkAuth = async(req, res)=>{
    try {
        const user = await User.findById(req.userId);
        if(!user){
            return res.status(400).json({success: false, message: "User Not Found"});
        }
        res.status(200).json({success: true, user: {
            ...user._doc,
            password: undefined
        }});
    } catch (error) {
        console.log("Error in Authentication ", error);
        res.status(500).json({success: false, message: error.message});
    }
}