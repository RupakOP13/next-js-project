import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { signUpSchema } from "@/schemas/signUpSchema";

export async function POST(req: Request) {
    try{
        await dbConnect();

const body = await req.json();
const parsedBody = signUpSchema.safeParse(body);

if (!parsedBody.success) {
    return Response.json({ success: false, message: "Invalid sign-up details." }, { status: 400 });
}

const { username, email, password } = parsedBody.data;

const existingUserVerifiedByUsername=await UserModel.findOne({
    username,
    isVerified:true
})

if(existingUserVerifiedByUsername){
    return new Response(JSON.stringify({ success: false, message: "Username already exists." }), { status: 400 });
}
const existingUserByEmail=await UserModel.findOne({email});

const verifyCode=Math.floor(100000+Math.random()*900000).toString();

if(existingUserByEmail){
   if(existingUserByEmail.isVerified){
        return new Response(JSON.stringify({ success: false, message: "User already exist with this email." }), { status: 400 });
    }

    else{
const hashedPassword=await bcrypt.hash(password,10);
existingUserByEmail.password=hashedPassword;
existingUserByEmail.verifyCode=verifyCode;
existingUserByEmail.verifyCodeExpiry=new Date(Date.now()+60*60*1000);
await existingUserByEmail.save();
    }
}
    else{
        const hashedPassword=await bcrypt.hash(password,10);
        const expiryDate=new Date();
        expiryDate.setHours(expiryDate.getHours()+1);

    const  newUser= new UserModel({
             username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessages: true,
                messages: []
        })

        await newUser.save();
    }
    //send verification email

    const emailResponse=await sendVerificationEmail(email,username,verifyCode);

    if(!emailResponse.success){
        return new Response(JSON.stringify({ success: false, message: emailResponse.message }), { status: 500 });
    }


return new Response(JSON.stringify({ success: true, message: "User registered successfully. Please check your email for verification." }), { status: 201 });

    }


    catch(error){
        console.error("Error during sign-up:", error);
        return new Response(JSON.stringify({ success: false, message: "Internal server error." }), { status: 500 });
    }
}
