const connectToMongo = require("./db");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const app = express();
const port = 3333;

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // specify the frontend origin
  credentials: true, // allow credentials (cookies)
}));

app.use(cookieParser());

// Increase JSON and URL-encoded payload size limits to handle larger requests
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect to MongoDB
connectToMongo();

// Serve static files from the 'upload' directory
app.use('/upload', express.static(path.join(__dirname, 'upload')));

// Route configuration
app.use("/ifl_system/auth", require("./Routes/auth"));
app.use("/ifl_system/adminCase", require("./Routes/adminCase"));
app.use("/ifl_system/studentCase", require("./Routes/studentCase"));
app.use("/ifl_system/donorCase", require("./Routes/donorCase"));
app.use("/ifl_system/2fa", require("./Routes/2FA"));

// Start the server
app.listen(port, () => {
  console.log(`IFL System is listening on http://localhost:${port}`);
});
