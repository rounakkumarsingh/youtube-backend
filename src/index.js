import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { asyncHandler } from "./utils/asyncHandler.js";

dotenv.config({
    path: "../.env",
    cridentials: true,
});

const startServer = asyncHandler(async () => {
    await connectDB();
    const server = app.listen(process.env.PORT || 8000, () => {
        console.log(`App is listening on port ${process.env.PORT || 8000}`);
    });
});

startServer().catch((error) => {
    console.log("MONGO CONNCTION ERROR: ", error);
});
// connectDB()
//     .then(() => {
//         app.listen(process.env.PORT || 8000, () => {
//             console.log(`App is listening on port ${process.env.PORT || 8000}`);
//         });
//     })
//     .catch((err) => {
//         console.log("MONGO CONNCTION ERROR: ", error);
//     });
