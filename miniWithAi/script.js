const unsafeData = Telegram.WebApp.initDataUnsafe;

// Load Lottie Animation
const lottieContainer = document.getElementById('lottie-container');
const lottiePlayer = document.createElement('lottie-player');
lottiePlayer.setAttribute('src', 'https://lottie.host/0b68f99c-e89b-4977-90e1-45d407f15e06/Q9VbePb3AM.json'); // Replace with your Lottie URL
lottiePlayer.setAttribute('background', 'transparent');
lottiePlayer.setAttribute('speed', '1');
lottiePlayer.setAttribute('loop', '');
lottiePlayer.setAttribute('autoplay', '');
lottieContainer.appendChild(lottiePlayer);

const languageText = document.getElementById('language-text');

// Check if unsafeData and unsafeData.user exist
if (unsafeData && unsafeData.user) {
    const userInfo = Object.entries(unsafeData.user)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    languageText.textContent = `User Info: ${userInfo}`;
} else {
    // Handle case where unsafeData.user is null or undefined
    languageText.textContent = 'User Info: Not available';
}

// Handle Give button (opens QR code reader)
document.getElementById('give-btn').addEventListener('click', () => {
    Telegram.WebApp.showScanQrPopup({
        text: 'for test purposes'
    }, function (text) {
        console.log(text); // handle scanned QR code
    });
});

// Handle Receive button (generates QR code)
const qrModal = document.getElementById('qr-modal');
const qrCodeContainer = document.getElementById("qr-code");

document.getElementById('receive-btn').addEventListener('click', () => {
    qrModal.style.display = 'flex';
    
    // Clear any existing QR codes before generating a new one
    qrCodeContainer.innerHTML = ''; // Clear previous QR code

    // Generate a new QR code
    new QRCode(qrCodeContainer, {
        text: unsafeData.user.id,
        width: 256,
        height: 256,
        colorDark: "#e77723",
        colorLight: "#121212",
        correctLevel: QRCode.CorrectLevel.H,
        dotOptions: { type: "extra-rounded" },
        imageOptions: { margin: 20 },
        cornersSquareOptions: { type: "extra-rounded", color: "#e77723" },
    });
});

// Close QR Modal
document.getElementById('close-qr-btn').addEventListener('click', () => {
    qrModal.style.display = 'none'; // This line hides the modal
    qrCodeContainer.innerHTML = ''; // Clear the QR code when closing
});


// Open List Modal
const listModal = document.getElementById('list-modal');
document.getElementById('view-list-btn').addEventListener('click', () => {
    const listContainer = document.getElementById('list-container');
    listContainer.innerHTML = '';
    const listData = [
        { id: '123', status: 'Paid' },
        { id: '124', status: 'Pending' },
        { id: '125', status: 'Paid' },
        { id: '126', status: 'Pending' },
        // Add more items to test scrolling
        { id: '127', status: 'Paid' },
        { id: '128', status: 'Pending' },
        { id: '129', status: 'Paid' },
        { id: '130', status: 'Pending' },
        { id: '131', status: 'Paid' },
        { id: '132', status: 'Pending' },
        { id: '133', status: 'Paid' },
        { id: '134', status: 'Pending' }
    ];
    const ul = document.createElement('ul');
    listData.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `ID: ${item.id} - Status: ${item.status}`;
        ul.appendChild(li);
    });
    listContainer.appendChild(ul);
    listModal.style.display = 'flex';
});

// Close List Modal
document.getElementById('close-list-btn').addEventListener('click', () => {
    listModal.style.display = 'none'; // This line hides the modal
});

// Withdraw Modal Logic
const withdrawModal = document.getElementById('withdraw-modal');
const withdrawMethodSelect = document.getElementById('withdraw-method');
const bankForm = document.getElementById('bank-form');
const cryptoForm = document.getElementById('crypto-form');

document.getElementById('withdraw-btn').addEventListener('click', () => {
    withdrawModal.style.display = 'flex';
});

withdrawMethodSelect.addEventListener('change', () => {
    if (withdrawMethodSelect.value === 'bank') {
        bankForm.style.display = 'block';
        cryptoForm.style.display = 'none';
    } else {
        bankForm.style.display = 'none';
        cryptoForm.style.display = 'block';
    }
});

document.getElementById('process-withdraw-btn').addEventListener('click', () => {
    alert('Withdrawal processed!');
});

document.getElementById('cancel-withdraw-btn').addEventListener('click', () => {
    withdrawModal.style.display = 'none';
});



// Infinite scroll for Withdraw Modal content
const scrollableModal = document.querySelector('.modal-content.scrollable');

// Simulate loading more content when user reaches the bottom
scrollableModal.addEventListener('scroll', () => {
    // Check if the user has scrolled to the bottom
    if (scrollableModal.scrollTop + scrollableModal.clientHeight >= scrollableModal.scrollHeight) {
        loadMoreContent(); // Load more content dynamically
    }
});

// Function to simulate loading additional content
function loadMoreContent() {
    // Example: Add new form group to simulate loading new content
    const newField = document.createElement('div');
    newField.className = 'form-group';
    newField.innerHTML = `
        <label>Extra Field</label>
        <input type="text" />
    `;
    
    // Append the new field to the modal content
    scrollableModal.appendChild(newField);
}

// Handle "More" button
document.getElementById('more-btn').addEventListener('click', function() {
    const extraButtons = document.getElementById('extra-buttons');
    const moreButton = this;

    if (extraButtons.style.display === 'none') {
        extraButtons.style.display = 'flex'; // Show the extra buttons
        moreButton.textContent = '-';  // Change "More..." to "Less..."
    } else {
        extraButtons.style.display = 'none'; // Hide the extra buttons
        moreButton.textContent = '+';  // Change back to "More..."
    }
});


  // ... your JavaScript code ...
  const modalContent = document.querySelector('.modal-content');

  // Add an empty element with height to trigger scrolling
  const triggerScroll = document.createElement('div');
  triggerScroll.style.height = '100px'; // Adjust height as needed
  modalContent.appendChild(triggerScroll);


  // Function to adjust modal content height
function adjustModalContentHeight() {
    const modalContent = document.querySelector('.modal-content');
    const windowHeight = window.innerHeight; // Get the viewport height
  
    // Adjust the modal content's height to allow for the keyboard
    modalContent.style.maxHeight = `${windowHeight - 50}px`; // Adjust the 50px value as needed
  }
  
  // Event listener for when the keyboard shows or hides
  window.addEventListener('resize', adjustModalContentHeight);
  
  // Call the function initially to set the initial height
  adjustModalContentHeight();