import { response } from "express"
import { mailtrapClient, sender } from "./mailtrap.config.js"
import { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from './emailTemplates.js'

export const sendVerificationEmail = async (email, verificationToken) =>{
const recipient = [{email}]

try{
    const response = await mailtrapClient.send({
        from:sender,
        to:recipient,
        subject: "Verify your Email",
        html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
        category: "Email Verification"
    })
    console.log("Email sent successfully ", response)
}catch(error){
    console.log("Error sendinf email ", error);
    throw new Error(`Error sending verificaton email: ${error}`);
}
}

export const sendWelcomeEmail = async (email, name) =>{
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from:sender,
            to:recipient,
            template_uuid: "70b40485-aa7f-4708-975e-317934b145ed",
            template_variables:{
                 "company_info_name": "Authentication System",
                    "name": name
            },
        });
        console.log("Welcome Email sents successfully ", response);

    } catch (error) {
        console.log("Error sending Welcome email ", error);
        throw new Error(`Error sending Welcome email: ${error}`);
    }
}

export const sendPasswordResetEmail = async (email, resetURL) =>{
    const recipient = [{ email }];
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password Reset"
        });
        console.log("Forgot password Email Sent successfully", response);

    } catch (error) {
        console.log("Error Sending Email", error);
        throw new Error(`Error Sending forgoit password Email: ${error}`);
    }
}

export const sendResetSuccessEmail = async (email)=>{
    const recipient = [{email}];
    try {
         const response = await mailtrapClient.send({
        from: sender,
        to: recipient,
        subject: "Password reset successfully",
        html: PASSWORD_RESET_SUCCESS_TEMPLATE,
        category: "Password Reset Successfull"
    });
    console.log("Reset pasword Email sent successfully ", response);
    } catch (error) {
        console.log("Error Sending reset password Email ", error);
        throw new Error(`Error sending password reset email: ${error}`);
    }
   
}