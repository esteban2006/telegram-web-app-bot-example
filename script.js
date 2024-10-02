const toggleButton = document.getElementById('toggle-theme');
const body = document.body;

toggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-theme');
    body.classList.toggle('light-theme');
});



const DemoApp = {
    initData: Telegram.WebApp.initData || '',
    initDataUnsafe: Telegram.WebApp.initDataUnsafe || {},
    MainButton: Telegram.WebApp.MainButton,

    init(options) {
        document.body.style.visibility = '';
        Telegram.WebApp.ready();
        Telegram.WebApp.MainButton.setParams({
            text: 'CLOSE WEBVIEW',
            is_visible: true
        }).onClick(DemoApp.close);
    },
    expand() {
        Telegram.WebApp.expand();
    },
    close() {
        Telegram.WebApp.close();
    },
    toggleMainButton(el) {
        const mainButton = Telegram.WebApp.MainButton;
        if (mainButton.isVisible) {
            mainButton.hide();
            el.innerHTML = 'Show Main Button';
        } else {
            mainButton.show();
            el.innerHTML = 'Hide Main Button';
        }
    },

    // actions
    sendMessage(msg_id, with_webview) {
        if (!DemoApp.initDataUnsafe.query_id) {
            alert('WebViewQueryId not defined');
            return;
        }

        document.querySelectorAll('button').forEach((btn) => btn.disabled = true);

        const btn = document.querySelector('#btn_status');
        btn.textContent = 'Sending...';

        DemoApp.apiRequest('sendMessage', {
            msg_id: msg_id || '',
            with_webview: !DemoApp.initDataUnsafe.receiver && with_webview ? 1 : 0
        }, function(result) {
            document.querySelectorAll('button').forEach((btn) => btn.disabled = false);

            if (result.response) {
                if (result.response.ok) {
                    btn.textContent = 'Message sent successfully!';
                    btn.className = 'ok';
                    btn.style.display = 'block';
                } else {
                    btn.textContent = result.response.description;
                    btn.className = 'err';
                    btn.style.display = 'block';
                    alert(result.response.description);
                }
            } else if (result.error) {
                btn.textContent = result.error;
                btn.className = 'err';
                btn.style.display = 'block';
                alert(result.error);
            } else {
                btn.textContent = 'Unknown error';
                btn.className = 'err';
                btn.style.display = 'block';
                alert('Unknown error');
            }
        });
    },
    changeMenuButton(close) {
        document.querySelectorAll('button').forEach((btn) => btn.disabled = true);
        const btnStatus = document.querySelector('#btn_status');
        btnStatus.textContent = 'Changing button...';

        DemoApp.apiRequest('changeMenuButton', {}, function(result) {
            document.querySelectorAll('button').forEach((btn) => btn.disabled = false);

            if (result.response) {
                if (result.response.ok) {
                    btnStatus.textContent = 'Button changed!';
                    btnStatus.className = 'ok';
                    btnStatus.style.display = 'block';
                    Telegram.WebApp.close();
                } else {
                    btnStatus.textContent = result.response.description;
                    btnStatus.className = 'err';
                    btnStatus.style.display = 'block';
                    alert(result.response.description);
                }
            } else if (result.error) {
                btnStatus.textContent = result.error;
                btnStatus.className = 'err';
                btnStatus.style.display = 'block';
                alert(result.error);
            } else {
                btnStatus.textContent = 'Unknown error';
                btnStatus.className = 'err';
                btnStatus.style.display = 'block';
                alert('Unknown error');
            }
        });
        if (close) {
            setTimeout(function() {
                Telegram.WebApp.close();
            }, 50);
        }
    },
    checkInitData() {
        const webViewStatus = document.querySelector('#webview_data_status');
        if (DemoApp.initDataUnsafe.query_id &&
            DemoApp.initData &&
            webViewStatus.classList.contains('status_need')
        ) {
            webViewStatus.classList.remove('status_need');
            DemoApp.apiRequest('checkInitData', {}, function(result) {
                if (result.ok) {
                    webViewStatus.textContent = 'Hash is correct (async)';
                    webViewStatus.className = 'ok';
                } else {
                    webViewStatus.textContent = result.error + ' (async)';
                    webViewStatus.className = 'err';
                }
            });
        }
    },
    sendText(spam) {
        const textField = document.querySelector('#text_field');
        const text = textField.value;
        if (!text.length) {
            return textField.focus();
        }
        if (byteLength(text) > 4096) {
            return alert('Text is too long');
        }

        const repeat = spam ? 10 : 1;
        for (let i = 0; i < repeat; i++) {
            Telegram.WebApp.sendData(text);
        }
    },
    sendTime(spam) {
        const repeat = spam ? 10 : 1;
        for (let i = 0; i < repeat; i++) {
            Telegram.WebApp.sendData(new Date().toString());
        }
    },

    // Alerts
    showAlert(message) {
        Telegram.WebApp.showAlert(message);
    },
    showConfirm(message) {
        Telegram.WebApp.showConfirm(message);
    },
    showPopup() {
        Telegram.WebApp.showPopup({
            title: 'Popup title',
            message: 'Popup message',
            buttons: [
                {id: 'delete', type: 'destructive', text: 'Delete all'},
                {id: 'faq', type: 'default', text: 'Open FAQ'},
                {type: 'cancel'},
            ]
        }, function(buttonId) {
            if (buttonId === 'delete') {
                DemoApp.showAlert("'Delete all' selected");
            } else if (buttonId === 'faq') {
                Telegram.WebApp.openLink('https://telegram.org/faq');
            }
        });
    },
    showScanQrPopup: function(linksOnly) {
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
                DemoApp.showAlert(text);

                return true;
            }
        });
    },

    // Permissions
    requestLocation(el) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                el.nextElementSibling.innerHTML = '(' + position.coords.latitude + ', ' + position.coords.longitude + ')';
                el.nextElementSibling.className = 'ok';
            });
        } else {
            el.nextElementSibling.innerHTML = 'Geolocation is not supported in this browser.';
            el.nextElementSibling.className = 'err';
        }
        return false;
    },
    requestVideo(el) {
        if (navigator.mediaDevices) {
            navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then(function(stream) {
                el.nextElementSibling.innerHTML = '(Access granted)';
            });
        } else {
            el.nextElementSibling.innerHTML = 'Media devices is not supported in this browser.';
            el.nextElementSibling.className = 'err';
        }
        return false;
    },
    requestAudio(el) {
        if (navigator.mediaDevices) {
            navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function(stream) {
                el.nextElementSibling.innerHTML = '(Access granted)';
                el.nextElementSibling.className = 'ok';
            });
        } else {
            el.nextElementSibling.innerHTML = 'Media devices is not supported in this browser.';
            el.nextElementSibling.className = 'err';
        }
        return false;
    },
    requestAudioVideo(el) {
        if (navigator.mediaDevices) {
            navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(function(stream) {
                el.nextElementSibling.innerHTML = '(Access granted)';
                el.nextElementSibling.className = 'ok';
            });
        } else {
            el.nextElementSibling.innerHTML = 'Media devices is not supported in this browser.';
            el.nextElementSibling.className = 'err';
        }
        return false;
    },
    testClipboard(el) {
        Telegram.WebApp.readTextFromClipboard(function(clipText) {
            if (clipText === null) {
                el.nextElementSibling.innerHTML = 'Clipboard text unavailable.';
                el.nextElementSibling.className = 'err';
            } else {
                el.nextElementSibling.innerHTML = '(Read from clipboard: Â«' + clipText + 'Â»)';
                el.nextElementSibling.className = 'ok';
            }
        });
        return false;
    },

    // Other
    apiRequest(method, data, onCallback) {
        // DISABLE BACKEND FOR FRONTEND DEMO
        // YOU CAN USE YOUR OWN REQUESTS TO YOUR OWN BACKEND
        // CHANGE THIS CODE TO YOUR OWN
        return onCallback && onCallback({error: 'This function (' + method + ') should send requests to your backend. Please, change this code to your own.'});

        const authData = DemoApp.initData || '';
        fetch('/demo/api', {
            method: 'POST',
            body: JSON.stringify(Object.assign(data, {
                _auth: authData,
                method: method,
            })),
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(response) {
            return response.json();
        }).then(function(result) {
            onCallback && onCallback(result);
        }).catch(function(error) {
            onCallback && onCallback({error: 'Server error'});
        });
    }
}




// lllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllllanguage

    // Immediately determine the language
    function getLanguage() {
        const params = new URLSearchParams(window.location.search);
        const lang = params.get("lang");
        if (lang) return lang;

        const dataLanElement = document.querySelector("[data-lang]");
        const pageLanguage = dataLanElement ? dataLanElement.getAttribute("data-lang") : null;

        return pageLanguage || localStorage.getItem("selectedLang") || "es"; // Default to "es"
    }

    // Display content according to the selected language
    function displayLanguageContent(language) {
        const texts = document.querySelectorAll("[data-lang]");
        texts.forEach((text) => {
            text.style.display = text.getAttribute("data-lang") === language ? "block" : "none";
        });

        // Update WhatsApp link dynamically
        const whatsappLink = document.getElementById("whatsapp-link");
        if (whatsappLink) {
            const whatsappTexts = {
                "es": "¡Hola SOS!",
                "en": "Hello SOS!",
                "fr": "Bonjour SOS !",
                "pt": "Olá SOS!"
            };
            const whatsappText = whatsappTexts[language] || whatsappTexts["es"];
            whatsappLink.href = "https://api.whatsapp.com/send?phone=+50370384912&text=" + encodeURIComponent(whatsappText);
        }
    }

    // Change the language and update content dynamically without reloading
    function changeLanguage(selectorId) {
        const selector = document.getElementById(selectorId);
        const selectedLanguage = selector.value;

        // Store the selected language
        localStorage.setItem("selectedLang", selectedLanguage);

        // Immediately display content based on the selected language
        displayLanguageContent(selectedLanguage);
    }

    // Execute language determination and content display right away
    document.addEventListener("DOMContentLoaded", function () {
        // Determine language first before doing anything else
        const currentLanguage = getLanguage();

        // Immediately display the correct language content
        displayLanguageContent(currentLanguage);

        // Set the language selectors to the current language
        const mobileLanguageSelector = document.getElementById("mobile-language-selector");
        const desktopLanguageSelector = document.getElementById("language-selector");

        if (mobileLanguageSelector) {
            mobileLanguageSelector.value = currentLanguage;
            mobileLanguageSelector.addEventListener("change", function () {
                changeLanguage("mobile-language-selector");
            });
        }

        if (desktopLanguageSelector) {
            desktopLanguageSelector.value = currentLanguage;
            desktopLanguageSelector.addEventListener("change", function () {
                changeLanguage("language-selector");
            });
        }

        // Handle color selection from the dropdown
        const colorDropdownButton = document.getElementById("color-dropdown");
        const colorDropdownMenu = document.querySelector("#mobile-color-selector .dropdown-menu");

        if (colorDropdownButton) {
            colorDropdownButton.addEventListener("click", function () {
                colorDropdownMenu.classList.toggle("show");
            });
        }

        const colorMenuItems = document.querySelectorAll("#mobile-color-selector .dropdown-menu li");
        if (colorMenuItems) {
            colorMenuItems.forEach((item) => {
                item.addEventListener("click", function () {
                    const className = item.getAttribute("onclick").split("'")[1];
                    changeDocumentClass(className);
                });
            });
        }
    });
