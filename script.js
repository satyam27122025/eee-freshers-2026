document.addEventListener('DOMContentLoaded', () => {
    
    // --- Background Music (Ambient & Soothing) ---
    const bgMusic = document.getElementById('bg-music');
    if (bgMusic) {
        bgMusic.volume = 0.8; // Volume set to 80%
        
        const tryPlay = () => {
            bgMusic.play().catch(err => console.log("Autoplay blocked:", err));
        };

        // Attempt to play immediately
        tryPlay();
        
        // Also attempt on window load
        window.addEventListener('load', tryPlay);
        
        // Bind to all possible interactions to play as soon as the user does ANYTHING
        const interactionEvents = ['click', 'touchstart', 'keydown', 'mousemove', 'scroll', 'wheel'];
        
        const startOnInteraction = () => {
            bgMusic.play().then(() => {
                // Remove listeners once playback starts successfully
                interactionEvents.forEach(event => {
                    document.removeEventListener(event, startOnInteraction);
                    window.removeEventListener(event, startOnInteraction);
                });
            }).catch(e => {});
        };
        
        interactionEvents.forEach(event => {
            document.addEventListener(event, startOnInteraction);
            window.addEventListener(event, startOnInteraction);
        });
    }

    // --- Navbar Scroll Effect ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu Toggle ---
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    hamburger.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    });

    // --- Google Form Integration (Backend) ---
    const GOOGLE_FORM_ACTION_URL = "https://docs.google.com/forms/d/e/1FAIpQLSddUBBHdWheVoiRxCNlu3Y3Ymz7XIeUz2nGInkAYKoC_TSCCQ/formResponse";
    const ENTRY_NAME = "entry.1955380365"; // Entry ID for Name
    const ENTRY_ID = "entry.484319466";   // Entry ID for College ID
    const ENTRY_STATUS = "entry.544897314"; // Entry ID for Status ("Performing" or "Not Performing")
    const ENTRY_TYPE = "entry.1945194985"; // Entry ID for Type ("SOLO", "DUO", "GROUP", or "N/A")
    const ENTRY_DETAILS = "entry.744014716"; // Entry ID for Details (The massive text block with facts)

    window.submitToGoogleForm = function(name, collegeId, status, type, details) {
        if (GOOGLE_FORM_ACTION_URL.includes("YOUR_FORM_ID_HERE")) {
            console.log("⚠️ Google Form not configured yet. Data saved locally only.");
            return;
        }
        
        const formData = new URLSearchParams();
        formData.append(ENTRY_NAME, name);
        formData.append(ENTRY_ID, collegeId);
        formData.append(ENTRY_STATUS, status);
        formData.append(ENTRY_TYPE, type);
        formData.append(ENTRY_DETAILS, details);

        // Uses no-cors so it doesn't get blocked by the browser when deployed on Netlify
        fetch(GOOGLE_FORM_ACTION_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        }).then(() => {
            console.log("Successfully sent to Google Form!");
        }).catch(err => {
            console.error("Failed to send to Google Form:", err);
        });
    }

    // --- Attendance Registration ---
    const attendanceForm = document.getElementById('attendance-form');
    const fresherNameInput = document.getElementById('fresher-name');
    const fresherIdInput = document.getElementById('fresher-id');
    const fresherLikesInput = document.getElementById('fresher-likes');
    const fresherDislikesInput = document.getElementById('fresher-dislikes');
    const fresherAboutInput = document.getElementById('fresher-about');
    const fresherHobbiesInput = document.getElementById('fresher-hobbies');
    const fresherFunfactInput = document.getElementById('fresher-funfact');
    const idError = document.getElementById('id-error');
    const formContainer = document.getElementById('attendance-form-container');
    const successContainer = document.getElementById('attendance-success');
    const welcomeMessage = document.getElementById('welcome-message');

    // Check LocalStorage on load
    // Start fresh on every page reload as requested
    let userData = {
        name: "",
        collegeId: "",
        attendance: false
    };

    function validateStudentId(id) {
        // Accepts B3260XX or b3260XX
        const regex = /^[Bb]3260([0-9]{2})$/;
        const match = id.match(regex);
        if (!match) return false;
        
        const num = parseInt(match[1], 10);
        return num >= 1 && num <= 80;
    }

    attendanceForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = fresherNameInput.value.trim();
        const studentId = fresherIdInput.value.trim();
        const likes = fresherLikesInput.value.trim();
        const dislikes = fresherDislikesInput.value.trim();
        const about = fresherAboutInput.value.trim();
        const hobbies = fresherHobbiesInput.value.trim();
        const funfact = fresherFunfactInput.value.trim();
        const participating = document.querySelector('input[name="fresher-participating"]:checked')?.value;

        if (!validateStudentId(studentId)) {
            idError.classList.remove('hidden');
            return;
        }
        idError.classList.add('hidden');

        if (name && studentId) {
            userData.name = name;
            userData.collegeId = studentId;
            userData.attendance = true;
            
            saveData();
            showAttendanceSuccess(name);

            const details = `Likes: ${likes}\nDislikes: ${dislikes}\nAbout: ${about}\nHobbies: ${hobbies}\nFun Fact: ${funfact}`;

            // Send to Google Form based on participation choice
            const performanceStatus = (participating === 'Yes') ? "Performing" : "Not Performing";
            submitToGoogleForm(name, studentId, performanceStatus, "N/A", details);
        }
    });

    function showAttendanceSuccess(name) {
        formContainer.classList.add('hidden');
        successContainer.classList.remove('hidden');
        welcomeMessage.textContent = `WELCOME, ${name.toUpperCase()}! 🌸`;
    }

    function saveData() {
        localStorage.setItem('eee_freshers_2026_data', JSON.stringify(userData));
    }


    // --- Personalized Invitation Card Modal ---
    const modal = document.getElementById('invitation-modal');
    const closeBtn = document.querySelector('.close-modal');
    const downloadBtn = document.getElementById('download-btn');
    const shareBtn = document.getElementById('share-btn');
    const cardNameDisplay = document.getElementById('card-name-display');
    const captureCard = document.getElementById('capture-card');

    window.showPersonalizedInvitation = function() {
        if (!userData.name) {
            alert("Please register your attendance to generate a card.");
            return;
        }
        cardNameDisplay.textContent = userData.name;
        modal.classList.remove('hidden');
    }

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    // Download Image
    downloadBtn.addEventListener('click', () => {
        downloadBtn.textContent = 'GENERATING...';
        html2canvas(captureCard, {
            scale: 2,
            backgroundColor: '#8B0000',
            logging: false
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `EEE_Freshers_Invite_${userData.name.replace(/\s+/g, '_')}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            downloadBtn.textContent = 'DOWNLOAD INVITATION';
        }).catch(err => {
            console.error(err);
            downloadBtn.textContent = 'DOWNLOAD INVITATION';
            alert("Failed to generate image. Please try again.");
        });
    });

    // Share API
    shareBtn.addEventListener('click', async () => {
        if (navigator.share) {
            try {
                // Trying to share image directly if supported, else share text
                html2canvas(captureCard).then(async canvas => {
                    canvas.toBlob(async (blob) => {
                        const file = new File([blob], 'invitation.png', { type: 'image/png' });
                        const shareData = {
                            title: 'EEE Freshers 2026',
                            text: `I'm attending EEE Freshers 2026! Join the celebration on 03 Oct.`,
                            files: [file]
                        };
                        
                        if (navigator.canShare && navigator.canShare({ files: [file] })) {
                            await navigator.share(shareData);
                        } else {
                            await navigator.share({
                                title: 'EEE Freshers 2026',
                                text: `I'm attending EEE Freshers 2026! Join the celebration on 03 Oct.`
                            });
                        }
                    }, 'image/png');
                });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            alert("Web Share API not supported on this browser. Use the download button instead.");
        }
    });

});
