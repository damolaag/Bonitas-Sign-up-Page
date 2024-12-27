document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("leadForm");
  const inputs = form.querySelectorAll("input");
  const submitButton = document.querySelector("button[type='button']");

  const validateForm = () => {
    const allFieldsFilled = Array.from(inputs).every((input) => input.value.trim() !== "");
    submitButton.disabled = !allFieldsFilled;
  };

  inputs.forEach((input) => {
    input.addEventListener("input", validateForm);
  });

  validateForm();
});

async function submitLead() {
  const submitButton = document.querySelector("button[type='button']");
  const form = document.getElementById("leadForm");
  const successMessage = document.getElementById("successMessage");
  submitButton.disabled = true;
  submitButton.textContent = "SIGN UP";

  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const showMessage = (message, isError = false) => {
    const messageElement = document.getElementById("message");
    messageElement.textContent = message;
    messageElement.className = isError ? "error" : "success";
    messageElement.style.display = "block";

    setTimeout(() => {
      messageElement.style.display = "none";
    }, 2000);
  };

  if (!firstName || !lastName || !email || !phone) {
    showMessage("Please fill in all fields before submitting.", true);
    submitButton.disabled = false;
    submitButton.textContent = "SIGN UP";
    return;
  }

  if (!emailRegex.test(email)) {
    showMessage("Please enter a valid email address.", true);
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
          showMessage("You have already submitted the form.", true);
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

        form.style.display = "none";
        successMessage.style.display = "block";

        submitButton.disabled = false;
        submitButton.textContent = "SIGN UP";
      };

      ipCheckRequest.onerror = function () {
        showMessage("Submission failed. Please try again.", true);
        submitButton.disabled = false;
        submitButton.textContent = "SIGN UP";
      };
    };

    dbRequest.onerror = function () {
      showMessage("Submission failed. Please try again.", true);
      submitButton.disabled = false;
      submitButton.textContent = "SIGN UP";
    };
  } catch (error) {
    showMessage("Submission failed. Please try again.", true);
    submitButton.disabled = false;
    submitButton.textContent = "SIGN UP";
  }
}
