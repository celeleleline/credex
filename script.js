// constant subjects

const NCEA_SUBJECTS = {
    year11: [
        "Science Extension", "Drama", "Dance", "Health", "Physical Education",
        "Art", "Music", "Digital Technology", "Frecnh", "Maori", "Chinese",
        "Materials Technology", "Processing Technology", "Religious Education",
        "English", "Mathematics", "Science", "Social Studies"
    ],
    year12: [
        "English", "Media Studies", "Biology", "Chemistry", "Physics", 
        "Calculus", "Statistics", "Accounting", "Economics", "Business Studies",
        "Classical Studies", "Geography", "History", "Tourism", "Physical Education",
        "Health", "Dance", "Drama", "Music", "Chinese", "French", "Te Reo Māori",
        "Digital Technology", "Materials Technology", "Processing Technology",
        "Art Design", "Art History", "Art Painting", "Art Photography", "Religious Education"
    ],
    year13: [
        "Religious Education", "English", "Media Studies", "Biology", 
        "Chemistry", "Physics", "Calculus", "Statistics", "Accounting", 
        "Economics", "Business Studies", "Classical Studies", "Geography", 
        "History", "Tourism", "Physical Education", "Health", 
        "Dance", "Drama", "Performing Arts Technology", "Music", "Chinese", "French", 
        "Te Reo Māori", "Digital Technology", "Materials Technology", "Processing Technology", 
        "Art Design", "Art History", "Art Painting", "Art Photography"
    ]
};

function filterSubjectsByYear() {
    const year = document.getElementById('year-level').value;
    const container = document.getElementById('subjects');
    
    let subjects = [];
    if (year === '11') subjects = NCEA_SUBJECTS.year11;
    else if (year === '12') subjects = NCEA_SUBJECTS.year12;
    else subjects = NCEA_SUBJECTS.year13;
    
    // Store current subjects for search
    window.currentSubjects = subjects;
    
    container.innerHTML = subjects.map(subject => 
        `<div class="subject-option" onclick="toggleSubject(this)">${subject}</div>`
    ).join('');
}

// search subjects function
function searchSubjects() {
    const searchTerm = document.getElementById('subject-search')?.value.toLowerCase() || '';
    const container = document.getElementById('subjects');
    const year = document.getElementById('year-level').value;
    
    let subjects = [];
    if (year === '11') subjects = NCEA_SUBJECTS.year11;
    else if (year === '12') subjects = NCEA_SUBJECTS.year12;
    else subjects = NCEA_SUBJECTS.year13;
    
    const filtered = subjects.filter(subject => 
        subject.toLowerCase().includes(searchTerm)
    );
    
    container.innerHTML = filtered.map(subject => 
        `<div class="subject-option" onclick="toggleSubject(this)">${subject}</div>`
    ).join('');
}

let creditChart = null;

// going to diff pages

function goToDashboard() { window.location.href = "dashboard.html"; }
function goToSubjects() { window.location.href = "subjects.html"; }
function goToLogin() { window.location.href = "index.html"; }

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('gradientColor1');
    localStorage.removeItem('gradientColor2');
    localStorage.removeItem('theme');
    document.body.style.background = 'linear-gradient(135deg, #68537b 0%, #4f5d80 100%)';
    goToLogin();
}

// whatever firebase is on

async function saveUserToFirebase(userData) {
    try {
        await db.collection('users').doc(userData.username).set(userData);
    } catch (error) { console.error('Error saving user:', error); }
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

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// login and signup pageeee

async function signup() {
    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;
    
    if (!username || !password) {
        alert('Please enter a username and password!');
        return;
    }
    
    try {
        if (await getUserFromFirebase(username)) {
            alert('Username already exists!');
            return;
        }
        
        const newUser = {
            username, password: await hashPassword(password),
            createdAt: new Date().toISOString(),
            subjects: [], credits: [], creditGoal: 80,
            endorsementGoal: 'Excellence', yearLevel: '12',
            hasLiteracyNumeracy: false
        };
        
        await saveUserToFirebase(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        window.location.href = 'subjects.html';
    } catch (error) {
        alert('Signup error: ' + error.message);
    }
}

async function login() {
    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;
    
    if (!username || !password) {
        alert('Please enter your username and password!');
        return;
    }
    
    const user = await getUserFromFirebase(username);
    if (!user) { alert('Username not found!'); return; }
    
    if (user.password !== await hashPassword(password)) {
        alert('Incorrect password!');
        return;
    }
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'dashboard.html';
}

// subjects page stuff

function displaySubjects() {
    const year = document.getElementById('year-level')?.value || '13';
    filterSubjectsByYear();
    
    // add search event listener
    const searchInput = document.getElementById('subject-search');
    if (searchInput) {
        searchInput.addEventListener('input', searchSubjects);
    }
}

function toggleSubject(element) {
    element.classList.toggle('selected');
}

async function saveSubjectsAndGoToDashboard() {
    const selectedSubjects = [...document.querySelectorAll('.subject-option.selected')].map(el => el.textContent);
    
    if (selectedSubjects.length === 0) {
        alert('Please select at least one subject!');
        return;
    }
    
    const yearLevel = document.getElementById('year-level').value;
    const hasLiteracyNumeracy = document.getElementById('literacy-numeracy').checked;
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    currentUser.subjects = selectedSubjects;
    currentUser.yearLevel = yearLevel;
    currentUser.hasLiteracyNumeracy = hasLiteracyNumeracy;
    currentUser.credits = hasLiteracyNumeracy ? [{
        subject: "Literacy/Numeracy", credits: 20, grade: "Literacy",
        date: new Date().toLocaleDateString()
    }] : [];
    
    await saveUserToFirebase(currentUser);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    window.location.href = 'dashboard.html';
}

// loading dashboard stuff

function loadDashboardUser(userData) {
    const usernameDisplay = document.getElementById('username-display');
    if (userData && usernameDisplay) {
        usernameDisplay.textContent = userData.username.charAt(0).toUpperCase() + userData.username.slice(1);
    }
}

function loadSubjectsOnDashboard(userData) {
    const subjectsDisplay = document.getElementById('subjects-display');
    if (!userData || !subjectsDisplay) return;
    
    if (userData.subjects?.length) {
        const subjectCredits = {};
        userData.credits?.forEach(credit => {
            subjectCredits[credit.subject] = (subjectCredits[credit.subject] || 0) + credit.credits;
        });
        
        subjectsDisplay.innerHTML = userData.subjects.map(subject => 
            `<div class="subject-tag">${subject} <span class="subject-credit-count">${subjectCredits[subject] || 0}</span></div>`
        ).join('');
    } else {
        subjectsDisplay.innerHTML = '<div class="subject-tag">No subjects selected</div>';
    }
}

function loadCredits(userData) {
    const elements = {
        current: document.getElementById('current-credits'),
        goal: document.getElementById('goal-credits'),
        progress: document.getElementById('credit-progress'),
        pass: document.getElementById('pass-status'),
        endorse: document.getElementById('endorsement-status'),
        excellence: document.getElementById('excellence-total'),
        merit: document.getElementById('merit-total'),
        achieved: document.getElementById('achieved-total'),
        total: document.getElementById('total-credits')
    };
    
    if (!userData || !elements.current || !elements.progress) return;
    
    userData.credits = userData.credits || [];
    
    let totals = { total:0, literacy:0, achieved:0, merit:0, excellence:0 };
    
    userData.credits.forEach(credit => {
        totals.total += credit.credits;
        totals[credit.grade.toLowerCase()] += credit.credits;
    });
    
    const goal = 80;
    elements.current.textContent = totals.total;
    if (elements.goal) elements.goal.textContent = goal;
    
    elements.progress.style.width = Math.min((totals.total / goal) * 100, 100) + '%';
    
    if (totals.total > 0) {
        let stops = [], pos = 0;
        [
            { val: totals.literacy, color: '#8B4513' },
            { val: totals.achieved, color: '#2ecc71' },
            { val: totals.merit, color: '#3498db' },
            { val: totals.excellence, color: '#f1c40f' }
        ].forEach(({val, color}) => {
            if (val > 0) {
                let percent = (val / goal) * 100;
                stops.push(`${color} ${pos}% ${pos + percent}%`);
                pos += percent;
            }
        });
        elements.progress.style.background = `linear-gradient(90deg, ${stops.join(', ')})`;
    } else {
        elements.progress.style.background = '#ecf0f1';
    }
    
    if (elements.pass) {
        elements.pass.textContent = `${Math.max(0, goal - totals.total)} credits to pass the year`;
    }
    
    if (elements.endorse && userData.endorsementGoal) {
        let meritExcellence = userData.credits.reduce((sum, c) => 
            sum + (c.grade === "Merit" || c.grade === "Excellence" ? c.credits : 0), 0);
        
        if (userData.endorsementGoal === 'Excellence') {
            let excellence = userData.credits.reduce((sum, c) => 
                sum + (c.grade === "Excellence" ? c.credits : 0), 0);
            elements.endorse.textContent = `${Math.max(0, 50 - excellence)} credits until Excellence endorsement`;
        } else {
            elements.endorse.textContent = `${Math.max(0, 50 - meritExcellence)} credits until ${userData.endorsementGoal} endorsement`;
        }
    }
    
    if (elements.excellence) elements.excellence.textContent = totals.excellence;
    if (elements.merit) elements.merit.textContent = totals.merit;
    if (elements.achieved) elements.achieved.textContent = totals.achieved;
    if (elements.total) elements.total.textContent = totals.total;
    
    createOrUpdateChart(userData);
}

// THAT DAMN PIE

function createOrUpdateChart(userData) {
    const ctx = document.getElementById('credit-chart')?.getContext('2d');
    if (!userData?.credits || !ctx) return;
    
    let counts = { achieved:0, merit:0, excellence:0, literacy:0 };
    
    userData.credits.forEach(credit => {
        counts[credit.grade.toLowerCase()] += credit.credits;
    });
    
    if (creditChart) creditChart.destroy();
    
creditChart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ['Literacy', 'Achieved', 'Merit', 'Excellence'],
        datasets: [{
            data: [counts.literacy, counts.achieved, counts.merit, counts.excellence],
            backgroundColor: ['#8B4513', '#2ecc71', '#3498db', '#f1c40f'],
            borderWidth: 2, borderColor: 'white'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { 
            legend: { 
                position: 'bottom',
                labels: { font: { size: window.innerWidth < 768 ? 10 : 12 } }
            }
        }
    }
})};

// adding or subtracting credits

function populateSubjectDropdown() {
    const select = document.getElementById('subject-select');
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (select && user?.subjects) {
        select.innerHTML = user.subjects.map(s => `<option value="${s}">${s}</option>`).join('');
    }
}

function showAddCreditPopup() {
    document.getElementById('add-credit-popup').style.display = 'flex';
    populateSubjectDropdown();
    document.getElementById('credit-amount').value = '4';
    document.getElementById('grade-select').selectedIndex = 0;
}

function hideAddCreditPopup() { document.getElementById('add-credit-popup').style.display = 'none'; }

async function addCredit() {
    const subject = document.getElementById('subject-select').value;
    const credits = parseInt(document.getElementById('credit-amount').value);
    const grade = document.getElementById('grade-select').value;
    
    if (!subject || !credits) { alert('Please fill all fields'); return; }
    
    const user = JSON.parse(localStorage.getItem('currentUser'));
    user.credits = user.credits || [];
    user.credits.push({ subject, credits, grade, date: new Date().toLocaleDateString() });
    
    await saveUserToFirebase(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    hideAddCreditPopup();
    showSuccessPopup(credits, grade, subject);
    loadCredits(user);
    loadSubjectsOnDashboard(user);
}

function showSubtractCreditPopup() {
    document.getElementById('subtract-credit-popup').style.display = 'flex';
    populateSubtractSubjectDropdown();
}

function hideSubtractCreditPopup() { document.getElementById('subtract-credit-popup').style.display = 'none'; }

function populateSubtractSubjectDropdown() {
    const select = document.getElementById('subtract-subject-select');
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!select || !user?.credits) return;
    
    let totals = {};
    user.credits.forEach(c => totals[c.subject] = (totals[c.subject] || 0) + c.credits);
    
    select.innerHTML = '<option value="">Select a subject</option>' + 
        Object.keys(totals).sort().map(s => `<option value="${s}">${s} (${totals[s]} credits)</option>`).join('');
}

async function subtractCredit() {
    const subject = document.getElementById('subtract-subject-select').value;
    const remove = parseInt(document.getElementById('subtract-credit-amount').value);
    
    if (!subject || !remove) { alert('Please fill all fields'); return; }
    
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user.credits?.length) { alert('No credits to subtract!'); return; }
    
    let total = user.credits.filter(c => c.subject === subject).reduce((s, c) => s + c.credits, 0);
    if (total < remove) { alert(`Only have ${total} credits in ${subject}!`); return; }
    
    let remaining = remove, newCredits = [];
    for (let credit of user.credits) {
        if (credit.subject === subject && remaining > 0) {
            if (credit.credits <= remaining) remaining -= credit.credits;
            else { credit.credits -= remaining; remaining = 0; newCredits.push(credit); }
        } else newCredits.push(credit);
    }
    
    user.credits = newCredits;
    await saveUserToFirebase(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    hideSubtractCreditPopup();
    loadCredits(user);
    createOrUpdateChart(user);
    loadSubjectsOnDashboard(user);
    showSubtractSuccessPopup(remove, subject);
}

// THE DAMN CONFETTI

function showSuccessPopup(credits, grade, subject) {
    document.getElementById('success-message').textContent = `${credits} ${grade} ${subject} credits successfully added!`;
    createConfetti(50);
    document.getElementById('success-popup').style.display = 'flex';
}

function showSubtractSuccessPopup(credits, subject) {
    document.getElementById('success-message').textContent = `${credits} credits removed from ${subject}!`;
    createConfetti(20);
    document.getElementById('success-popup').style.display = 'flex';
    setTimeout(closeSuccessPopup, 2000);
}

function createConfetti(count) {
    const container = document.getElementById('confetti-container');
    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
        let conf = document.createElement('div');
        conf.className = 'confetti';
        conf.style.left = Math.random() * 100 + '%';
        conf.style.animationDelay = Math.random() * 0.5 + 's';
        conf.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
        conf.style.width = conf.style.height = Math.random() * 10 + 5 + 'px';
        container.appendChild(conf);
    }
}

function addAnotherCredit() { closeSuccessPopup(); showAddCreditPopup(); }
function closeSuccessPopup() { document.getElementById('success-popup').style.display = 'none'; }

// THE DAMN SETTINGS BUTTON

function showSettings() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const c1 = localStorage.getItem('gradientColor1') || '#68537b';
    const c2 = localStorage.getItem('gradientColor2') || '#4f5d80';
    
    if (user) {
        let goal = document.getElementById('settings-endorsement-goal');
        if (goal) goal.value = user.endorsementGoal || 'Excellence';
    }
    
    let color1 = document.getElementById('gradient-color1');
    let color2 = document.getElementById('gradient-color2');
    if (color1) color1.value = c1;
    if (color2) color2.value = c2;
    
    loadSubjectsInSettings();
    document.getElementById('settings-popup').style.display = 'flex';
}

function closeSettings() { document.getElementById('settings-popup').style.display = 'none'; }

function saveAndCloseSettings() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const c1 = document.getElementById('gradient-color1').value;
    const c2 = document.getElementById('gradient-color2').value;
    
    document.body.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
    localStorage.setItem('gradientColor1', c1);
    localStorage.setItem('gradientColor2', c2);
    
    if (user) {
        user.endorsementGoal = document.getElementById('settings-endorsement-goal').value;
        saveUserToFirebase(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        loadCredits(user);
    }
    
    document.getElementById('settings-popup').style.display = 'none';
}

function loadSubjectsInSettings() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const container = document.getElementById('settings-subjects-list');
    const select = document.getElementById('settings-subject-select');
    if (!user || !container || !select) return;
    
    container.innerHTML = user.subjects?.length ? user.subjects.map(s => 
        `<div style="display:flex;justify-content:space-between;align-items:center;padding:5px;margin:3px 0;background:#f8f9fa;border-radius:5px;">
            <span>${s}</span>
            <button onclick="removeSubject('${s}')" style="background:#e74c3c;color:white;border:none;border-radius:5px;width:25px;height:25px;cursor:pointer;">✕</button>
        </div>`
    ).join('') : '<p style="color:#7f8c8d;text-align:center;">No subjects selected</p>';
    
    // fix: get all subjects from all years for settings
    const allSubjects = [...NCEA_SUBJECTS.year11, ...NCEA_SUBJECTS.year12, ...NCEA_SUBJECTS.year13];
    const uniqueSubjects = [...new Set(allSubjects)];
    
    select.innerHTML = '<option value="">Add subject...</option>' + 
        uniqueSubjects.filter(s => !user.subjects?.includes(s))
            .map(s => `<option value="${s}">${s}</option>`).join('');
}

async function addSubjectFromSettings() {
    const subject = document.getElementById('settings-subject-select').value;
    if (!subject) { alert('Select a subject to add'); return; }
    
    const user = JSON.parse(localStorage.getItem('currentUser'));
    user.subjects = user.subjects || [];
    if (!user.subjects.includes(subject)) {
        user.subjects.push(subject);
        await saveUserToFirebase(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        loadSubjectsInSettings();
        loadSubjectsOnDashboard(user);
    }
}

async function removeSubject(subject) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user.subjects) {
        user.subjects = user.subjects.filter(s => s !== subject);
        await saveUserToFirebase(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        loadSubjectsInSettings();
        loadSubjectsOnDashboard(user);
    }
}

// rank score

function loadRankScore() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user?.credits) return;
    
    let ex = 0, me = 0, ac = 0;
    user.credits.forEach(c => {
        if (c.grade === "Excellence") ex += c.credits;
        else if (c.grade === "Merit") me += c.credits;
        else if (c.grade === "Achieved") ac += c.credits;
    });
    
    let exPts = ex * 4, mePts = me * 3, acPts = ac * 2, total = exPts + mePts + acPts;
    
    let els = {
        num: document.querySelector('.rank-number'),
        ex: document.getElementById('rank-excellence'),
        me: document.getElementById('rank-merit'),
        ac: document.getElementById('rank-achieved'),
        exPts: document.getElementById('excellence-points'),
        mePts: document.getElementById('merit-points'),
        acPts: document.getElementById('achieved-points'),
        total: document.getElementById('rank-total')
    };
    
    if (els.num) els.num.textContent = total;
    if (els.ex) els.ex.textContent = ex;
    if (els.me) els.me.textContent = me;
    if (els.ac) els.ac.textContent = ac;
    if (els.exPts) els.exPts.textContent = exPts;
    if (els.mePts) els.mePts.textContent = mePts;
    if (els.acPts) els.acPts.textContent = acPts;
    if (els.total) els.total.textContent = total;
}

// help, forgot password, whatever else

function showHelp() {
    const content = document.getElementById('help-content');
    const path = window.location.pathname;
    
    let html = '';
    if (path.includes('index.html')) {
        html = '<h3>Login Page</h3><ul><li><strong>Login:</strong> Enter username/password, click Login</li><li><strong>Sign Up:</strong> First time? Click Sign Up</li><li><strong>Forgot Password:</strong> Click the link (too bad!)</li></ul>';
    } else if (path.includes('subjects.html')) {
        html = '<h3>Subject Selection</h3><ul><li><strong>Year Level:</strong> Select your year</li><li><strong>Search:</strong> Type to filter subjects</li><li><strong>Literacy Credits:</strong> Check if you have 20 already</li><li><strong>Choose Subjects:</strong> Click subjects to select</li><li><strong>Start Tracking:</strong> Click button when done</li></ul>';
    } else if (path.includes('dashboard.html')) {
        html = '<h3>Dashboard</h3><ul><li><strong>Progress Bar:</strong> Shows total credits (80 to pass)</li><li><strong>Stats:</strong> Breakdown by grade</li><li><strong>Pie Chart:</strong> Visual representation</li><li><strong>Add Credits:</strong> + button</li><li><strong>Subtract Credits:</strong> - button</li><li><strong>Settings:</strong> Gear icon to customize</li></ul>';
    } else if (path.includes('rank_score.html')) {
        html = '<h3>Rank Score</h3><ul><li><strong>Rank Score:</strong> Calculated from your credits</li><li><strong>Excellence = 4 points</strong></li><li><strong>Merit = 3 points</strong></li><li><strong>Achieved = 2 points</strong></li></ul>';
    }
    
    content.innerHTML = html;
    document.getElementById('help-popup').style.display = 'flex';
}

function closeHelp() { document.getElementById('help-popup').style.display = 'none'; }
function showForgotPassword() { document.getElementById('forgot-password-popup').style.display = 'flex'; }
function closeForgotPassword() { document.getElementById('forgot-password-popup').style.display = 'none'; }

// stuff to make sure it works

// stuff to make sure it works

document.addEventListener('DOMContentLoaded', async function() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const path = window.location.pathname;
    
    // LOAD GRADIENT COLORS (ADD THIS BACK)
    const savedC1 = localStorage.getItem('gradientColor1');
    const savedC2 = localStorage.getItem('gradientColor2');
    if (savedC1 && savedC2) {
        document.body.style.background = `linear-gradient(135deg, ${savedC1}, ${savedC2})`;
    } else {
        document.body.style.background = 'linear-gradient(135deg, #68537b 0%, #4f5d80 100%)';
    }
    
    if (path.includes('index.html') && user) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    if ((path.includes('dashboard.html') || path.includes('subjects.html')) && !user) {
        window.location.href = 'index.html';
        return;
    }
    
    if (path.includes('dashboard.html') && user) {
        try {
            let fbUser = await getUserFromFirebase(user.username);
            if (fbUser) {
                localStorage.setItem('currentUser', JSON.stringify(fbUser));
                loadDashboardUser(fbUser);
                loadSubjectsOnDashboard(fbUser);
                loadCredits(fbUser);
                createOrUpdateChart(fbUser);
            } else {
                loadDashboardUser(user);
                loadSubjectsOnDashboard(user);
                loadCredits(user);
                createOrUpdateChart(user);
            }
        } catch {
            loadDashboardUser(user);
            loadSubjectsOnDashboard(user);
            loadCredits(user);
            createOrUpdateChart(user);
        }
    }
    
    if (path.includes('subjects.html')) displaySubjects();
    if (path.includes('rank_score.html')) loadRankScore();
});