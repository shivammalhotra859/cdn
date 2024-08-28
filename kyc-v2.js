let cameraOpen = false;
const cameraView = document.getElementById("camera-view");
const takePictureButton = document.getElementById("take-picture");
const errorMessage = document.getElementById("error-message");
const snapshot = document.getElementById("snapshot");
const vedioArea = document.getElementById("vedio-area");
const closeCamera = document.getElementById("close-camera");
const proceedBtn = document.getElementById("submitImgButton");
const imgUrlInput = document.getElementById("selfieImg");

// changeStart-----------------------------
const msg_browser_1 =
  "Camera access was denied. Please enable it in your browser settings.";
const msg_webview_1 = "Application requires your permission to access camera";
const msg_common_1 = "Error accessing the camera:";
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

  //   console.log(`OS: ${osText}, Webview: ${webviewText}`);

  return webviewText;
};

//changeEnd--------------------------------
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
      //   errorMessage.textContent = `Error accessing the camera: ${error.name}`;
      // changeStart-----------------------------
      let message = "";
      if (error.name === "NotAllowedError") {
        message = msg_browser_1;
        if (isWebView() === "Yes") {
          message = msg_webview_1;
          openModal(message, "Ok");
        } else {
          openModal(message, "Ok");
        }
      } else {
        message = `${msg_common_1} ${error.name}`;
        openModal(message, "Ok");
        console.log(msg_common_1, error);
      }
      //changeEnd--------------------------------
    });
} else {
  //   errorMessage.textContent = "Camera not available on this device.";
  // changeStart-----------------------------
  openModal("Camera not available on this device.", "Ok");
  //changeEnd--------------------------------
}

// Take a snapshot
takePictureButton.addEventListener("click", async function (e) {
  e.preventDefault();

  try {
    const result = await navigator.permissions.query({ name: "camera" });

    // console.log("result>>", result);

    if (result.state === "granted") {
      closeCamera.style.display = "block";
      proceedBtn.style.display = "inline-block";
      cameraView.style.display = "none";
      takePictureButton.style.display = "none";
      canvas
        .getContext("2d")
        .drawImage(cameraView, 0, 0, canvas.width, canvas.height);
      let image_data_url = canvas.toDataURL("image/jpeg");
      snapshot.src = image_data_url;
      snapshot.style.display = "block";
      imgUrlInput.value = image_data_url;
      console.log(image_data_url);
    } else if (result.state === "denied") {
      // changeStart-----------------------------
      if (isWebView() === "Yes") {
        openModal(msg_webview_1, "Ok");
      } else {
        openModal(msg_browser_1, "Ok");
      }
      //changeEnd--------------------------------
    }
  } catch (error) {
    openModal(`Camera (not supported)`, "Ok");
  }
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

async function handleFormSubmission(ev) {
  //  prevent default nature of form
  ev.preventDefault();
  try {
    const result = await navigator.permissions.query({ name: "camera" });

    // console.log("result>>", result);

    if (result.state === "granted") {
      proceedBtn.disabled = true;
      //   get image data
      let sfv = $("#selfieImg").val();
      //   get form submitUrl
      let submitUrl = $("#submitUrl").val() || "sssss";

      //   if image data is empty open modal and display error message to user and exit
      if (sfv.trim() === "") {
        openModal(
          "Photo not valid. Please take a clear photo with face in center.",
          "Retake"
        );
        proceedBtn.disabled = false;
        return;
      }

      //   if we have both post url and image data then make a post request to given post url
      if (submitUrl && sfv) {
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
            proceedBtn.disabled = false;
            if (response.data && response.data.redirectUrl) {
              window.location.href = response.data.redirectUrl;
            } else {
              openModal(response.message, "Ok");
            }
          },
          error: function (xhr, status, error) {
            hideLoader();
            proceedBtn.disabled = false;
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
      }
    } else if (result.state === "denied") {
      // changeStart-----------------------------
      if (isWebView() === "Yes") {
        openModal(msg_webview_1, "Ok");
      } else {
        openModal(msg_browser_1, "Ok");
      }
      //changeEnd--------------------------------
    }
  } catch (error) {
    openModal(`Camera (not supported)`, "Ok");
  }
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
