async function submitLead() {
  const submitButton = document.querySelector("button[type='button']");
  submitButton.disabled = true;
  submitButton.textContent = "Please wait...";

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!firstName || !lastName || !email || !phone) {
    alert("Please fill in all fields before submitting.");
    submitButton.disabled = false;
    submitButton.textContent = "SIGN UP";
    return;
  }

  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address.");
    submitButton.disabled = false;
    submitButton.textContent = "SIGN UP";
    return;
  }

  try {
    const ipResponse = await fetch("https://api.ipify.org?format=json");
    const ipData = await ipResponse.json();
    const userIP = ipData.ip;

    const dbRequest = indexedDB.open("FormSubmissionDB", 1);

    dbRequest.onupgradeneeded = function () {
      const db = dbRequest.result;
      if (!db.objectStoreNames.contains("submissions")) {
        db.createObjectStore("submissions", { keyPath: "ip" });
      }
    };

    dbRequest.onsuccess = async function () {
      const db = dbRequest.result;
      const transaction = db.transaction("submissions", "readonly");
      const store = transaction.objectStore("submissions");
      const ipCheckRequest = store.get(userIP);

      ipCheckRequest.onsuccess = async function () {
        if (ipCheckRequest.result) {
          alert("You have already submitted the form.");
          submitButton.disabled = false;
          submitButton.textContent = "SIGN UP";
          return;
        }

        const writeTransaction = db.transaction("submissions", "readwrite");
        const writeStore = writeTransaction.objectStore("submissions");
        writeStore.add({ ip: userIP });

        const formData = new URLSearchParams();
        formData.append("cid", document.getElementById("cid").value);
        formData.append("sid", document.getElementById("sid").value);
        formData.append("f_3_firstname", firstName);
        formData.append("f_4_lastname", lastName);
        formData.append("f_1_email", email);
        formData.append("f_15_mobile", phone);

        await fetch("https://adclickafrica.databowl.com/api/v1/lead", {
          method: "POST",
          mode: "no-cors",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });

        alert("Form submitted successfully!");
        window.location.href = "https://www.bonitas.co.za/";
      };

      ipCheckRequest.onerror = function () {
        console.error("Error checking IP in IndexedDB.");
        alert("Submission failed. Please try again.");
        submitButton.disabled = false;
        submitButton.textContent = "SIGN UP";
      };
    };

    dbRequest.onerror = function () {
      console.error("Error opening IndexedDB.");
      alert("Submission failed. Please try again.");
      submitButton.disabled = false;
      submitButton.textContent = "SIGN UP";
    };
  } catch (error) {
    console.error("Error:", error);
    alert("Submission failed. Please try again.");
    submitButton.disabled = false;
    submitButton.textContent = "SIGN UP";
  }
}
