"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.db = exports.app = void 0;
var app_1 = require("firebase/app");
var firestore_1 = require("firebase/firestore");
var auth_1 = require("firebase/auth");
var dotenv = require("dotenv");
dotenv.config();
// Use process.env to access environment variables
var firebaseConfig = {
    apiKey: process.env.VITE_APP_FIREBASE_API_KEY,
    authDomain: process.env.VITE_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_APP_FIREBASE_PROJECT_ID,
    databaseURL: process.env.VITE_APP_FIREBASE_DATABASE_URL,
    storageBucket: process.env.VITE_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
    googleMapsApiKey: process.env.VITE_APP_GOOGLE_MAPS_API_KEY
};
var app;
var db;
var auth;
function initializeFirebase() {
    if ((0, app_1.getApps)().length === 0) {
        exports.app = app = (0, app_1.initializeApp)(firebaseConfig);
    }
    else {
        exports.app = app = (0, app_1.getApp)();
    }
    // Ensure app is initialized before getting Firestore and Auth
    if (app) {
        exports.db = db = (0, firestore_1.getFirestore)(app);
        exports.auth = auth = (0, auth_1.getAuth)(app);
    }
}
initializeFirebase();
