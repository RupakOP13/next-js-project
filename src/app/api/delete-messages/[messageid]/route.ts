import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Types } from "mongoose";
import { User } from "next-auth";
import { ApiResponse } from "@/types/ApiResponse";

export async function DELETE(request: Request,{params}: {params:{messageid:string}}) {
    const messageId=params.messageid;
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user) {
        return new Response(JSON.stringify({success: false, message: "User not authenticated"}), {status: 401});
    }

    try{
        await UserModel.updateOne(
            {_id:user._id}
        , {$pull: {messages: { _id: messageId }}})

        if(updateResult.modifiedCount==0){
            return new Response(JSON.stringify({success: false, message: "Message not found"}), {status: 404});
        }
        return new Response(JSON.stringify({success: true, message: "Message deleted successfully"}), {status: 200});
    }
    catch(error){
        console.error("Error deleting message:", error);
        return new Response(JSON.stringify({success: false, message: "Internal server error"}), {status: 500});
    }

}
