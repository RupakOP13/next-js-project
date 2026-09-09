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
    return Response.json({
        success: false,
        message: parsedBody.error.issues[0]?.message ?? "Invalid sign-up details.",
    }, { status: 400 });
}

const { username, email, password } = parsedBody.data;

const escapedUsername = username.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const existingUserByUsername=await UserModel.findOne({
    username: {$regex: `^${escapedUsername}$`, $options: "i"},
})

if(existingUserByUsername?.isVerified){
    return new Response(JSON.stringify({ success: false, message: "Username already exists." }), { status: 400 });
}
const existingUserByEmail=await UserModel.findOne({email});

if(existingUserByEmail?.isVerified){
    return new Response(JSON.stringify({ success: false, message: "User already exists with this email." }), { status: 400 });
}

const verifyCode=Math.floor(100000+Math.random()*900000).toString();

if(existingUserByUsername){
const hashedPassword=await bcrypt.hash(password,10);
existingUserByUsername.email=email;
existingUserByUsername.password=hashedPassword;
existingUserByUsername.verifyCode=verifyCode;
existingUserByUsername.verifyCodeExpiry=new Date(Date.now()+60*60*1000);
existingUserByUsername.isVerified=false;
await existingUserByUsername.save();
}
else if(existingUserByEmail){
const hashedPassword=await bcrypt.hash(password,10);
existingUserByEmail.username=username;
existingUserByEmail.password=hashedPassword;
existingUserByEmail.verifyCode=verifyCode;
existingUserByEmail.verifyCodeExpiry=new Date(Date.now()+60*60*1000);
await existingUserByEmail.save();
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
        if (error && typeof error === "object" && "code" in error && error.code === 11000) {
            return new Response(JSON.stringify({ success: false, message: "Username or email already exists." }), { status: 400 });
        }
        return new Response(JSON.stringify({ success: false, message: "Internal server error." }), { status: 500 });
    }
}
