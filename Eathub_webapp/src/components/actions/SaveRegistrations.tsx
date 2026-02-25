import { ref, set } from "firebase/database";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { rtdb, auth } from "@/firebase";

export const registerUser = async (data: any, userType: string) => {
  try {
    // 1. Separate password from profile data (don't save password in DB)
    const { password, confirmPassword, ...profileData } = data;

    // 2. Sanitize Data: Remove 'File' objects (Images/PDFs)
    // Realtime Database crashes if you try to save raw File objects.
    // (Note: To save images, you must upload them to Firebase Storage separately first)
    const cleanData = { ...profileData };
    const fileKeys = [
      'profilePhoto', 'certificates', 'portfolio',
      'hygieneCertificate', 'menu', 'logo',
      'restaurantPhotos', 'foodLicense'
    ];

    fileKeys.forEach(key => {
      if (cleanData[key]) {
        delete cleanData[key]; // Removing file objects to prevent errors
      }
    });

    // 3. Create User in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, password);
    const uid = userCredential.user.uid;

    // 4. Save Profile to Realtime Database "Users" Table
    // We use the 'uid' as the key so the database entry matches the login account
    await set(ref(rtdb, `Users/${uid}`), {

      ...cleanData,
      userType: userType, // "Chef", "Home Food", or "Restaurant"
      createdAt: new Date().toISOString(),
      id: uid,
      email: data.email
    });

    console.log("User registered successfully:", uid);
    return { success: true };

  } catch (error: any) {
    console.error("Registration Error:", error);
    let errorMessage = "Failed to register. Please try again.";

    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "This email is already registered.";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "Password is too weak.";
    }

    return { success: false, error: errorMessage };
  }
};