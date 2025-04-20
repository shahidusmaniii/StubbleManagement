const mongoose = require("mongoose");
require('dotenv').config();

// Use environment variable instead of config
const db = process.env.MONGO_URI;

function connectDB() {
      mongoose.set('strictQuery', false);
      mongoose.connect(db)
      .then(() => {
            console.log("Successfully Connected to the DB");
      })
      .catch((err) => {
            console.log("Error Occured at DB connection", err);
      });
}

module.exports = connectDB;