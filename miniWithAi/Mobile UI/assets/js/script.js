const menuBtn = document.getElementById('menu-btn');
const submenu = document.getElementById('submenu');

menuBtn.addEventListener('click', function() {
    // Toggle submenu visibility
    submenu.classList.toggle('show');
});

// Optional: Close submenu if clicked outside
document.addEventListener('click', function(event) {
    if (!menuBtn.contains(event.target) && !submenu.contains(event.target)) {
        submenu.classList.remove('show');
    }
});

const transactionCards = document.querySelectorAll(".transaction-card");

transactionCards.forEach(card => {
card.addEventListener("click", function() {
    // Remove 'active' class from all cards
    transactionCards.forEach(c => c.classList.remove("active"));

    // Add 'active' class to the clicked card
    this.classList.add("active");
    });
});



// Call the function to set up the listeners
// Function to listen for clicks on elements with specific IDs
function setupClickListeners() {
    const ids = ['send', 'request', 'topUp', 'scan'];
    
    ids.forEach(id => {
        const element = document.getElementById(id);
        
        if (element) {
            element.addEventListener('click', () => {
                console.log(`${id} clicked`);
                // Add any custom behavior for each button here
            });
        }
    });
}

// Set up listeners when the document is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    setupClickListeners();
});


let user;  // Declare the user variable

// Function to log and display initData and initDataUnsafe data
function logInitDataUnsafe() {
    console.log("Telegram WebApp is ready.");

    // Check if the Telegram WebApp object is available
    if (Telegram.WebApp) {
        console.log("Telegram WebApp object is available:", Telegram.WebApp);

        // Log the initData object
        if (Telegram.WebApp.initData) {
            console.log("initData object:", Telegram.WebApp.initData);
        } else {
            console.error("initData is not available within Telegram.WebApp.");
        }

        // Log the initDataUnsafe object and extract user data
        if (Telegram.WebApp.initDataUnsafe) {
            console.log("initDataUnsafe object:", Telegram.WebApp.initDataUnsafe);

            // Check if the user exists in initDataUnsafe
            if (Telegram.WebApp.initDataUnsafe.user) {
                user = Telegram.WebApp.initDataUnsafe.user; // Assign user object
                console.log("User data:", user);

                // Extract first name and last name from initDataUnsafe
                const firstName = user.first_name || "First name not available";
                const lastName = user.last_name || "Last name not available";

                // Display the first and last name in the HTML element with id 'user-data'
                const userDataElement = document.getElementById("user-data");
                if (userDataElement) {
                    userDataElement.textContent = `${firstName} ${lastName}`;
                } else {
                    console.error("Element with id 'user-data' not found.");
                }
            } else {
                console.error("User data is not available in initDataUnsafe.");
            }
        } else {
            console.error("initDataUnsafe is not available within Telegram.WebApp.");
        }
    } else {
        console.error("Telegram WebApp object is not available.");
    }
}


let languageCode;
function displayLanguageContent() {
    // Default language to 'en' if user.language_code is not available
    languageCode = user?.language_code || "es";

    // Get all elements with data-lang attribute
    const languageElements = document.querySelectorAll('[data-lang]');

    // Loop through each element and display or hide based on the language code
    languageElements.forEach(element => {
        const elementLang = element.getAttribute('data-lang');
        if (elementLang === languageCode) {
            element.style.display = 'block';  // Show the element for the correct language
        } else {
            element.style.display = 'none';  // Hide the other elements
        }
    });
}

// After initializing the user object with initDataUnsafe
document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM fully loaded and parsed.");
    logInitDataUnsafe();  // This will assign the user object
    displayLanguageContent();  // Display content based on language
});


// send 

document.getElementById("send").addEventListener("click", function() {
    console.log("send clicked");

    // Get user's language code
    const userLanguageCode = languageCode;

    // Define the text based on the user's language code
    const sendToLabel = userLanguageCode === "es" ? "Enviar a" : "Send to";
    const amountLabel = userLanguageCode === "es" ? "Cantidad" : "Amount";

    // Show SweetAlert2 form with a Scan button
    Swal.fire({
        title: userLanguageCode === "es" ? "Enviar" : "Send",
        html: `
            <label>${sendToLabel}:</label>
            <input type="text" id="recipient" class="swal2-input" placeholder="${sendToLabel}" />
            <label>${amountLabel}:</label>
            <input type="number" id="amount" class="swal2-input" placeholder="${amountLabel}" inputmode="numeric" />
            <button id="scanQr" class="swal2-confirm custom-scan-button" style="margin-top: 10px;">Scan QR</button>
        `,
        background: '#121212', // Set the background color
        confirmButtonText: userLanguageCode === "es" ? "Enviar" : "Send",
        cancelButtonText: userLanguageCode === "es" ? "Cancelar" : "Cancel",
        showCancelButton: true,
        focusConfirm: false,
        didOpen: () => {
            // Add click event listener to the Scan QR button inside the modal
            const scanButton = document.getElementById('scanQr');
            scanButton.addEventListener('click', function() {
                console.log('Scan button clicked');

                let text = readQr();
                Swal.fire({
                    title: "qr read 01 ",
                    text: text ? text : "No data at 01",
                    icon: "success"
                  });
                if (text) {
                    const lowerText = text.toString().toLowerCase();


                    Swal.fire({
                        title: "qr read ",
                        text: ('Scanned text:', lowerText),
                        icon: "success"
                      });


                    if (lowerText.substring(0, 7) === 'http://' || lowerText.substring(0, 8) === 'https://') {
                        // Handle link-type QR code (open a link)
                        setTimeout(function() {
                            Telegram.WebApp.openLink(text);
                        }, 50);
                        return true;
                    } else if (lowerText.includes('?amountRequested=')) {
                        // Handle custom format like 'recipient?amountRequested=amount'
                        const [recipient, amountPart] = lowerText.split('?amountRequested=');
                        const amount = amountPart || '';
                        const rec = recipient || '';

                        Swal.fire({
                            title: "qr read ",
                            text: `${rec} ${amount}`,
                            icon: "success"
                          });

                        // Autofill the scanned data into the input fields
                        document.getElementById('recipient').value = rec;
                        document.getElementById('amount').value = amount;
                    } else {
                        Swal.showValidationMessage('Invalid QR code format');
                    }
                } else {
                    Swal.showValidationMessage('No data scanned');
                }
            });
        },
        preConfirm: () => {
            const recipient = document.getElementById('recipient').value;
            const amount = document.getElementById('amount').value;
            if (!recipient || !amount) {
                Swal.showValidationMessage(`Please enter both fields`);
            }
            return { recipient, amount };
        },
        customClass: {
            confirmButton: 'custom-confirm-button',
            cancelButton: 'custom-cancel-button'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            console.log(`Sending to: ${result.value.recipient}, Amount: ${result.value.amount}`);
            // Perform sending logic here
        }
    });
});

// Add CSS for the custom buttons
const style = document.createElement('style');
style.innerHTML = `
    .custom-confirm-button, .custom-cancel-button {
        background-color: #00d8de !important;
        color: white !important; /* Ensure text is visible */
    }
    .custom-scan-button {
        background-color: #e77723 !important;
        color: white !important;
        padding: 10px 20px;
        border: none;
        cursor: pointer;
    }
`;
document.head.appendChild(style);


document.getElementById("scan").addEventListener("click", function() {
    readQr();
})


function readQr(linksOnly) {

    Telegram.WebApp.showScanQrPopup({
        text: linksOnly ? 'with any link' : 'for test purposes'
    }, function(text) {
        if (linksOnly) {
            const lowerText = text.toString().toLowerCase();
            if (lowerText.substring(0, 7) === 'http://' ||
                lowerText.substring(0, 8) === 'https://'
            ) {
                setTimeout(function() {
                    Telegram.WebApp.openLink(text);
                }, 50);

                return true;
            }
        } else {
            Swal.fire({
                title: "qr read 00 ",
                text: ('Scanned text at function :', text),
                icon: "success"
              });
            return text;
        }
    });
    
}










// request 
document.getElementById("request").addEventListener("click", function() {
    console.log("request clicked"); // Debugging: Log when request is clicked

    // Get the user's language code, default to English if not found
    const userLang = languageCode;

    // Set title and text based on language
    const title = userLang === 'es' ? 'Cantidad de Solicitud' : 'Request Amount';
    const text = userLang === 'es' ? '¿Cuánto deseas solicitar?' : 'How much do you want to request?';
    const inputPlaceholder = userLang === 'es' ? 'Introduce la cantidad' : 'Enter amount';
    const confirmButtonText = userLang === 'es' ? 'Solicitar' : 'Request';
    const cancelButtonText = userLang === 'es' ? 'Cancelar' : 'Cancel';

    // Show SweetAlert2 for requesting amount
    Swal.fire({
        title: title,
        text: text,
        input: 'number',
        inputPlaceholder: inputPlaceholder,
        background: '#121212',
        confirmButtonText: confirmButtonText,
        cancelButtonText: cancelButtonText,
        showCancelButton: true,
        allowOutsideClick: false, // Prevent closing when clicking outside
        allowEscapeKey: false, // Prevent closing with escape key
        inputAttributes: {
            class: 'custom-input', // Custom class for styling
            style: 'text-align: center;', // Center align text
            inputmode: 'numeric', // Ensure numeric keyboard is displayed
        },
        customClass: {
            confirmButton: 'swal2-confirm swal2-styled', // Custom class for confirm button
            cancelButton: 'swal2-cancel swal2-styled', // Custom class for cancel button
        },
        preConfirm: (amount) => {
            // Check if amount is valid
            if (!amount || amount <= 0) {
                Swal.showValidationMessage(userLang === 'es' ? `Por favor, introduce una cantidad válida.` : `Please enter a valid amount.`);
                return false; // Return false to keep the alert open
            }
            return amount;
        },
        customClass: {
            confirmButton: 'custom-confirm-button',
            cancelButton: 'custom-cancel-button',
            popup: 'custom-swal-popup',
            input: 'custom-swal-input',
        },
    }).then((result) => {
        if (result.isConfirmed) {
            const requestedAmount = result.value;
            const userId = Telegram.WebApp.initDataUnsafe?.user?.id || 'dummy_user_id'; 

            // Create a QR code container
            const qrCodeContainer = document.createElement('canvas'); // Use a canvas for Qrious
            qrCodeContainer.style.textAlign = 'center';
            document.body.appendChild(qrCodeContainer);

            // Generate the QR code
            const qrCode = new QRious({
                element: qrCodeContainer,
                value: `${userId}?amountRequested=${requestedAmount}`,
                size: 256,
                background: '#121212',
                foreground: '#55a7d3',
                level: 'H',
            });

            // After the QR code is drawn, add the logo
            const ctx = qrCodeContainer.getContext('2d');
            const logo = new Image();
            logo.src = 'https://sistemasintegradosao.com/miniApp/assets/img/logos/gnrLogo256.png';
            logo.onload = () => {
                const logoSize = qrCodeContainer.width / 4; // Set logo size to 1/4 of QR code size
                const x = (qrCodeContainer.width - logoSize) / 2;
                const y = (qrCodeContainer.height - logoSize) / 2;
                ctx.drawImage(logo, x, y, logoSize, logoSize); // Draw the logo in the center
            };

            // Display QR code in a SweetAlert2 modal
            Swal.fire({
                // title: userLang === 'es' ? 'Tu Código QR' : 'Your QR Code',
                html: `<p>${userLang === 'es' ? 'Solicitud de' : 'Requesting'} <strong>$ ${requestedAmount}</strong></p>`,
                background: '#121212',
                confirmButtonText: userLang === 'es' ? 'Cerrar' : 'Close',
                confirmButtonColor: '#00d8de', // Match color to send button
                showCancelButton: false,
                color: '#00d8de',
                willOpen: () => { // Use willOpen instead of onOpen
                    const content = Swal.getHtmlContainer(); // Get the content container
                    content.appendChild(qrCodeContainer); // Append the QR code container
                }
            });
        }
    });
});


