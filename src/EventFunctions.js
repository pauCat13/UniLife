import { auth, db } from "./firebase";
import {collection, doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp,  query,  where,  getDocs,
} from "firebase/firestore";

/**
 * Function to create an event
 */
export const createEvent = async (eventData) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not logged in.");
  }

  const {
    title,
    tags,
    image,
    description,
    longDescription,
    date,
    time,
    location,
  } = eventData;

  if (!title || !date || !time || !location) {
    throw new Error("Missing required fields, try again.");
  }

  if (!Array.isArray(tags) || tags.some((tag) => typeof tag !== "string")) {
    throw new Error("Invalid tags");
  }

  // Generate a new event ID
  const eventRef = doc(collection(db, "events"));
  const eventId = eventRef.id;

  const event = {
    eventId,
    title,
    host: user.email,
    hostAccountType: null, //Set dynamically
    tags,
    image,
    description,
    longDescription,
    date,
    time,
    location,
    societyId: null, //Set dynamically for societies
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    // Fetch the user's account type
    const userQuery = query(collection(db, "users"), where("email", "==", user.email));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      throw new Error("User not found in Firestore.");
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    event.hostAccountType = userData.accountType;

    if(userData.accountType === "Society" && userData.societyId){
      event.societyId = userData.societyId;
    }

    // Add event to the events collection
    await setDoc(eventRef, event);

    // Update user's createdEvents array
    await updateDoc(userDoc.ref, {
      createdEvents: arrayUnion(eventId),
    });

    // If the user is a society -> update the societies collection
    if (userData.accountType === "Society" && userData.societyId) {
      const societyRef = doc(db, "societies", userData.societyId);

      const societyDoc = await getDoc(societyRef);
      if (!societyDoc.exists()) {
        console.warn(`Society with ID ${userData.societyId} not found. Skipping update.`);
      } else {
        await updateDoc(societyRef, {
          createdEvents: arrayUnion(eventId),
        });
        console.log(`Updated societies collection for ${userData.societyId}.`);
      }
    }

    console.log("Event created successfully:", eventId);
    return eventId;
  } catch (error) {
    console.error("Error creating event:", error);
    throw new Error("Failed to create event.");
  }
};


/**
 * Fetch an event by its ID.
 */
export const getEventById = async (eventId) => {
  try {
    const eventDoc = await db.collection("events").doc(eventId).get();

    if (!eventDoc.exists) {
      throw new Error("Event not found.");
    }

    return { id: eventDoc.id, ...eventDoc.data() };
  } catch (error) {
    console.error("Error fetching event:", error);
    throw new Error("Failed to fetch event. Please try again.");
  }
};


// Fetch all events created by a specific society.

export const getEventsBySocietyId = async (societyId) => {
  try {
    const querySnapshot = await db
      .collection("events")
      .where("societyId", "==", societyId)
      .orderBy("date", "asc")
      .get();

    if (querySnapshot.empty) {
      console.log("This society has no ongoing events.");
      return [];
    }

    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching society events:", error);
    throw new Error("Failed to fetch society events. Please try again.");
  }
};


 //Update an existing event by its ID.

export const updateEvent = async (eventId, updatedData) => {
  try {
    const eventRef = db.collection("events").doc(eventId);

    const eventDoc = await eventRef.get();
    if (!eventDoc.exists) {
      throw new Error("Event not found.");
    }

    await eventRef.update({
      ...updatedData,
      updatedAt: serverTimestamp(),
    });

    console.log("Event updated successfully.");
  } catch (error) {
    console.error("Error updating event:", error);
    throw new Error("Failed to update event. Please try again.");
  }
};


 //Delete an event by its ID.
 
export const deleteEvent = async (eventId) => {
  try {
    const eventRef = db.collection("events").doc(eventId);

    const eventDoc = await eventRef.get();
    if (!eventDoc.exists) {
      throw new Error("Event not found.");
    }

    await eventRef.delete();
    console.log("Event deleted successfully.");
  } catch (error) {
    console.error("Error deleting event:", error);
    throw new Error("Failed to delete event. Please try again.");
  }
};
