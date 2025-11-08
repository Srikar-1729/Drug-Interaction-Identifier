const input1 = document.getElementById('imageInput1');
const input2 = document.getElementById('imageInput2');
const img1 = document.getElementById('img1');
const img2 = document.getElementById('img2');
const preview1 = document.getElementById('preview1');
const preview2 = document.getElementById('preview2');
const resultEl = document.getElementById('result');
const form = document.getElementById('uploadForm');
const reloadButton = document.getElementById('reloadButton');
const recognizeButton = document.querySelector('button[type="submit"]');
const personalizeCheckbox = document.getElementById('personalizeCheckbox');
const healthModal = document.getElementById('healthModal');
const healthDetailsInput = document.getElementById('healthDetailsInput');
const submitHealthDetails = document.getElementById('submitHealthDetails');
const cancelHealthDetails = document.getElementById('cancelHealthDetails');

// Theme Toggle Functionality
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
document.body.classList.toggle('dark-mode', currentTheme === 'dark');
themeIcon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
  const isDarkMode = document.body.classList.toggle('dark-mode');
  themeIcon.textContent = isDarkMode ? '☀️' : '🌙';
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
});

// Show preview for uploaded image
function previewImage(input, imgEl, previewBox) {
  const file = input.files[0];
  if (file) {
    imgEl.src = URL.createObjectURL(file);
    imgEl.style.display = 'block';
    previewBox.querySelector("span").style.display = "none";
  } else {
    imgEl.style.display = 'none';
    previewBox.querySelector("span").style.display = "block";
  }
  
  // Hide drug name fields when new image is selected
  const drugNameField = previewBox.closest('.upload-box').querySelector('.drug-name-field');
  if (drugNameField) {
    drugNameField.style.display = 'none';
  }
}

input1.addEventListener('change', () => previewImage(input1, img1, preview1));
input2.addEventListener('change', () => previewImage(input2, img2, preview2));

// Function to submit form with optional health details
async function submitForm(healthDetails = null) {
  // Disable the button to prevent multiple submissions
  if (recognizeButton) {
    recognizeButton.disabled = true;
    recognizeButton.style.cursor = 'not-allowed';
    recognizeButton.style.opacity = '0.6';
  }

  const data = new FormData();
  if (input1.files[0]) data.append('image1', input1.files[0]);
  if (input2.files[0]) data.append('image2', input2.files[0]);
  if (healthDetails) {
    data.append('healthDetails', healthDetails);
  }

  resultEl.textContent = 'Processing images...';
  
  try {
    const res = await fetch('/upload', { method: 'POST', body: data });
    const json = await res.json();
    if (json.summary) {
      resultEl.innerHTML = `<p>${json.summary}</p>`;
      
      // Display drug names if available
      if (json.tablet1Name && json.tablet1Name !== 'N/A') {
        const drugName1 = document.getElementById('drugName1');
        const drugNameValue1 = document.getElementById('drugNameValue1');
        drugNameValue1.textContent = json.tablet1Name;
        drugName1.style.display = 'flex';
      }
      
      if (json.tablet2Name && json.tablet2Name !== 'N/A') {
        const drugName2 = document.getElementById('drugName2');
        const drugNameValue2 = document.getElementById('drugNameValue2');
        drugNameValue2.textContent = json.tablet2Name;
        drugName2.style.display = 'flex';
      }
    }
     
  } catch (err) {
    resultEl.textContent = 'Error recognizing tablets.';
    console.error(err);
  }
  // Button remains disabled - user can use reload button to start over
}

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Disable button immediately to prevent multiple clicks
  if (recognizeButton) {
    recognizeButton.disabled = true;
    recognizeButton.style.cursor = 'not-allowed';
    recognizeButton.style.opacity = '0.6';
  }

  // Check if personalization is enabled
  if (personalizeCheckbox.checked) {
    // Show the health details modal
    healthModal.style.display = 'flex';
    healthDetailsInput.value = '';
    healthDetailsInput.focus();
  } else {
    // Continue with normal flow
    submitForm();
  }
});

// Handle health details modal submission
submitHealthDetails.addEventListener('click', () => {
  const healthDetails = healthDetailsInput.value.trim();
  healthModal.style.display = 'none';
  submitForm(healthDetails || null);
});

// Handle cancel button
cancelHealthDetails.addEventListener('click', () => {
  healthModal.style.display = 'none';
  healthDetailsInput.value = '';
  // Re-enable button if user cancels
  if (recognizeButton) {
    recognizeButton.disabled = false;
    recognizeButton.style.cursor = 'pointer';
    recognizeButton.style.opacity = '1';
  }
});

// Close modal when clicking outside
healthModal.addEventListener('click', (e) => {
  if (e.target === healthModal) {
    healthModal.style.display = 'none';
    healthDetailsInput.value = '';
    // Re-enable button if user closes modal
    if (recognizeButton) {
      recognizeButton.disabled = false;
      recognizeButton.style.cursor = 'pointer';
      recognizeButton.style.opacity = '1';
    }
  }
});

reloadButton?.addEventListener('click', () => {
  window.location.reload();
});
