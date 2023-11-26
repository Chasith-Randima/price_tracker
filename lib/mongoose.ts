import mongoose from "mongoose";

let isConnected = false;
export const connectToDB = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URI)
    return console.log("MONGODB_URI is not defiend");

  if (isConnected) return console.log("Using exisiting database connection..");

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    isConnected = true;

    console.log("DB connected successfully..");
  } catch (error) {
    console.log(error);
  }
};

// mongoose.connect(url, {}).then(() => {
//   console.log("DB Connected Successfully...");
// }).catch(error){
//     console.log(`DB error ${error.msg}`)
// }
