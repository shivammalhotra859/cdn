let cameraOpen = false;
const cameraView = document.getElementById("camera-view");
const takePictureButton = document.getElementById("take-picture");
const errorMessage = document.getElementById("error-message");
const snapshot = document.getElementById("snapshot");
const vedioArea = document.getElementById("vedio-area");
const closeCamera = document.getElementById("close-camera");
const proceedBtn = document.getElementById("submitImgButton");
const imgUrlInput = document.getElementById("selfieImg");

// Check for camera access
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(function (stream) {
      cameraView.srcObject = stream;

      cameraView.play();
      // //older browser support
      // if ("srcObject" in cameraView) {
      //     cameraView.srcObject = stream;

      // } else {
      //     cameraView.src = window.URL.createObjectURL(stream);

      // }
      vedioArea.style.display = "block";
      takePictureButton.style.display = "inline-block";
    })
    .catch(function (error) {
       // changeStart-----------------------------
      let message = "";
      if (error.name === "NotAllowedError") {
        message =
          "Camera access was denied. Please enable it in your browser settings.";
        if (isWebView() === "Yes") {
          message = "Application requires your permission to access camera";
          openModal(message, "Ok");
        } else {
          openModal(message, "Ok");
        }
      } else {
        message = `Error accessing the camera: ${error.name}`;
        openModal(message, "Ok");
        console.log(`Error accessing the camera:`, error);
      }
      //changeEnd--------------------------------
    });
} else {
  // changeStart-----------------------------
  message = "Camera not available on this device.";
  openModal(message, "Ok");
  //changeEnd--------------------------------
}

// Take a snapshot
takePictureButton.addEventListener("click", function (e) {
  e.preventDefault();
  // debugger
  closeCamera.style.display = "block";
  proceedBtn.style.display = "inline-block";
  cameraView.style.display = "none";
  takePictureButton.style.display = "none";
  canvas
    .getContext("2d")
    .drawImage(cameraView, 0, 0, canvas.width, canvas.height);
  let image_data_url = canvas.toDataURL("image/jpeg");
  snapshot.src = image_data_url;
  // vedioArea.style.display = 'none';
  snapshot.style.display = "block";
  // data url of the image
  imgUrlInput.value = image_data_url;
  console.log(image_data_url);

  // debugger
  // const context = cameraView.getContext('2d');
  // context.drawImage(cameraView, 0, 0, cameraContainer.offsetWidth, cameraContainer.offsetHeight);
  // snapshot.src = cameraView.toDataURL('image/png');
  // snapshot.style.display = 'block';
});
// Take a snapshot

closeCamera.addEventListener("click", function (e) {
  e.preventDefault();
  closeCamera.style.display = "none";
  proceedBtn.style.display = "none";
  cameraView.style.display = "block";
  takePictureButton.style.display = "inline-block";
  snapshot.style.display = "none";
});
$(document).ready(function () {
  $("#selfieImg").val("");
  $("#submitImgButton").click(handleFormSubmission);
  $("#retakeBtn").on("click", function (ev) {
    closeModal();
    closeCamera.style.display = "none";
    proceedBtn.style.display = "none";
    cameraView.style.display = "block";
    takePictureButton.style.display = "inline-block";
    snapshot.style.display = "none";
  });

  $(".close-modal").on("click", function () {
    closeModal();
  });
});
const closeModal = () => {
  $.modal.close();
};
const openModal = (message, buttonText) => {
  $("#inner-message").text(message);
  $("#retakeBtn").text(buttonText);
  $("#ex1").modal();
};

function handleFormSubmission() {
  $("#adhrForm").on("submit", function (ev) {
    ev.preventDefault();
    let sfv = $("#selfieImg").val();
    if (sfv.trim() === "") {
      openModal(
        "Photo not valid. Please take a clear photo with face in center.",
        "Retake"
      );
      return;
    }
    let base64image = this[1].value;
    console.log(base64image);
    const sf = $("form").serialize();
    let formId = $("#formId").val();
    let submitUrl = $("#submitUrl").val();

    console.log(sf);
    let reqData = { selfieImg: sfv };
    displayLoader();
    $.ajax({
      url: submitUrl,
      type: "POST",
      data: JSON.stringify(reqData),
      dataType: "json",
      contentType: "application/json",
      success: function (response) {
        hideLoader();
        if (response.data && response.data.redirectUrl) {
          window.location.href = response.data.redirectUrl;
        } else {
          openModal(response.message, "Ok");
        }
      },
      error: function (xhr, status, error) {
        hideLoader();
        console.log(
          " xhr.responseText: " +
            xhr.responseText +
            " //status: " +
            status +
            " //Error: " +
            error
        );
        openModal(extractFirstValueFromJson(xhr.responseText), "Ok");
      },
    });
  });
}

const displayLoader = () => {
  $("#loader-controller").addClass("active");
  // document.querySelector('.overlay').style.display = 'block';
  // document.querySelector('#loader-controller').style.display = 'block';
};
const hideLoader = () => {
  $("#loader-controller").removeClass("active");
  // document.querySelector('.overlay').style.display = 'none';
  // document.querySelector('#loader-controller').style.display = 'none';
};
function extractFirstValueFromJson(jsonString) {
  try {
    const jsonObject = JSON.parse(jsonString);
    const firstValue = Object.values(jsonObject)[0];
    return firstValue;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return undefined;
  }
}

const isWebView = () => {
  let $userAgent = document.getElementById("user-agent");
  let $userAgentInfo = document.getElementById("user-agent-info");

  const navigator = window.navigator;
  const userAgent = navigator.userAgent;
  const normalizedUserAgent = userAgent.toLowerCase();
  const standalone = navigator.standalone;

  const isIos =
    /ip(ad|hone|od)/.test(normalizedUserAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isAndroid = /android/.test(normalizedUserAgent);
  const isSafari = /safari/.test(normalizedUserAgent);
  const isWebview =
    (isAndroid && /; wv\)/.test(normalizedUserAgent)) ||
    (isIos && !standalone && !isSafari);

  const osText = isIos ? "iOS" : isAndroid ? "Android" : "Other";
  const webviewText = isWebview ? "Yes" : "No";
  

  console.log(`OS: ${osText}, Webview: ${webviewText}`);

  return webviewText;
};
