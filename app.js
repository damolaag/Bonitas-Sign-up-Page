function submitLead() {
    const formData = new URLSearchParams();
    formData.append('cid', document.getElementById('cid').value);
    formData.append('sid', document.getElementById('sid').value);
    formData.append('f_3_firstname', document.getElementById('firstName').value);
    formData.append('f_4_lastname', document.getElementById('lastName').value);
    formData.append('f_1_email', document.getElementById('email').value);
    formData.append('f_15_mobile', document.getElementById('phone').value);

    fetch('https://adclickafrica.databowl.com/api/v1/lead', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
    })
    .then(response => response.json())
    .then(data => {
        if (data.result === "created") {
            alert('Lead submitted successfully!');
        } else {
            alert(`Error: ${data.error.msg}`);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Submission failed. Please try again.', error);
    });
}