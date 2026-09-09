import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {z} from "zod";
import {usernameValidation} from "@/schemas/signUpSchema";

const UsernameQuerySchema=z.object({
    username:usernameValidation
})

export async function GET(request:Request){
    try{
      const {searchParams} = new URL(request.url);
      const queryParam = {
        username: searchParams.get("username")
      };

      const result = UsernameQuerySchema.safeParse(queryParam);
      if(!result.success){
        const usernameErrors = result.error.format().username?._errors;
        return Response.json(
          {success:false, message: usernameErrors?.join(",") || "Invalid username"},
          {status:400}
        );
      }

      await dbConnect();

      const {username} = result.data;
      const existingVerifiedUser = await UserModel.findOne({username, isVerified:true});

      if(existingVerifiedUser){
        return Response.json({
          success:false,
          message:"Username already exists",
        }, {status:400});
      }

      return Response.json({
        success:true,
        message:"Username is available",
      }, {status:200});
    } catch(error) {
      console.error("Error checking username uniqueness:", error);
      return Response.json(
        {success:false, message:"Username service is temporarily unavailable"},
        {status:503}
      );
    }
}