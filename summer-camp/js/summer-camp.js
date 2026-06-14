
const bookAppointmentSubmit = document.getElementById("contactFormSubmitBtn");
if (bookAppointmentSubmit) {
  bookAppointmentSubmit.addEventListener("click", bkavalidate);
}
function bkavalidate(e) {
  const formValidity = document.getElementById("contactForm").checkValidity();
  if (formValidity) {
    e.preventDefault();

    const form = document.getElementById("contactForm");

    const formData = new FormData(form);
    let object = Object.fromEntries(formData);
    object.access_key = "f9c83cdc-a3a4-4441-922b-dced7f52a1cd";
    const json = JSON.stringify(object);
    fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: json,
    })
      .then(async (response) => {
        let json = await response.json();
        if (response.status == 200) {
          alert("Thank you for reaching out. I appreciate your message and will respond promptly!");
        } else {
          alert('Unable to send message! Please try again!');
        }
      })
      .catch((error) => {
        console.log(error);
        alert('Unable to send message! Please try again!');
      })
      .then(function () {
        form.reset();

      });
  } else {
  }
}
