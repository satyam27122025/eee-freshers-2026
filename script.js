document.addEventListener('DOMContentLoaded', () => {
    
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
    const idError = document.getElementById('id-error');
    const formContainer = document.getElementById('attendance-form-container');
    const successContainer = document.getElementById('attendance-success');
    const welcomeMessage = document.getElementById('welcome-message');

    // Check LocalStorage on load
    // Start fresh on every page reload as requested
    let userData = {
        name: "",
        collegeId: "",
        attendance: false,
        performanceType: "",
        members: [],
        performance: ""
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

            // Send to Google Form as "Not Performing" (They can always register for performance later)
            submitToGoogleForm(name, studentId, "Not Performing", "N/A", "N/A");
        }
    });

    function showAttendanceSuccess(name) {
        formContainer.classList.add('hidden');
        successContainer.classList.remove('hidden');
        welcomeMessage.textContent = `WELCOME, ${name.toUpperCase()}! 🌸`;
    }

    // --- Performance Registration ---
    const performanceFormsContainer = document.getElementById('performance-forms');

    window.selectPerformanceType = function(type) {
        // Handle visual selection
        document.querySelectorAll('.perf-card').forEach(card => {
            card.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');

        // Check if attendance is registered first
        if (!userData.name) {
            alert("Please register your attendance first before signing up for a performance!");
            document.getElementById('attendance').scrollIntoView({behavior: 'smooth'});
            return;
        }

        userData.performanceType = type;
        renderPerformanceForm(type);
    }

    function renderPerformanceForm(type) {
        performanceFormsContainer.classList.remove('hidden');
        let html = '';

        if (type === 'solo') {
            html = `
                <div class="dynamic-form-section">
                    <form id="solo-form" onsubmit="handlePerformanceSubmit(event, 'solo')">
                        <div class="input-group">
                            <label>Performer Name</label>
                            <input type="text" id="solo-name" value="${userData.name}" required>
                        </div>
                        <div class="input-group">
                            <label>College ID</label>
                            <input type="text" id="solo-id" placeholder="Enter your College ID" required>
                        </div>
                        <div class="input-group">
                            <label>About You (Mandatory 5 facts: Likes, Dislikes, something about you)</label>
                            <input type="text" id="solo-about-1" placeholder="Fact 1..." required>
                            <input type="text" id="solo-about-2" placeholder="Fact 2..." style="margin-top: 10px;" required>
                            <input type="text" id="solo-about-3" placeholder="Fact 3..." style="margin-top: 10px;" required>
                            <input type="text" id="solo-about-4" placeholder="Fact 4..." style="margin-top: 10px;" required>
                            <input type="text" id="solo-about-5" placeholder="Fact 5..." style="margin-top: 10px;" required>
                        </div>
                        <div class="input-group">
                            <label>What are you going to perform?</label>
                            <textarea id="solo-desc" placeholder="Tell us what you're performing... (e.g. Dance, Singing, Stand-up comedy)" required></textarea>
                        </div>
                        <button type="submit" class="btn-primary">REGISTER PERFORMANCE</button>
                    </form>
                </div>
            `;
        } else if (type === 'duo') {
            html = `
                <div class="dynamic-form-section">
                    <form id="duo-form" onsubmit="handlePerformanceSubmit(event, 'duo')">
                        <h3>PERFORMER 1</h3>
                        <div class="input-group">
                            <label>Name</label>
                            <input type="text" id="duo-name-1" value="${userData.name}" required>
                        </div>
                        <div class="input-group">
                            <label>College ID</label>
                            <input type="text" id="duo-id-1" required>
                        </div>
                        <div class="input-group">
                            <label>About Performer 1 (5 mandatory facts)</label>
                            <input type="text" id="duo-about-1-1" placeholder="Fact 1..." required>
                            <input type="text" id="duo-about-1-2" placeholder="Fact 2..." style="margin-top: 10px;" required>
                            <input type="text" id="duo-about-1-3" placeholder="Fact 3..." style="margin-top: 10px;" required>
                            <input type="text" id="duo-about-1-4" placeholder="Fact 4..." style="margin-top: 10px;" required>
                            <input type="text" id="duo-about-1-5" placeholder="Fact 5..." style="margin-top: 10px;" required>
                        </div>
                        
                        <h3 class="mt-4">PERFORMER 2</h3>
                        <div class="input-group">
                            <label>Name</label>
                            <input type="text" id="duo-name-2" placeholder="Second performer's name" required>
                        </div>
                        <div class="input-group">
                            <label>College ID</label>
                            <input type="text" id="duo-id-2" required>
                        </div>
                        <div class="input-group">
                            <label>About Performer 2 (5 mandatory facts)</label>
                            <input type="text" id="duo-about-2-1" placeholder="Fact 1..." required>
                            <input type="text" id="duo-about-2-2" placeholder="Fact 2..." style="margin-top: 10px;" required>
                            <input type="text" id="duo-about-2-3" placeholder="Fact 3..." style="margin-top: 10px;" required>
                            <input type="text" id="duo-about-2-4" placeholder="Fact 4..." style="margin-top: 10px;" required>
                            <input type="text" id="duo-about-2-5" placeholder="Fact 5..." style="margin-top: 10px;" required>
                        </div>

                        <div class="input-group mt-4">
                            <label>What are you going to perform?</label>
                            <textarea id="duo-desc" placeholder="Tell us what you're performing..." required></textarea>
                        </div>
                        <button type="submit" class="btn-primary">REGISTER DUO PERFORMANCE</button>
                    </form>
                </div>
            `;
        } else if (type === 'group') {
            html = `
                <div class="dynamic-form-section">
                    <form id="group-form" onsubmit="handlePerformanceSubmit(event, 'group')">
                        <div class="input-group">
                            <label>HOW MANY MEMBERS ARE PERFORMING?</label>
                            <input type="number" id="group-count" min="3" max="20" placeholder="E.g. 6 Members" onchange="generateGroupMembers(this.value)" required>
                        </div>
                        
                        <div id="group-members-container"></div>

                        <div class="input-group mt-4">
                            <label>What are you going to perform?</label>
                            <textarea id="group-desc" placeholder="Describe your group performance..." required></textarea>
                        </div>
                        <button type="submit" class="btn-primary">REGISTER GROUP PERFORMANCE</button>
                    </form>
                </div>
            `;
        }

        performanceFormsContainer.innerHTML = html;
        performanceFormsContainer.scrollIntoView({behavior: 'smooth', block: 'start'});
    }

    window.generateGroupMembers = function(count) {
        const container = document.getElementById('group-members-container');
        if (!count || count < 3) {
            container.innerHTML = '';
            return;
        }

        let html = '';
        for (let i = 1; i <= count; i++) {
            html += `
                <div class="member-card">
                    <h4>MEMBER ${i}</h4>
                    <div class="input-group">
                        <label>Name</label>
                        <input type="text" id="group-name-${i}" ${i === 1 ? `value="${userData.name}"` : 'placeholder="Enter name"'} required>
                    </div>
                    <div class="input-group">
                        <label>College ID</label>
                        <input type="text" id="group-id-${i}" required>
                    </div>
                    <div class="input-group">
                        <label>About Member ${i} (5 mandatory facts)</label>
                        <input type="text" id="group-about-${i}-1" placeholder="Fact 1..." required>
                        <input type="text" id="group-about-${i}-2" placeholder="Fact 2..." style="margin-top: 10px;" required>
                        <input type="text" id="group-about-${i}-3" placeholder="Fact 3..." style="margin-top: 10px;" required>
                        <input type="text" id="group-about-${i}-4" placeholder="Fact 4..." style="margin-top: 10px;" required>
                        <input type="text" id="group-about-${i}-5" placeholder="Fact 5..." style="margin-top: 10px;" required>
                    </div>
                </div>
            `;
        }
        container.innerHTML = html;
    }

    window.handlePerformanceSubmit = function(e, type) {
        e.preventDefault();
        
        userData.performanceType = type;
        userData.members = [];

        if (type === 'solo') {
            userData.members.push({
                name: document.getElementById('solo-name').value,
                collegeId: document.getElementById('solo-id').value,
                about: [
                    document.getElementById('solo-about-1').value,
                    document.getElementById('solo-about-2').value,
                    document.getElementById('solo-about-3').value,
                    document.getElementById('solo-about-4').value,
                    document.getElementById('solo-about-5').value
                ]
            });
            userData.performance = document.getElementById('solo-desc').value;
        } else if (type === 'duo') {
            userData.members.push({
                name: document.getElementById('duo-name-1').value,
                collegeId: document.getElementById('duo-id-1').value,
                about: [
                    document.getElementById('duo-about-1-1').value,
                    document.getElementById('duo-about-1-2').value,
                    document.getElementById('duo-about-1-3').value,
                    document.getElementById('duo-about-1-4').value,
                    document.getElementById('duo-about-1-5').value
                ]
            });
            userData.members.push({
                name: document.getElementById('duo-name-2').value,
                collegeId: document.getElementById('duo-id-2').value,
                about: [
                    document.getElementById('duo-about-2-1').value,
                    document.getElementById('duo-about-2-2').value,
                    document.getElementById('duo-about-2-3').value,
                    document.getElementById('duo-about-2-4').value,
                    document.getElementById('duo-about-2-5').value
                ]
            });
            userData.performance = document.getElementById('duo-desc').value;
        } else if (type === 'group') {
            const count = document.getElementById('group-count').value;
            for (let i = 1; i <= count; i++) {
                userData.members.push({
                    name: document.getElementById(`group-name-${i}`).value,
                    collegeId: document.getElementById(`group-id-${i}`).value,
                    about: [
                        document.getElementById(`group-about-${i}-1`).value,
                        document.getElementById(`group-about-${i}-2`).value,
                        document.getElementById(`group-about-${i}-3`).value,
                        document.getElementById(`group-about-${i}-4`).value,
                        document.getElementById(`group-about-${i}-5`).value
                    ]
                });
            }
            userData.performance = document.getElementById('group-desc').value;
        }

        saveData();
        showPerformanceSuccess();

        // Format all the rich details into a single readable text block for the Google Form
        let detailsText = `Act Details: ${userData.performance}\n\n`;
        userData.members.forEach((m, idx) => {
            detailsText += `--- Performer ${idx + 1} ---\n`;
            detailsText += `Name: ${m.name}\n`;
            detailsText += `ID: ${m.collegeId}\n`;
            detailsText += `Fact 1: ${m.about[0]}\n`;
            detailsText += `Fact 2: ${m.about[1]}\n`;
            detailsText += `Fact 3: ${m.about[2]}\n`;
            detailsText += `Fact 4: ${m.about[3]}\n`;
            detailsText += `Fact 5: ${m.about[4]}\n\n`;
        });

        // Submit to Google Form
        submitToGoogleForm(
            userData.name, 
            userData.collegeId, 
            "Performing", 
            userData.performanceType.toUpperCase(), 
            detailsText
        );
    }

    function showPerformanceSuccess() {
        document.getElementById('performance-selection').classList.add('hidden');
        performanceFormsContainer.classList.add('hidden');
        
        const successSection = document.getElementById('performance-success');
        successSection.classList.remove('hidden');

        let summaryHtml = `
            <p><strong>Type:</strong> ${userData.performanceType.toUpperCase()}</p>
            <p><strong>Members:</strong> ${userData.members.length}</p>
            <p><strong>Act:</strong> ${userData.performance}</p>
        `;
        document.getElementById('performance-summary').innerHTML = summaryHtml;
    }

    window.resetPerformances = function() {
        document.getElementById('performance-success').classList.add('hidden');
        document.getElementById('performance-selection').classList.remove('hidden');
        document.querySelectorAll('.perf-card').forEach(c => c.classList.remove('selected'));
        performanceFormsContainer.innerHTML = '';
        performanceFormsContainer.classList.add('hidden');
        document.getElementById('invitation').scrollIntoView({behavior: 'smooth'});
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
