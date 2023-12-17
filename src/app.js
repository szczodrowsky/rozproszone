import * as faceapi from "./face.js";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCByEr4GYKkn318os-meSSZemJoon8bu7E",
  authDomain: "dobramorda-b0009.firebaseapp.com",
  projectId: "dobramorda-b0009",
  storageBucket: "dobramorda-b0009.appspot.com",
  messagingSenderId: "992648302312",
  appId: "1:992648302312:web:57d04de0edafb633df435d",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth();

// API section //
const inputImage = document.getElementById("inputImage");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function detectFaces(img) {
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  ]).then(() => {
    faceapi
      .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .then((resizedDetections) => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, img.width, img.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

        console.log(resizedDetections);
      })
      .catch((error) => {
        console.error(error);
      });
  });
}
inputImage.addEventListener("change", () => {
  const img = new Image();
  img.src = URL.createObjectURL(inputImage.files[0]);
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);
    detectFaces(img);
  };
});

// Logout section//
const logoutButton = document.querySelector(".log-out");
logoutButton.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      setTimeout(() => {
        window.location.href = "register.html";
      }, 100);
    })
    .catch((err) => {
      console.log(err.message);
    });
});
onAuthStateChanged(auth, (user) => {
  console.log("user status changed:", user);
  const logUser = document.getElementById("logUser");
  logUser.textContent = user.email;
  console.log(user.email);
});
