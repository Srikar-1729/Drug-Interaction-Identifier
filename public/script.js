const input1 = document.getElementById('imageInput1');
const input2 = document.getElementById('imageInput2');
const img1 = document.getElementById('img1');
const img2 = document.getElementById('img2');
const preview1 = document.getElementById('preview1');
const preview2 = document.getElementById('preview2');
const resultEl = document.getElementById('result');
const form = document.getElementById('uploadForm');

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
}

input1.addEventListener('change', () => previewImage(input1, img1, preview1));
input2.addEventListener('change', () => previewImage(input2, img2, preview2));

// Handle form submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = new FormData();
  if (input1.files[0]) data.append('image1', input1.files[0]);
  if (input2.files[0]) data.append('image2', input2.files[0]);

  // for (let [key, value] of data.entries()) {
  //   console.log(key, value);
  // }

  resultEl.textContent = 'Processing images...';
  
  try {
    // const sum = 4;
    // console.log(json);
    const res = await fetch('/upload', { method: 'POST', body: data });
    const json = await res.json();
    if (json.summary) {
      resultEl.innerHTML = `<p>${json.summary}</p>`;
    }
     
  } catch (err) {
    resultEl.textContent = 'Error recognizing tablets.';
    console.error(err);
  }
});
