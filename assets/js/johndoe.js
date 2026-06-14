/*!
=========================================================
* JohnDoe Landing page
=========================================================

* Copyright: 2019 DevCRUD (https://devcrud.com)
* Licensed: (https://devcrud.com/licenses)
* Coded by www.devcrud.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// smooth scroll
$(document).ready(function () {
  $(".navbar .nav-link").on('click', function (event) {

    if (this.hash !== "") {

      event.preventDefault();

      var hash = this.hash;

      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 700, function () {
        window.location.hash = hash;
      });
    }
  });
});

// protfolio filters
$(window).on("load", function () {
  var t = $(".portfolio-container");
  t.isotope({
    filter: ".new",
    animationOptions: {
      duration: 750,
      easing: "linear",
      queue: !1
    }
  }), $(".filters a").click(function () {
    $(".filters .active").removeClass("active"), $(this).addClass("active");
    var i = $(this).attr("data-filter");
    return t.isotope({
      filter: i,
      animationOptions: {
        duration: 750,
        easing: "linear",
        queue: !1
      }
    }), !1
  });
});


// google maps
function initMap() {
  // Styles a map in night mode.
  var map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 40.674, lng: -73.945 },
    zoom: 12,
    scrollwheel: false,
    navigationControl: false,
    mapTypeControl: false,
    scaleControl: false,
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
      {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#263c3f' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#6b9a76' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#38414e' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#212a37' }]
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9ca5b3' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#746855' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#1f2835' }]
      },
      {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#f3d19c' }]
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#2f3948' }]
      },
      {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
      },
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#17263c' }]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#515c6d' }]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#17263c' }]
      }
    ]
  });
}


const submit = document.getElementById("submit");
submit.addEventListener("click", validate);
function validate(e) {
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
          alert("Your request has been sent successfully!");
        } else {
          alert('Unable to send your request! Please try again!');
        }
      })
      .catch((error) => {
        console.log(error);
        alert('Unable to send your request! Please try again!');
      })
      .then(function () {
        form.reset();

      });
  }
}


const bookAppointmentSubmit = document.getElementById("bookAppointmentSubmitBtn");
bookAppointmentSubmit.addEventListener("click", bkavalidate);
function bkavalidate(e) {
  const formValidity = document.getElementById("appointmentForm").checkValidity();
  if (formValidity) {
    e.preventDefault();

    const form = document.getElementById("appointmentForm");

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
          alert('Unable to book your appointment! Please try again!');
        }
      })
      .catch((error) => {
        console.log(error);
        alert('Unable to book your appointment! Please try again!');
      })
      .then(function () {
        form.reset();

      });
  } else {
  }
}

// $(window).on('load', function () {
//   $('#program-modal').modal('show');
// });
$(document).ready(function () {
  $(".fancybox").fancybox({
    openEffect: "none",
    closeEffect: "none"
  });

  $(".zoom").hover(function () {

    $(this).addClass('transition');
  }, function () {

    $(this).removeClass('transition');
  });
});


const imageFilenames = [
  "academic-rediness-proramme-for-students-bishop-moore-vidyapith-cherthala-sanjo-mathew-trainer.png",
  "creative-thinking-session-unity-womens-college-malappuram-sanjo-mathew-trainer.jpg",
  "learning-science-experimental-way-sri-vijaya-vidaya-metric-school-salem-tamil-nadu-sanjo-mathew-trainer.jpg",
  "makam-english-medium-public-school-trivandrum-sanjo-mathew-trainer.jpeg",
  "mathi-coding-ai-residentail-summer-camp-nit-calicut-sanjo-mathew-trainer.jpg",
  "parents-orientation-program-vimala-central-school-chathanoor-kollam-sanjo-mathew-trainer.jpeg",
  "parents-orientation-programme-de-paul-school-thodupuzha-idukki-sanjo-mathew-trainer.jpeg",
  "parents-orientation-programme-st-maria-goretti-public-school-ernakulam-sanjo-mathew-trainer.jpeg",
  "pathanamthitta-summer-camp-students-vacation-sanjo-mathew-trainer.png",
  "school-reopening-njanodayam-public-school-edakochi-ernakulam-sanjo-mathew-trainer.jpg",
  "students-training-programme-caarmel-english-medium-school-ernakulam-sanjo-mathew-trainer.jpeg",
  "summer-camp-for-students-at-pathanamthitta-sanjo-mathew-trainer.png",
  "teachers-training-belibers-church-school-thiruvalla-sanjo-mathew-trainer.jpeg",
  "teachers-training-programme-believers-church-english-medium-school-alleppey-sanjo-mathew-trainer.jpeg",
  "teachers-training-programme-gregorian-public-school-kottayam-sanjo-mathew-trainer.jpg",
  "teachers-training-programme-nizamia-public-school-trivandrum-sanjo-mathew-trainer.jpg",
  "teachers-training-programme-st-marys-english-medium-school-kollam-sanjo-mathew-trainer.jpeg",
  "teachers=training-programme-caarmel-english-medium-school-ernakulam-sanjo-mathew-trainer.jpeg"
];

const gallery = document.getElementById('gallery');

imageFilenames.forEach(filename => {
  const div = document.createElement('div');
  div.className = 'col-lg-3 col-md-4 col-xs-6 thumb';
  div.innerHTML = `
            <a href="assets/imgs/gallery/${filename}" class="fancybox" rel="ligthbox">
                <img src="assets/imgs/gallery/${filename}" class="zoom img-fluid" alt="${filename}">
            </a>
        `;
  gallery.appendChild(div);
});