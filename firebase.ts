import { firebase } from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";

// Initialize Firebase
const authService = firebase.auth();
const fireStore = firestore();
export { authService, fireStore };
