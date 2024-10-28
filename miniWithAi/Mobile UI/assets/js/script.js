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

let updateId = `update id 45`;
let user;  // Declare the user variable

// Function to log and display initData and initDataUnsafe data
// Function to log and display initData and initDataUnsafe data
function logInitDataUnsafe() {
    console.log("Telegram WebApp is ready.");

    if (Telegram.WebApp) {
        console.log("Telegram WebApp object is available:", Telegram.WebApp);

        // Access initData and initDataUnsafe
        const initData = Telegram.WebApp.initData;  
        const initDataUnsafe = Telegram.WebApp.initDataUnsafe;

        console.log("initData:", initData);
        console.log("initDataUnsafe:", initDataUnsafe);

        // Extract and display user data if available
        if (initDataUnsafe.user) {
            const user = initDataUnsafe.user;  // Assign user object
            console.log("User data:", user);

            const firstName = user.first_name || "First name not available";
            const lastName = user.last_name || "Last name not available";

            // Display user info or other relevant data
            const devId = document.getElementById("balance");
            if (devId) {
                devId.textContent = `${firstName} ${lastName}`;
            } else {
                console.error("Element with id 'balance' not found.");
            }
        } else {
            console.error("User data is not available in initDataUnsafe.");
        }

        // Send initData to the backend for validation
        fetch('/validate-telegram-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData: initData }),
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.valid) {
                console.log("Data validated successfully:", data);
                // Continue with app logic if valid
            } else {
                console.error("Validation failed:", data.error);
                alert("Invalid or expired Telegram data.");
            }
        })
        .catch((error) => {
            console.error("Validation error:", error);
            alert("Error validating Telegram data.");
        });

    } else {
        console.error("Telegram WebApp object is not available.");

        // Clear HTML and display message to open the app via Telegram
        document.body.innerHTML = "";
        const message = document.createElement("div");
        message.textContent = "Please visit us via Telegram.";
        message.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            font-size: 24px;
            color: #fff;
            background-color: #121212;
            text-align: center;
        `;
        document.body.appendChild(message);
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
let qrData = "";
document.getElementById("send").addEventListener("click", function() {
    loadSend();
});

function loadSend() {
    const userLanguageCode = languageCode;

    // Define the text based on the user's language code
    const sendToLabel = userLanguageCode === "es" ? "Enviar a" : "Send to";
    const amountLabel = userLanguageCode === "es" ? "Cantidad" : "Amount";
    const messageLabel = userLanguageCode === "es" ? "Mensaje (opcional)" : "Message (optional)";

    // Show SweetAlert2 form with a Scan button
    Swal.fire({
        title: userLanguageCode === "es" ? "Enviar" : "Send",
        html: `
            <label>${sendToLabel}:</label>
            <input type="text" id="recipient" class="swal2-input" placeholder="${sendToLabel}" />
            <label>${amountLabel}:</label>
            <input type="number" id="amount" class="swal2-input" placeholder="${amountLabel}" inputmode="numeric" />
            <label>${messageLabel}:</label>
            <input type="text" id="message" class="swal2-input" placeholder="${messageLabel}" value="GNR Transfer ..." />
            <button id="scanQr" class="swal2-confirm custom-scan-button" style="margin-top: 10px;">Scan QR</button>
        `,
        background: '#121212', // Set the background color
        color: '#fff',
        confirmButtonText: userLanguageCode === "es" ? "Enviar" : "Send",
        cancelButtonText: userLanguageCode === "es" ? "Cancelar" : "Cancel",
        showCancelButton: true,
        focusConfirm: false,
        didOpen: () => {
            // Add click event listener to the Scan QR button inside the modal
            const scanButton = document.getElementById('scanQr');
            scanButton.addEventListener('click', async function() {
                // Close the current Swal and start QR scanning
                Swal.close();

                // Call the readQr function and wait for the result
                await readQr(false, true);

                // Reopen loadSend with updated input values from qrData
                const lowerText = qrData.toString().toLowerCase();
                const [recipient, amountPart] = lowerText.split('?amountrequested=');
                const amount = amountPart || '';
                const rec = recipient || '';

                // Now, reopen the SweetAlert2 with the new values filled
                loadSendWithValues(rec, amount, "a gift from ....");
            });

            // Focus on inputs and scroll to them when focused
            const inputs = document.querySelectorAll('.swal2-input');
            inputs.forEach(input => {
                input.addEventListener('focus', () => {
                    setTimeout(() => {
                        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                });
            });
        },
        preConfirm: () => {
            const recipient = document.getElementById('recipient').value;
            const amount = document.getElementById('amount').value;
            const message = document.getElementById('message').value || "a gift from ....";
            if (!recipient || !amount) {
                Swal.showValidationMessage(`Please enter both fields`);
            }
            return { recipient, amount, message };
        },
        customClass: {
            confirmButton: 'custom-confirm-button',
            cancelButton: 'custom-cancel-button'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Close current alert
            Swal.close();

            // Perform sending logic here (optional)

            // Open new SweetAlert with Lottie animation
            showLottieAnimation();
        }
    });
}

function loadSendWithValues(recipient, amount, defaultMessage) {
    const userLanguageCode = languageCode;

    const sendToLabel = userLanguageCode === "es" ? "Enviar a" : "Send to";
    const amountLabel = userLanguageCode === "es" ? "Cantidad" : "Amount";
    const messageLabel = userLanguageCode === "es" ? "Mensaje (opcional)" : "Message (optional)";

    Swal.fire({
        title: userLanguageCode === "es" ? "Enviar" : "Send",
        html: `
            <label>${sendToLabel}:</label>
            <input type="text" id="recipient" class="swal2-input" placeholder="${sendToLabel}" value="${recipient}" />
            <label>${amountLabel}:</label>
            <input type="number" id="amount" class="swal2-input" placeholder="${amountLabel}" inputmode="numeric" value="${amount}" />
            <label>${messageLabel}:</label>
            <input type="text" id="message" class="swal2-input" placeholder="${messageLabel}" value="${defaultMessage}" />
        `,
        background: '#121212',
        color: '#fff',
        confirmButtonText: userLanguageCode === "es" ? "Enviar" : "Send",
        cancelButtonText: userLanguageCode === "es" ? "Cancelar" : "Cancel",
        showCancelButton: true,
        focusConfirm: false,
        didOpen: () => {
            // Focus on inputs and scroll to them when focused
            const inputs = document.querySelectorAll('.swal2-input');
            inputs.forEach(input => {
                input.addEventListener('focus', () => {
                    setTimeout(() => {
                        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                });
            });
        },
        preConfirm: () => {
            const recipient = document.getElementById('recipient').value;
            const amount = document.getElementById('amount').value;
            const message = document.getElementById('message').value;
            if (!recipient || !amount) {
                Swal.showValidationMessage(`Please enter both fields`);
            }
            return { recipient, amount, message };
        },
        customClass: {
            confirmButton: 'custom-confirm-button',
            cancelButton: 'custom-cancel-button'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Close current alert
            Swal.close();

            // Perform sending logic here (optional)

            // Open new SweetAlert with Lottie animation
            showLottieAnimation();
        }
    });
}

// Function to display the Lottie animation and automatically close after two loops
function LottieAnimation() {
    Swal.fire({
        html: '<div id="lottie-container" style="width: 200px; height: 200px; margin: 0 auto;"></div>',
        background: '#121212',
        showConfirmButton: false,
        allowOutsideClick: false,
        didOpen: () => {
            const lottieContainer = document.getElementById('lottie-container');

            // Ensure that the container exists and has been properly rendered
            if (lottieContainer) {
                // Load and play the Lottie animation
                const animation = bodymovin.loadAnimation({
                    container: lottieContainer,
                    renderer: 'svg',
                    loop: 2,  // Loop the animation twice
                    autoplay: true,
                    path: 'https://lottie.host/9caea19d-796a-420a-8f3d-2f9bc8a0705f/cGU8f0fwXe.json'
                });

                // Check if the animation has loaded properly
                animation.addEventListener('DOMLoaded', function() {
                    Telegram.WebApp.showAlert('Lottie animation loaded successfully.');
                });

                // Close the SweetAlert when the animation finishes (after 2 loops)
                animation.addEventListener('complete', function() {
                    Swal.close(); // Close the SweetAlert when the Lottie finishes
                });
            } else {
                Telegram.WebApp.showAlert('Lottie container not found.');
            }
        }
    });
}
// Function to open the Lottie modal
function showLottieAnimation() {
    const lottieModal = document.getElementById("lottieModal");
    const closeModalButton = document.getElementById("closeLottieModal");
    const lottieContainer = document.getElementById('lottie-container');

    // Display the modal
    lottieModal.style.display = "flex";

    console.log("Modal opened!"); // Debug check if modal is shown

    // Load and play the Lottie animation
    const animation = bodymovin.loadAnimation({
        container: lottieContainer,
        renderer: 'svg',
        loop: 0, // Set it to play once
        autoplay: true,
        path: 'https://lottie.host/1101fff1-d3f8-475d-9fa0-870be9a7b312/zHIQArc0QL.json'
    });

    console.log("Lottie animation triggered!"); // Debug check if animation is loaded

    // Automatically close the modal when the animation finishes playing
    animation.addEventListener('complete', function() {
        closeLottieModal();
    });

    // Close the modal manually when the close button is clicked
    closeModalButton.onclick = function() {
        closeLottieModal();
    };
}


// Function to close the modal
function closeLottieModal() {
    const lottieModal = document.getElementById("lottieModal");
    lottieModal.style.display = "none";

    // Clear the container to reset animation next time
    document.getElementById('lottie-container').innerHTML = "";
}

// You can trigger the modal to open by calling openLottieModal() whenever needed

// showLottieAnimation();



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


function readQr(linksOnly = false, relaunch = false) {
    return new Promise((resolve, reject) => {
        Telegram.WebApp.showScanQrPopup({
            text: linksOnly ? 'with any link' : 'for test purposes'
        }, function(text) {
            // Close the QR scanner after scanning
            Telegram.WebApp.closeScanQrPopup();
            
            if (linksOnly) {
                const lowerText = text.toString().toLowerCase();
                if (lowerText.substring(0, 7) === 'http://' ||
                    lowerText.substring(0, 8) === 'https://'
                ) {
                    setTimeout(function() {
                        Telegram.WebApp.openLink(text);
                    }, 50);

                    resolve(true); // Resolve the promise
                }
            } else {
                Swal.fire({
                    title: updateId,
                    text: ('Scanned text at function:', text),
                    icon: "success"
                });
                qrData = text;
                resolve(qrData); // Resolve with the scanned text
            }
        });
    }).then(() => {
        if (qrData !== "" && relaunch) {
            loadSend();
        }
    }).catch((error) => {
        console.error("Error scanning QR code:", error);
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
        color:"#fff",
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

// credit card 
document.getElementById("topUp").addEventListener("click", function() {
    showCreditCardForm();
})

function showCreditCardForm() {
    const creditCardModal = document.getElementById("credit-card-modal");
    const creditCardContainer = document.querySelector(".credit-card-container");

    // Display the modal
    creditCardModal.style.display = "flex";
    // Clear inner HTML of the credit-card-container
    creditCardContainer.innerHTML = "";

    // Add the close button back to the container
    const closeButton = document.createElement('span');
    closeButton.id = "close-credit-card-modal";
    closeButton.className = "credit-card-close";
    closeButton.innerHTML = "&times;";
    closeButton.onclick = function() {closeCreditCardModal();};

    // Append the close button to the container
    creditCardContainer.appendChild(closeButton);

    // Create the credit card form
    const form = document.createElement('form');
    form.id = "credit-card-form";
    form.className = "credit-card-form";

    // Form HTML structure
    form.innerHTML = `
        <label for="credit-card-holder">Cardholder Name</label><br>
        <input type="text" id="credit-card-holder" name="credit-card-holder" required><br>

        <label for="credit-card-number">Card Number</label><br>
        <input type="text" id="credit-card-number" name="credit-card-number" maxlength="16" required placeholder="1111 2222 3333 4444" inputmode="numeric"><br>

        <label for="credit-card-expiry">Expiry Date</label><br>
        <select id="credit-card-expiry-month" name="credit-card-expiry-month" required inputmode="numeric">
            <option value="" disabled selected>Month</option>
            <option value="01">01</option>
            <option value="02">02</option>
            <option value="03">03</option>
            <option value="04">04</option>
            <option value="05">05</option>
            <option value="06">06</option>
            <option value="07">07</option>
            <option value="08">08</option>
            <option value="09">09</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
        </select>
        <select id="credit-card-expiry-year" name="credit-card-expiry-year" required inputmode="numeric">
            <option value="" disabled selected>Year</option>
            <!-- JavaScript will populate this -->
        </select><br>

        <label for="credit-card-cvv">Security Code (CVV)</label><br>
        <input type="text" id="credit-card-cvv" name="credit-card-cvv" maxlength="3" required placeholder="123" inputmode="numeric"><br>

        <button type="submit">Process</button>

    `;

    // Append the form to the container
    creditCardContainer.appendChild(form);

    // Populate the year dropdown
    populateYearDropdown();

    // Handle form submission
    form.onsubmit = function(event) {
        event.preventDefault(); // Prevent default form submission

        // Validate card details
        const cardHolder = document.getElementById('credit-card-holder').value;
        const cardNumber = document.getElementById('credit-card-number').value.replace(/\s/g, '');
        const expiryMonth = document.getElementById('credit-card-expiry-month').value;
        const expiryYear = document.getElementById('credit-card-expiry-year').value;
        const cvv = document.getElementById('credit-card-cvv').value;

        console.log("Form submitted with data:", {
            cardHolder,
            cardNumber,
            expiryMonth,
            expiryYear,
            cvv,
        });

        closeCreditCardModal(); // Close the modal after submission
    };
}


// Function to populate the year dropdown
function populateYearDropdown() {
    const yearDropdown = document.getElementById('credit-card-expiry-year');
    const currentYear = new Date().getFullYear();

    for (let i = 0; i <= 10; i++) {
        const year = currentYear + i;
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearDropdown.appendChild(option);
    }
}

// Updated expiry date validation function
function validateExpiryDate(month, year) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // Months are zero-indexed

    return (year > currentYear) || (year == currentYear && month >= currentMonth);
}

// Rest of the JavaScript code remains the same...


function closeCreditCardModal() {
    const creditCardModal = document.getElementById("credit-card-modal");
    creditCardModal.style.display = "none"; // Hide the modal
    console.log("Credit Card Modal closed!"); // Debug check if modal is hidden
}


