import * as faceapi from "./face.js";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getStorage, ref, uploadBytes, listAll } from "firebase/storage";
import { getDownloadURL } from "firebase/storage";

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

function redirectToLogin() {
  window.location.replace("register.html");
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    const logUser = document.getElementById("logUser");
    logUser.textContent = user.email;
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
      const userUID = auth.currentUser.uid;
      const directoryName = `${userUID}`;
      const subDirectoryName = `${timestamp}`;
      const imageName = `image_${timestamp}.png`;
      const jsonName = `data.json`;

      const userDirRef = ref(storage, `${directoryName}`);
      const subDirRef = ref(userDirRef, `${subDirectoryName}`);
      const imageRef = ref(subDirRef, `${imageName}`);
      const jsonRef = ref(subDirRef, `${jsonName}`);

      const landmarkPositions = detections.map(
        (detection) => detection.landmarks.positions
      );

      canvas.toBlob((blob) => {
        uploadBytes(imageRef, blob).then((imageSnapshot) => {
          console.log("Obraz przesłany do Firebase Storage!");

          const dataToSave = {
            landmarks: landmarkPositions,
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

    // Logout section //
    const logoutButton = document.querySelector(".log-out");
    logoutButton.addEventListener("click", () => {
      signOut(auth)
        .then(() => {
          onAuthStateChanged(auth, (user) => {
            if (!user) {
              setTimeout(() => {
                window.location.replace("register.html");
              }, 100);
            }
          });
        })
        .catch((err) => {
          console.log(err.message);
        });
    });

    // History Section //
    const home = document.getElementById("home");
    const history = document.getElementById("history");
    const newPhotoPage = document.querySelector(".new-photo");
    const historyPage = document.querySelector(".photos-history");
    const imageHistoryContainer = document.getElementById(
      "imageHistoryContainer"
    );

    history.addEventListener("click", () => {
      // Wyczyść zawartość kontenera przed dodaniem nowych elementów
      imageHistoryContainer.innerHTML = "";

      newPhotoPage.classList.add("hide");
      historyPage.classList.remove("hide");

      const userUID = auth.currentUser.uid;
      console.log(userUID);

      const userDirRef = ref(storage, `${userUID}`);
      console.log(userDirRef);

      listAll(userDirRef)
        .then((result) => {
          result.prefixes.forEach((folderRef, folderIndex) => {
            listAll(folderRef)
              .then((folderResult) => {
                const imageFile = folderResult.items.find(
                  (item) =>
                    item.name.endsWith(".png") ||
                    item.name.endsWith(".jpg") ||
                    item.name.endsWith(".jpeg")
                );

                const jsonFile = folderResult.items.find((item) =>
                  item.name.endsWith(".json")
                );

                if (imageFile && jsonFile) {
                  const imagePath = imageFile.name;
                  const jsonPath = jsonFile.name;

                  console.log(
                    `Folder: ${folderRef.name}, Obraz: ${imagePath}, JSON: ${jsonPath}`
                  );
                  const imageLink = document.createElement("a");
                  const jsonLink = document.createElement("a");

                  getDownloadURL(imageFile)
                    .then((url) => {
                      imageLink.href = url;
                      imageLink.textContent = `Obraz ${folderIndex + 1}  |  `;
                      imageLink.target = "_blank";
                      imageLink.style.color = "white";
                      imageLink.style.textDecoration = "none";
                      imageLink.style.cursor = "pointer";
                      imageLink.addEventListener("mouseover", () => {
                        imageLink.style.color = "blue";
                      });
                      imageLink.addEventListener("mouseout", () => {
                        imageLink.style.color = "white";
                      });
                    })
                    .catch((error) => {
                      console.error(
                        "Błąd podczas pobierania URL obrazu:",
                        error
                      );
                    });
                  getDownloadURL(jsonFile)
                    .then((url) => {
                      jsonLink.href = url;
                      jsonLink.textContent = `Plik JSON ${folderIndex + 1}`;
                      jsonLink.target = "_blank";
                      jsonLink.style.color = "white";
                      jsonLink.style.textDecoration = "none";
                      jsonLink.style.cursor = "pointer";
                      jsonLink.addEventListener("mouseover", () => {
                        jsonLink.style.color = "blue";
                      });
                      jsonLink.addEventListener("mouseout", () => {
                        jsonLink.style.color = "white";
                      });
                    })
                    .catch((error) => {
                      console.error(
                        "Błąd podczas pobierania URL pliku JSON:",
                        error
                      );
                    });

                  imageHistoryContainer.appendChild(imageLink);
                  imageHistoryContainer.appendChild(jsonLink);
                  imageHistoryContainer.appendChild(
                    document.createElement("br")
                  );
                }
              })
              .catch((error) => {
                console.error(
                  `Błąd podczas pobierania plików z folderu ${folderRef.name}:`,
                  error
                );
              });
          });
        })
        .catch((error) => {
          console.error("Błąd podczas pobierania listy folderów:", error);
        });
    });

    home.addEventListener("click", () => {
      historyPage.classList.add("hide");
      newPhotoPage.classList.remove("hide");
    });
  } else {
    // Użytkownik nie jest zalogowany, przekieruj go na stronę logowania
    redirectToLogin();
  }
});
