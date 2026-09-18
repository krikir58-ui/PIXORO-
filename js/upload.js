// PIXORO PUBLIC PHOTO UPLOAD

async function handlePost() {
  const input = document.getElementById("fileInput");
  const msg = document.getElementById("msg");

  if (!input || !input.files[0]) {
    alert("Photo select pannu da!");
    return;
  }

  const file = input.files[0];

  // Image மட்டும் allow
  if (!file.type.startsWith("image/")) {
    alert("Image file mattum upload pannu!");
    return;
  }

  try {
    msg.innerText = "Uploading...";
    msg.style.color = "orange";

    // Unique filename
    const fileName =
      "posts/" + Date.now() + "_" + file.name.replace(/\s+/g, "_");

    // Firebase Storage
    const storageRef = firebase.storage().ref(fileName);

    // Upload photo
    await storageRef.put(file);

    // Get public download URL
    const photoURL = await storageRef.getDownloadURL();

    // Save post information in Firestore
    await firebase.firestore().collection("posts").add({
      photoURL: photoURL,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    msg.innerText = "Photo Public-a Upload Aagiduchu! ✅";
    msg.style.color = "lightgreen";

    input.value = "";

    // Show posts
    if (typeof showPosts === "function") {
      showPosts();
    }

  } catch (error) {
    console.error(error);
    msg.innerText = "Upload failed: " + error.message;
    msg.style.color = "red";
  }
}


// Post button
const btn = document.getElementById("postBtn");

if (btn) {
  btn.onclick = handlePost;
}
