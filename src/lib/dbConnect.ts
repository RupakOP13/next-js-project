import mongoose from "mongoose";

type ConnectionObject={
    isConnected?:number
}

const connection:ConnectionObject={}

async function dbConnect():Promise<void>{
    if(connection.isConnected){
        console.log('already connected');
        return;
    }

    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error('MONGODB_URI is not defined in the environment');
    }

    try{
       const db= await mongoose.connect(uri,{
           serverSelectionTimeoutMS:5000,
           connectTimeoutMS:5000,
       });
       connection.isConnected=db.connections[0].readyState;
       console.log("DB connected");
    }
    catch(error){
        console.error("DB connection error:",error);
        throw error;
    }


}

export default dbConnect;