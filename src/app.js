// API section //
const inputImage = document.getElementById("inputImage");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

inputImage.addEventListener("change", handleImage);

function handleImage() {
  const img = new Image();
  img.src = URL.createObjectURL(inputImage.files[0]);
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);

    detectFaces(img);
  };
}

function handleCanvasClick() {
  inputImage.click();
}
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
