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

async function daftarkanKeDatabase() {
  const notif = document.getElementById("notif");

  const wrapper = document.getElementById("previewWrapper");

  const nama = namaInput.value.trim();

  const foto = fotoInput.files[0];

  if (!nama || !foto) {
    notif.className = "state-error";

    notif.innerText = "Enter your name and upload a face image.";

    return;
  }

  wrapper.classList.add("scanning");

  notif.className = "state-loading";

  notif.innerText = "Extracting face vector...";

  try {
    const formData = new FormData();

    formData.append("nama", nama);

    formData.append("foto", foto);

    const res = await fetch("http://127.0.0.1:5001/api/register", {
      method: "POST",
      body: formData,
    });

    let data = {};

    try {
      data = await res.json();
    } catch {}

    if (!res.ok) {
      throw data;
    }

    if (data.status === "success") {
      notif.className = "state-success";

      notif.innerText = data.message || "Face registered successfully.";

      namaInput.value = "";

      fotoInput.value = "";

      wrapper.style.display = "none";

      labelUpload.innerText = "Upload a face image";
    } else if (data.status === "mysql_error") {
      notif.className = "state-error";

      notif.innerHTML = `
Database unavailable

Start MySQL and try again
`;
    } else {
      notif.className = "state-error";

      notif.innerText = data.message || "Registration failed.";
    }
  } catch (err) {
    notif.className = "state-error";

    notif.innerHTML = `
Unable to register

• API server offline
• Database not started
• Backend crashed
`;
  } finally {
    wrapper.classList.remove("scanning");
  }
}
