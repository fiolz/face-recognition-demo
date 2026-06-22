let mode = "upload";
let stream;

function setMode(m) {
  mode = m;

  document.getElementById("uploadSection").style.display =
    m === "upload" ? "block" : "none";
  document.getElementById("cameraSection").style.display =
    m === "camera" ? "block" : "none";

  document
    .getElementById("btnUpload")
    .classList.toggle("active", m === "upload");
  document
    .getElementById("btnCamera")
    .classList.toggle("active", m === "camera");

  if (m === "camera") {
    startCamera();
  } else {
    stopCamera();
  }
}

function tampilkanPreview(input) {
  const preview = document.getElementById("previewImg");
  const wrapper = document.getElementById("previewWrapper");
  const label = document.getElementById("labelUpload");

  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      wrapper.style.display = "block";
      label.innerText = input.files[0].name;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function startCamera() {
  const video = document.getElementById("video");

  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "user" },
    audio: false,
  });

  video.srcObject = stream;
}

function capturePhoto() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);

  canvas.toBlob(async (blob) => {
    const file = new File([blob], "camera.jpg", { type: "image/jpeg" });
    await sendToAPI(file);
  }, "image/jpeg");
}

async function handleAction() {
  const input = document.getElementById("inputFoto");

  if (mode === "upload") {
    if (!input.files.length) {
      alert("Please upload an image first");
      return;
    }
    await sendToAPI(input.files[0]);
  } else {
    alert("Use camera capture button first");
  }
}

async function sendToAPI(file) {
  const hasilDiv = document.getElementById("hasil");
  const wrapper =
    mode === "upload"
      ? document.getElementById("previewWrapper")
      : document.getElementById("cameraWrap");

  hasilDiv.className = "state-loading";
  hasilDiv.innerText = "Scanning face...";

  wrapper.classList.add("scanning");

  try {
    const formData = new FormData();
    formData.append("webcam", file);

    const res = await fetch("http://127.0.0.1:8080/api/detect", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("SERVER");
    }

    const data = await res.json();

    wrapper.classList.remove("scanning");

    if (data.status === "success") {
      hasilDiv.className = "state-success";
      hasilDiv.innerText = `Detected: ${data.nama}`;
    } else if (data.status === "mysql_error") {
      hasilDiv.className = "state-error";

      hasilDiv.innerHTML = `
            Database unavailable

            Start MySQL server
            and try again
            `;
    } else if (data.status === "face_not_found") {
      hasilDiv.className = "state-error";

      hasilDiv.innerText = "No registered face detected.";
    } else {
      hasilDiv.className = "state-error";

      hasilDiv.innerText = data.message || "Recognition failed.";
    }
  } catch (err) {
    wrapper.classList.remove("scanning");

    hasilDiv.className = "state-error";

    hasilDiv.innerHTML = `
          Unable to connect

          • API server offline
          • Wrong port
          • Backend crashed
          `;
  }
}

setMode("upload");
