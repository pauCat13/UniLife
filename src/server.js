const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const surveyRoutes = require("./surveyRoutes");

const serviceAccount = require("../config/serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();


//middleware
app.use(cors()); //alows cross origin requests from frontend
app.use(express.json()); // parse JSON bodies


//routes
app.use("/api", surveyRoutes(db)); //mount surveyRoutes on api survey

//Start server

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`We runnin out here on port ${PORT}`);
});

module.exports = { db };