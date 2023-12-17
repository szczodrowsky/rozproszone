import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
export const firebaseConfig = {
  apiKey: "AIzaSyCByEr4GYKkn318os-meSSZemJoon8bu7E",
  authDomain: "dobramorda-b0009.firebaseapp.com",
  projectId: "dobramorda-b0009",
  storageBucket: "dobramorda-b0009.appspot.com",
  messagingSenderId: "992648302312",
  appId: "1:992648302312:web:57d04de0edafb633df435d",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth();

//Signup section//
const signupForm = document.querySelector(".signupForm");

signupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = signupForm.registerName.value;
  const email = signupForm.registerEmail.value;
  const password = signupForm.registerPassword.value;
  const confirmPassword = signupForm.confirmPassword.value;

  if (password !== confirmPassword) {
    alert("Hasła nie są zgodne.");
    signupForm.reset();
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      console.log("user created:", cred.user);
      signupForm.reset();
      setTimeout(() => {
        window.location.href = "app.html";
      }, 100);
    })
    .catch((err) => {
      console.log(err.message);
    });
});
// Login in section//

const logInForm = document.querySelector(".loginForm");

logInForm.addEventListener("submit", (e) => {
  const email = logInForm.emailLogin.value;
  const password = logInForm.passwordLogin.value;
  e.preventDefault();

  signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      console.log("user logged in:", cred.user);
      logInForm.reset();
      setTimeout(() => {
        window.location.href = "app.html";
      }, 100);
    })
    .catch((err) => {
      console.log(err.message);
    });
});

//Moving between windows///
const option1 = document.querySelector(".option1");
const option2 = document.querySelector(".option2");
const landingPage = document.querySelector(".choice-container");
const loginForm = document.querySelector(".login-form");
const registerForm = document.querySelector(".registration-form");
const haveAccParagraf = document.querySelector(".second-have");
const noAccParagraf = document.querySelector(".second-no");

option1.addEventListener("click", () => {
  registerForm.classList.remove("hide");
  landingPage.classList.add("hide");
});

option2.addEventListener("click", () => {
  loginForm.classList.remove("hide");
  landingPage.classList.add("hide");
});

haveAccParagraf.addEventListener("click", () => {
  loginForm.classList.remove("hide");
  registerForm.classList.add("hide");
});

noAccParagraf.addEventListener("click", () => {
  registerForm.classList.remove("hide");
  loginForm.classList.add("hide");
});

//
