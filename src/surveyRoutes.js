const express = require("express");

module.exports = (db) => {
  const router = express.Router();

  // Route to handle survey submission
  router.post("/submit-survey", async (req, res) => {
    const { email, subscribedProfiles } = req.body;

    console.log("Received payload:", req.body);

    // Validate request body
    if (!email || !subscribedProfiles || !Array.isArray(subscribedProfiles)) {
      return res.status(400).send({ error: "Invalid request format." });
    }

    try {
      // Query to find user document based on email
      const userSnapshot = await db.collection("users").where("email", "==", email).get();
      console.log("User snapshot retrieved:", userSnapshot.empty ? "No user found" : "User found");

      if (userSnapshot.empty) {
        return res.status(404).send({ error: "User not found." });
      }

      const userRef = userSnapshot.docs[0].ref;

      // Update the subscribedProfiles field
      await userRef.update({
        subscribedProfiles, // Save the selected profiles
      });

      res.status(200).send({ message: "Survey submitted successfully!" });
    } catch (error) {
      console.error("Error submitting survey:", error);
      res.status(500).send({ error: `Failed to submit survey: ${error.message}` });
    }
  });

  return router;
};
