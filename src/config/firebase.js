import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
    apiKey: "AIzaSyBhS5zF6fDfmNsuHir7isZwcGoFm9rZ5c8",
    authDomain: "convo2-gs.firebaseapp.com",
    projectId: "convo2-gs",
    storageBucket: "convo2-gs.firebasestorage.app",
    messagingSenderId: "138836407988",
    appId: "1:138836407988:web:aeb9826761e134eeb849e1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username, email, password) => {
    if (!username || !email || !password) {
        toast.error("All fields are required!");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            username: username.toLowerCase(),
            email,
            name: "",
            avatar: "",
            bio: "Hey there! I am using Convo",
            lastSeen: new Date(),
        });

        await setDoc(doc(db, "chats", user.uid), { chatsData: [] });

        console.log("User created:", user);
    } catch (error) {
        console.error("Signup error:", error);
        const errorMessage = error.message.split('/')[1].split('-').join(' ');
        toast.error(errorMessage);
    }
};

const login = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("User logged in:", userCredential.user);
    } catch (error) {
        console.error("Login error:", error);
        const errorMessage = error.message.split('/')[1].split('-').join(' ');
        toast.error(errorMessage);
    }
};

const logout = async () => {
    try {
        await signOut(auth);
        console.log("User logged out");
    } catch (error) {
        console.error("Logout error:", error);
        toast.error(error.message);
    }
};

export { signup, login, logout, auth, db };
