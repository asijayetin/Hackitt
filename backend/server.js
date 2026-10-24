require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 5000;

async function startServer() {
    await connectDB();
    app.listen(PORT, function () {
        console.log("Hackitt API running on port " + PORT);
    });
}

startServer();
