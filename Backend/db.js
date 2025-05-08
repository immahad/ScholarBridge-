const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env" });
const mongoURI = "mongodb://localhost:27017/"
// const mongoURI = "mongodb+srv://mishaqbee22seecs:studentprofile@cluster0.wmpkskq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0" // Corrected to match the environment variable name

const connectToMongo = () => {
  mongoose
    .connect(mongoURI)
    .then(() => {
      console.log("Connected to MongoDB successfully");
    })
    .catch((error) => {
      console.error("Error connecting to MongoDB:", error);
    });
};

module.exports = connectToMongo;
