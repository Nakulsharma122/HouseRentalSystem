// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
      .forEach(function (form) {
        form.addEventListener('submit', function (event) {
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }
  
          form.classList.add('was-validated')
        }, false)
      })
  })()


  // public/js/script.js
document.addEventListener('DOMContentLoaded', () => {
  const checkInInput = document.getElementById('checkIn');
  const checkOutInput = document.getElementById('checkOut');

  checkInInput.addEventListener('change', () => {
      const checkInDate = new Date(checkInInput.value);
      checkOutInput.setAttribute('min', checkInInput.value);
      checkOutInput.value = '';
  });

  checkOutInput.addEventListener('change', () => {
      const checkInDate = new Date(checkInInput.value);
      const checkOutDate = new Date(checkOutInput.value);
      if (checkOutDate <= checkInDate) {
          alert('Check-Out date must be after Check-In date');
          checkOutInput.value = '';
      }
  });
});
