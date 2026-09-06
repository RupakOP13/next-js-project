import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {User} from "next-auth";

export async function POST(request: Request) {
    await dbConnect()

    const session = await getServerSession(authOptions);

    const user: User = session?.user

    if (!session || !session.user) {
        return new Response(JSON.stringify({success: false, message: "User not authenticated"}), {status: 401});
    }

    const userId=user._id;
    const {acceptMessages} = await request.json();

    try{
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessages: acceptMessages },
            { new: true }
        )
        if (!updatedUser) {
            return new Response(JSON.stringify({success: false, message: "User not found"}), {status: 404});
        }

        return Response.json({
            success: true,
            message: "Message acceptance status updated successfully",
            updatedUser

    },
    {status:200}
)
    }


    catch(error){
        console.error("Error updating message acceptance status:", error);
        return new Response(JSON.stringify({success: false, message: "Internal server error"}), {status: 500});
    }

}

export async function GET(request: Request) {
    await dbConnect()
       const session = await getServerSession(authOptions);

    const user: User = session?.user

    if (!session || !session.user) {
        return new Response(JSON.stringify({success: false, message: "User not authenticated"}), {status: 401});
    }

    const userId=user._id;

    try{

        const foundUser=await UserModel.findById(userId);
    if(!foundUser){
        return new Response(JSON.stringify({success: false, message: "User not found"}), {status: 404});
    }

    return Response.json({
        success:true,
        isAcceptingMessages:foundUser.isAcceptingMessages
    },{status:200});
    }
    catch(error){
        console.error("Error fetching message acceptance status:", error);
        return new Response(JSON.stringify({success: false, message: "Internal server error"}), {status: 500});
    }
}

