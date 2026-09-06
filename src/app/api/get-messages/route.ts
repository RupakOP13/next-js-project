import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Types } from "mongoose";
import { User } from "next-auth";

export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if (!session || !session.user) {
        return new Response(JSON.stringify({success: false, message: "User not authenticated"}), {status: 401});
    }

    const userId = new Types.ObjectId(user._id);

    try {
        const users = await UserModel.aggregate([
            {$match:{_id:userId}},
            {$unwind:"$messages"},
            {$sort:{"messages.createdAt":-1}},
            {$group:{
                _id:"$_id",
                messages:{$push:"$messages"},
            }}
        ]);

        if (!users || users.length === 0) {
            return new Response(JSON.stringify({success: false, message: "User not found"}), {status: 404});
        }

        return new Response(JSON.stringify({success: true, messages: users[0].messages}), {status: 200});
    } catch (error) {
        console.error("Error fetching user data:", error);
        return new Response(JSON.stringify({success: false, message: "Internal server error"}), {status: 500});
    }
}
