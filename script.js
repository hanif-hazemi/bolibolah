document.getElementById('grocery-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    
    const data = new URLSearchParams();
    for (const pair of formData) {
        data.append(pair[0], pair[1]);
    }

    fetch('https://docs.google.com/forms/u/0/d/e/1FAIpQLSfN_Hs1QADp1UkGit6ltc-e__OxAcg1dV8Wqo2grLMaGqt_IQ/formResponse', {
        method: 'POST',
        mode: 'no-cors',
        body: data
    }).then(() => {
        alert('Form submitted successfully!');
        form.reset();
    }).catch((error) => {
        console.error('Error:', error);
        alert('Error submitting form');
    });
});
