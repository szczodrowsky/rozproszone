import * as faceapi from "./face.js";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getStorage, ref, uploadBytes } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCByEr4GYKkn318os-meSSZemJoon8bu7E",
  authDomain: "dobramorda-b0009.firebaseapp.com",
  projectId: "dobramorda-b0009",
  storageBucket: "dobramorda-b0009.appspot.com",
  messagingSenderId: "992648302312",
  appId: "1:992648302312:web:57d04de0edafb633df435d",
};

initializeApp(firebaseConfig);
const auth = getAuth();
const storage = getStorage();

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
        uploadImageToStorage(img, resizedDetections);
        console.log(resizedDetections);
      })
      .catch((error) => {
        console.error(error);
      });
  });
}

function uploadImageToStorage(img, detections) {
  const timestamp = new Date().toISOString();
  const directoryName = `directory_${timestamp}`;
  const imageName = `image_${timestamp}.png`;
  const jsonName = `data_${timestamp}.json`;

  const imageRef = ref(storage, `${directoryName}/${imageName}`);
  const jsonRef = ref(storage, `${directoryName}/${jsonName}`);

  canvas.toBlob((blob) => {
    uploadBytes(imageRef, blob).then((imageSnapshot) => {
      console.log("Obraz przesłany do Firebase Storage!");
      const dataToSave = {
        detections: detections,
      };
      const jsonString = JSON.stringify(dataToSave);
      const jsonBlob = new Blob([jsonString], { type: "application/json" });

      uploadBytes(jsonRef, jsonBlob).then((jsonSnapshot) => {
        console.log("Plik JSON przesłany do Firebase Storage!");
      });
    });
  }, "image/png");
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
