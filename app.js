async function submitLead() {
    const submitButton = document.querySelector("button[type='button']");
    submitButton.disabled = true;
    submitButton.textContent = "Please wait...";

    try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        const userIP = ipData.ip;

        const submittedIPs = JSON.parse(localStorage.getItem('submittedIPs')) || [];
        if (submittedIPs.includes(userIP)) {
            alert('You have already submitted the form.');
            submitButton.disabled = false;
            submitButton.textContent = "SIGN UP";
            return;
        }

        const formData = new URLSearchParams();
        formData.append('cid', document.getElementById('cid').value);
        formData.append('sid', document.getElementById('sid').value);
        formData.append('f_3_firstname', document.getElementById('firstName').value);
        formData.append('f_4_lastname', document.getElementById('lastName').value);
        formData.append('f_1_email', document.getElementById('email').value);
        formData.append('f_15_mobile', document.getElementById('phone').value);

        await fetch('https://adclickafrica.databowl.com/api/v1/lead', {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString()
        });

        submittedIPs.push(userIP);
        localStorage.setItem('submittedIPs', JSON.stringify(submittedIPs));

        window.location.href = 'https://www.bonitas.co.za/';
    } catch (error) {
        console.error('Error:', error);
        alert('Submission failed. Please try again.');
        submitButton.disabled = false;
        submitButton.textContent = "SIGN UP";
    }
}
