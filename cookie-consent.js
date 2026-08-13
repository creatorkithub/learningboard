(function () {
    // Check if consent has already been given or declined
    if (localStorage.getItem('privacyConsentStatus')) {
        return;
    }

    // Include the Outfit font dynamically for the banner if not already present
    // Assuming 'Outfit' is mostly loaded, but we'll use a fallback sans-serif stack as well.

    // Create the CSS styles for the banner
    const style = document.createElement('style');
    style.innerHTML = `
        #cookie-consent-banner {
            position: fixed;
            bottom: 25px;
            left: 20px;
            right: 20px;
            max-width: 600px;
            margin: 0 auto;
            background: rgba(11, 17, 32, 0.95);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 16px;
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            color: #e2e8f0;
            transform: translateY(150%);
            transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        #cookie-consent-banner.show {
            transform: translateY(0);
        }

        #cookie-consent-banner p {
            margin: 0;
            font-size: 0.95rem;
            line-height: 1.5;
            color: #cbd5e1;
        }

        #cookie-consent-banner a {
            color: #34d399;
            text-decoration: underline;
        }
        
        #cookie-consent-banner a:hover {
            color: #10b981;
        }

        .cookie-btn-group {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
        }

        .cookie-btn {
            padding: 10px 20px;
            border-radius: 8px;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: all 0.3s ease;
        }

        .cookie-btn-accept {
            background: linear-gradient(135deg, #34d399 0%, #3b82f6 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(52, 211, 153, 0.3);
        }

        .cookie-btn-accept:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(52, 211, 153, 0.4);
        }

        .cookie-btn-decline {
            background: rgba(255, 255, 255, 0.05);
            color: #94a3b8;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .cookie-btn-decline:hover {
            background: rgba(255, 255, 255, 0.1);
            color: #e2e8f0;
        }

        @media (max-width: 500px) {
            #cookie-consent-banner {
                bottom: 15px;
                left: 15px;
                right: 15px;
                padding: 20px;
            }
            .cookie-btn-group {
                flex-direction: column;
            }
            .cookie-btn {
                width: 100%;
                text-align: center;
            }
        }
    `;
    document.head.appendChild(style);

    // Create the banner container
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.innerHTML = `
        <p>We use cookies to analyze web traffic and improve your experience. By clicking "Accept", you agree to our <a href="/privacy/">Privacy Policy</a> and <a href="/terms/">Terms of Service</a>.</p>
        <div class="cookie-btn-group">
            <button class="cookie-btn cookie-btn-decline" id="cookie-btn-decline">Decline</button>
            <button class="cookie-btn cookie-btn-accept" id="cookie-btn-accept">Accept</button>
        </div>
    `;
    document.body.appendChild(banner);

    // Animate banner in
    setTimeout(() => {
        banner.classList.add('show');
    }, 500);

    // Handle Decline
    document.getElementById('cookie-btn-decline').addEventListener('click', () => {
        localStorage.setItem('privacyConsentStatus', 'declined');
        banner.classList.remove('show');
        setTimeout(() => banner.remove(), 600);
    });

    // Handle Accept
    document.getElementById('cookie-btn-accept').addEventListener('click', () => {
        localStorage.setItem('privacyConsentStatus', 'accepted');
        banner.classList.remove('show');
        setTimeout(() => banner.remove(), 600);
    });
})();
