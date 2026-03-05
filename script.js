const NCEA_SUBJECTS = [
    "Religious Education", "English", "Media Studies", "Biology", 
    "Chemistry", "Physics", "Calculus", "Statistics", "Accounting", 
    "Economics", "Business Studies", "Classical Studies", "Geography", 
    "History", "Tourism", "Physical Education", "Health", "Science Extension", 
    "Dance", "Drama", "Performing Arts Technology", "Music", "Chinese", "French", 
    "Te Reo Māori", "Digital Technology", "Materials Technology", "Processing Technology", 
    "Art Design", "Art History", "Art Painting", "Art Photography"
]

let creditChart = null;

function goToDashboard() {
    window.location.href = "dashboard.html";
}

function goToSubjects() {
    window.location.href = "subjects.html";
}

function goToLogin() {
    window.location.href = "index.html";
}

function logout() {
    localStorage.removeItem('currentUser');
    goToLogin();
}

async function addCredit() {

    const subject = document.getElementById('subject-select').value;
    const credits = parseInt(document.getElementById('credit-amount').value);
    const grade = document.getElementById('grade-select').value;
    
    if (!subject || !credits) {
        alert('Please fill all fields');
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser.credits) {
        currentUser.credits = [];
    }
    
    currentUser.credits.push({
        subject: subject,
        credits: credits,
        grade: grade,
        date: new Date().toLocaleDateString()
    });
    
    await saveUserToFirebase(currentUser);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    hideAddCreditPopup();
    showSuccessPopup(credits, grade, subject);
    loadCredits(currentUser);
    loadSubjectsOnDashboard(currentUser);
}

function showSuccessPopup(credits, grade, subject) {
    const message = document.getElementById('success-message');
    message.textContent = `${credits} ${grade} ${subject} credits successfully added!`;
    
    const container = document.getElementById('confetti-container');
    container.innerHTML = '';
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confetti.style.width = Math.random() * 10 + 5 + 'px';
        confetti.style.height = confetti.style.width;
        container.appendChild(confetti);
    }
    
    document.getElementById('success-popup').style.display = 'flex';
}

function addAnotherCredit() {
    closeSuccessPopup();
    showAddCreditPopup();
}

function closeSuccessPopup() {
    document.getElementById('success-popup').style.display = 'none';
}

function populateSubjectDropdown() {
    const subjectSelect = document.getElementById('subject-select');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!subjectSelect || !currentUser || !currentUser.subjects) return;
    
    let options = '';
    currentUser.subjects.forEach(subject => {
        options += `<option value="${subject}">${subject}</option>`;
    });
    
    subjectSelect.innerHTML = options;
}

function showAddCreditPopup() {
    document.getElementById('add-credit-popup').style.display = 'flex';
    populateSubjectDropdown();
    document.getElementById('credit-amount').value = '4';
    document.getElementById('grade-select').selectedIndex = 0;
}

function hideAddCreditPopup() {
    document.getElementById('add-credit-popup').style.display = 'none';
}

function displaySubjects() {
    const container = document.getElementById('subjects');
    if (!container) return;
    
    let html = '';
    for (let subject of NCEA_SUBJECTS) {
        html += `<div class="subject-option" onclick="toggleSubject(this)">${subject}</div>`;
    }
    container.innerHTML = html;
}

function loadSubjectsOnDashboard(userData) {
    const subjectsDisplay = document.getElementById('subjects-display');
    
    if (!userData || !subjectsDisplay) return;
    
    if (userData.subjects && userData.subjects.length > 0) {
        let html = '';
        
        const subjectCredits = {};
        if (userData.credits && userData.credits.length > 0) {
            userData.credits.forEach(credit => {
                if (!subjectCredits[credit.subject]) {
                    subjectCredits[credit.subject] = 0;
                }
                subjectCredits[credit.subject] += credit.credits;
            });
        }
        
        userData.subjects.forEach(subject => {
            const credits = subjectCredits[subject] || 0;
            html += `<div class="subject-tag">${subject} <span class="subject-credit-count">${credits}</span></div>`;
        });
        
        subjectsDisplay.innerHTML = html;
    } else {
        subjectsDisplay.innerHTML = '<div class="subject-tag">No subjects selected</div>';
    }
}

function loadCredits(userData) {
    const currentCreditsSpan = document.getElementById('current-credits');
    const goalSpan = document.getElementById('goal-credits');
    const progressBar = document.getElementById('credit-progress');
    
    if (!userData || !currentCreditsSpan || !progressBar) return;
    
    if (!userData.credits) {
        userData.credits = [];
    }
    
    let total = 0;
    let literacyTotal = 0;
    let achievedTotal = 0;
    let meritTotal = 0;
    let excellenceTotal = 0;
    
    for (let i = 0; i < userData.credits.length; i++) {
        const credit = userData.credits[i];
        total += credit.credits;
        
        if (credit.grade === "Literacy") literacyTotal += credit.credits;
        else if (credit.grade === "Achieved") achievedTotal += credit.credits;
        else if (credit.grade === "Merit") meritTotal += credit.credits;
        else if (credit.grade === "Excellence") excellenceTotal += credit.credits;
    }
    
    const goal = 60;
    currentCreditsSpan.textContent = total;
    if (goalSpan) goalSpan.textContent = goal;
    
    const totalPercent = Math.min((total / goal) * 100, 100);
    progressBar.style.width = totalPercent + '%';
    
    if (total > 0) {
        let gradientStops = [];
        let currentPosition = 0;
        
        const literacyPercent = (literacyTotal / goal) * 100;
        const achievedPercent = (achievedTotal / goal) * 100;
        const meritPercent = (meritTotal / goal) * 100;
        const excellencePercent = (excellenceTotal / goal) * 100;
        
        if (literacyPercent > 0) {
            gradientStops.push(`#8B4513 ${currentPosition}% ${currentPosition + literacyPercent}%`);
            currentPosition += literacyPercent;
        }
        if (achievedPercent > 0) {
            gradientStops.push(`#2ecc71 ${currentPosition}% ${currentPosition + achievedPercent}%`);
            currentPosition += achievedPercent;
        }
        if (meritPercent > 0) {
            gradientStops.push(`#3498db ${currentPosition}% ${currentPosition + meritPercent}%`);
            currentPosition += meritPercent;
        }
        if (excellencePercent > 0) {
            gradientStops.push(`#f1c40f ${currentPosition}% ${currentPosition + excellencePercent}%`);
            currentPosition += excellencePercent;
        }
        
        progressBar.style.background = `linear-gradient(90deg, ${gradientStops.join(', ')})`;
    } else {
        progressBar.style.background = '#ecf0f1';
    }
    
    createOrUpdateChart(userData);

    document.getElementById('excellence-total').textContent = excellenceTotal;
    document.getElementById('merit-total').textContent = meritTotal;
    document.getElementById('achieved-total').textContent = achievedTotal;
    document.getElementById('total-credits').textContent = total;
}

function toggleSubject(element) {
    element.classList.toggle('selected');
}

function loadDashboardUser(userData) {
    const usernameDisplay = document.getElementById('username-display');
    
    if (userData && usernameDisplay) {
        const name = userData.username;
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
        usernameDisplay.textContent = formattedName;
    }
}

async function saveSubjectsAndGoToDashboard() {
    const selectedSubjects = [];
    const subjectElements = document.querySelectorAll('.subject-option.selected');
    
    subjectElements.forEach(el => {
        selectedSubjects.push(el.textContent);
    });
    
    if (selectedSubjects.length === 0) {
        alert('Please select at least one subject!');
        return;
    }
    
    const yearLevel = document.getElementById('year-level').value;
    const hasLiteracyNumeracy = document.getElementById('literacy-numeracy').checked;
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    let initialCredits = [];
    if (hasLiteracyNumeracy) {
        initialCredits.push({
            subject: "Literacy/Numeracy",
            credits: 20,
            grade: "Literacy",
            date: new Date().toLocaleDateString()
        });
    }
    
    currentUser.subjects = selectedSubjects;
    currentUser.yearLevel = yearLevel;
    currentUser.hasLiteracyNumeracy = hasLiteracyNumeracy;
    currentUser.credits = initialCredits;
    
    await saveUserToFirebase(currentUser);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    window.location.href = 'dashboard.html';
}

document.addEventListener('DOMContentLoaded', async function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isLoginPage = window.location.pathname.includes('index.html');
    const isSubjectsPage = window.location.pathname.includes('subjects.html');
    const isDashboardPage = window.location.pathname.includes('dashboard.html');
    
    loadSavedTheme();
    
    if (currentUser && isLoginPage) {
        const fbUser = await getUserFromFirebase(currentUser.username);
        if (fbUser) {
            localStorage.setItem('currentUser', JSON.stringify(fbUser));
            window.location.href = 'dashboard.html';
        } else {
            localStorage.removeItem('currentUser');
        }
        return;
    }
    
    if (!currentUser && (isDashboardPage || isSubjectsPage)) {
        window.location.href = 'index.html';
        return;
    }
    
    if (isDashboardPage && currentUser) {
        console.log('Loading dashboard for:', currentUser.username);
        
        let userData = currentUser;
        
        try {
            const fbUser = await getUserFromFirebase(currentUser.username);
            if (fbUser) {
                userData = fbUser;
                localStorage.setItem('currentUser', JSON.stringify(fbUser));
                console.log('Got user from Firebase:', fbUser);
            }
        } catch (error) {
            console.log('Using localStorage user data');
        }
        
        setTimeout(() => {
            loadDashboardUser(userData);
            loadSubjectsOnDashboard(userData);
            loadCredits(userData);
            createOrUpdateChart(userData);
        }, 100);
    }
    
    if (isSubjectsPage) {
        displaySubjects();
    }
});

async function signup() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        alert('Please enter a username and password!');
        return;
    }
    
    const existingUser = await getUserFromFirebase(username);
    
    if (existingUser) {
        alert('Username already exists! Please choose another one.');
        return;
    }
    
    const newUser = {
        username: username,
        password: password,
        createdAt: new Date().toISOString(),
        subjects: [],
        credits: [],
        creditGoal: 60,
        endorsementGoal: 'Excellence',
        yearLevel: '12',
        hasLiteracyNumeracy: false
    };
    
    await saveUserToFirebase(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    window.location.href = 'subjects.html';
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        alert('Please enter your username and password!');
        return;
    }
    
    const user = await getUserFromFirebase(username);
    
    if (!user) {
        alert('Username not found!');
        return;
    }
    
    if (user.password !== password) {
        alert('Incorrect password!');
        return;
    }
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'dashboard.html';
}

async function saveUserToFirebase(userData) {
    try {
        await db.collection('users').doc(userData.username).set(userData);
    } catch (error) {
        console.error('Error saving user:', error);
    }
}

async function getUserFromFirebase(username) {
    try {
        const doc = await db.collection('users').doc(username).get();
        return doc.exists ? doc.data() : null;
    } catch (error) {
        console.error('Error getting user:', error);
        return null;
    }
}

function createOrUpdateChart(userData) {
    const ctx = document.getElementById('credit-chart')?.getContext('2d');
    
    if (!userData || !userData.credits || !ctx) return;
    
    let achieved = 0;
    let merit = 0;
    let excellence = 0;
    let literacy = 0;
    
    userData.credits.forEach(credit => {
        if (credit.grade === "Achieved") achieved += credit.credits;
        else if (credit.grade === "Merit") merit += credit.credits;
        else if (credit.grade === "Excellence") excellence += credit.credits;
        else if (credit.grade === "Literacy") literacy += credit.credits;
    });
    
    if (creditChart) {
        creditChart.destroy();
    }
    
    creditChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Literacy', 'Achieved', 'Merit', 'Excellence'],
            datasets: [{
                data: [literacy, achieved, merit, excellence],
                backgroundColor: ['#8B4513', '#2ecc71', '#3498db', '#f1c40f'],
                borderWidth: 2,
                borderColor: 'white'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function showSubtractCreditPopup() {
    document.getElementById('subtract-credit-popup').style.display = 'flex';
    populateSubtractSubjectDropdown();
}

function hideSubtractCreditPopup() {
    document.getElementById('subtract-credit-popup').style.display = 'none';
}

function populateSubtractSubjectDropdown() {
    const subjectSelect = document.getElementById('subtract-subject-select');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!subjectSelect || !currentUser || !currentUser.credits) return;
    
    const subjectTotals = {};
    currentUser.credits.forEach(credit => {
        subjectTotals[credit.subject] = (subjectTotals[credit.subject] || 0) + credit.credits;
    });
    
    let options = '<option value="">Select a subject</option>';
    
    Object.keys(subjectTotals).sort().forEach(subject => {
        options += `<option value="${subject}">${subject} (${subjectTotals[subject]} credits)</option>`;
    });
    
    subjectSelect.innerHTML = options;
}

async function subtractCredit() {
    const subject = document.getElementById('subtract-subject-select').value;
    const creditsToRemove = parseInt(document.getElementById('subtract-credit-amount').value);
    
    if (!subject || !creditsToRemove) {
        alert('Please fill all fields');
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser.credits || currentUser.credits.length === 0) {
        alert('No credits to subtract!');
        return;
    }
    
    const totalSubjectCredits = currentUser.credits
        .filter(c => c.subject === subject)
        .reduce((sum, c) => sum + c.credits, 0);
    
    if (totalSubjectCredits < creditsToRemove) {
        alert(`You only have ${totalSubjectCredits} credits in ${subject}!`);
        return;
    }
    
    let remainingToRemove = creditsToRemove;
    const newCredits = [];
    
    for (let credit of currentUser.credits) {
        if (credit.subject === subject && remainingToRemove > 0) {
            if (credit.credits <= remainingToRemove) {
                remainingToRemove -= credit.credits;
            } else {
                credit.credits -= remainingToRemove;
                remainingToRemove = 0;
                newCredits.push(credit);
            }
        } else {
            newCredits.push(credit);
        }
    }
    
    currentUser.credits = newCredits;
    
    await saveUserToFirebase(currentUser);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    hideSubtractCreditPopup();
    loadCredits();
    createOrUpdateChart();
    loadSubjectsOnDashboard();
    
    showSubtractSuccessPopup(creditsToRemove, subject);
}

function showSubtractSuccessPopup(credits, subject) {
    const message = document.getElementById('success-message');
    message.textContent = `${credits} credits removed from ${subject}!`;
    
    const container = document.getElementById('confetti-container');
    container.innerHTML = '';
    
    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.background = `hsl(${Math.random() * 360}, 100%, 60%)`;
        container.appendChild(confetti);
    }
    
    document.getElementById('success-popup').style.display = 'flex';
    
    setTimeout(closeSuccessPopup, 2000);
}

function showSettings() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const savedColor1 = localStorage.getItem('gradientColor1') || '#9b59b6';
    const savedColor2 = localStorage.getItem('gradientColor2') || '#3498db';
    
    if (currentUser) {
        document.getElementById('settings-credit-goal').value = currentUser.creditGoal || 60;
        document.getElementById('settings-endorsement-goal').value = currentUser.endorsementGoal || 'Excellence';
    }
    
    document.getElementById('gradient-color1').value = savedColor1;
    document.getElementById('gradient-color2').value = savedColor2;
    document.getElementById('settings-popup').style.display = 'flex';
}

function closeSettings() {
    document.getElementById('settings-popup').style.display = 'none';
}

function applyGradient() {
    const color1 = document.getElementById('gradient-color1').value;
    const color2 = document.getElementById('gradient-color2').value;
    
    document.body.style.background = `linear-gradient(135deg, ${color1}, ${color2})`;
    
    localStorage.setItem('gradientColor1', color1);
    localStorage.setItem('gradientColor2', color2);
}

function setTheme(mode) {
    const navBar = document.querySelector('.nav-bar');
    const subjectsStrip = document.querySelector('.subjects-strip');
    const userSection = document.querySelector('.user-section');
    const settingsBtn = document.querySelector('.btn-settings');
    const progressContainer = document.querySelectorAll('.progress-container, .stats-container, .chart-container-big');
    const textElements = document.querySelectorAll('.stat-label, .progress-numbers, .subjects-label');
    const subjectTags = document.querySelectorAll('.subject-tag');
    
    if (mode === 'light') {

        if (navBar) {
            navBar.style.backgroundColor = '#ffffff';
            navBar.style.color = '#2c3e50';
            navBar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
        if (subjectsStrip) {
            subjectsStrip.style.backgroundColor = '#ffffff';
            subjectsStrip.style.color = '#2c3e50';
        }
        if (userSection) userSection.style.background = 'rgba(155, 89, 182, 0.1)';
        if (settingsBtn) settingsBtn.style.color = '#2c3e50';
        
        progressContainer.forEach(el => {
            if (el) {
                el.style.backgroundColor = '#ffffff';
                el.style.color = '#2c3e50';
            }
        });
        
        textElements.forEach(el => {
            if (el) el.style.color = '#2c3e50';
        });
        
        subjectTags.forEach(el => {
            if (el) {
                el.style.background = 'linear-gradient(135deg, #9b59b6, #3498db)';
                el.style.color = '#ffffff';
            }
        });
        

        if (!localStorage.getItem('gradientColor1')) {
            document.body.style.background = 'linear-gradient(135deg, #9b59b6 0%, #3498db 100%)';
        }
        
        localStorage.setItem('theme', 'light');
    } else {

        if (navBar) {
            navBar.style.backgroundColor = '#1a1a2e';
            navBar.style.color = '#ffffff';
            navBar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        }
        if (subjectsStrip) {
            subjectsStrip.style.backgroundColor = '#16213e';
            subjectsStrip.style.color = '#ecf0f1';
        }
        if (userSection) userSection.style.background = 'rgba(255,255,255,0.1)';
        if (settingsBtn) settingsBtn.style.color = '#ffffff';
        
        progressContainer.forEach(el => {
            if (el) {
                el.style.backgroundColor = '#0f3460';
                el.style.color = '#ffffff';
            }
        });
        
        textElements.forEach(el => {
            if (el) el.style.color = '#ecf0f1';
        });
        
        subjectTags.forEach(el => {
            if (el) {
                el.style.background = 'linear-gradient(135deg, #6c3483, #2874a6)';
                el.style.color = '#ffffff';
            }
        });
        
        if (!localStorage.getItem('gradientColor1')) {
            document.body.style.background = '#1a1a2e';
        }
        
        localStorage.setItem('theme', 'dark');
    }
}

function loadSavedTheme() {
    const savedColor1 = localStorage.getItem('gradientColor1');
    const savedColor2 = localStorage.getItem('gradientColor2');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedColor1 && savedColor2) {
        document.body.style.background = `linear-gradient(135deg, ${savedColor1}, ${savedColor2})`;
    } else {
        document.body.style.background = 'linear-gradient(135deg, #9b59b6 0%, #3498db 100%)';
    }
    
    if (savedTheme === 'dark') {
        setTheme('dark');
    } else {
        setTheme('light');
    }
}

async function saveSettings() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    currentUser.creditGoal = parseInt(document.getElementById('settings-credit-goal').value);
    currentUser.endorsementGoal = document.getElementById('settings-endorsement-goal').value;
    
    await saveUserToFirebase(currentUser);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    loadCredits();
    closeSettings();
}

if (window.location.pathname.includes('subjects.html')) {
    displaySubjects();
}