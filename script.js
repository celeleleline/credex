const NCEA_SUBJECTS = [
    "Digital Technology", "Calculus", "Physics", "Chemistry", "English", "Religious Education",
    "Rando  shit", "Testing", "Testing2", "Testing3"
]

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
  loadCredits();
  loadSubjectsOnDashboard();
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

function loadSubjectsOnDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const subjectsDisplay = document.getElementById('subjects-display');
    
    if (!currentUser || !subjectsDisplay) return;
    
    if (currentUser.subjects && currentUser.subjects.length > 0) {
        let html = '';
        currentUser.subjects.forEach(subject => {
            html += `<div class="subject-item">${subject}</div>`;
        });
        subjectsDisplay.innerHTML = html;
    } else {
        subjectsDisplay.innerHTML = '<p>No subjects selected yet.</p>';
    }
}

function loadCredits() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentCreditsSpan = document.getElementById('current-credits');
    const goalSpan = document.getElementById('goal-credits');
    const progressBar = document.getElementById('credit-progress');
    
    if (!currentUser || !currentCreditsSpan || !progressBar) return;
    
    if (!currentUser.credits) {
        currentUser.credits = [];
    }

    let total = 0;
    let literacyTotal = 0;
    let achievedTotal = 0;
    let meritTotal = 0;
    let excellenceTotal = 0;
    
    for (let i = 0; i < currentUser.credits.length; i++) {
        const credit = currentUser.credits[i];
        total += credit.credits;
        
        if (credit.grade === "Literacy") literacyTotal += credit.credits;
        else if (credit.grade === "Achieved") achievedTotal += credit.credits;
        else if (credit.grade === "Merit") meritTotal += credit.credits;
        else if (credit.grade === "Excellence") excellenceTotal += credit.credits;
    }
    
    const goal = 80;
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
    
    const allUsers = JSON.parse(localStorage.getItem('allUsers') || '{}');
    allUsers[currentUser.username] = currentUser;
    localStorage.setItem('allUsers', JSON.stringify(allUsers));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

function toggleSubject(element) {
    element.classList.toggle('selected');
}

function loadDashboardUser() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const usernameDisplay = document.getElementById('username-display');
    
    if (currentUser && usernameDisplay) {
        usernameDisplay.textContent = currentUser.username;
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

if (window.location.pathname.includes('subjects.html')) {
    displaySubjects();
}

document.addEventListener('DOMContentLoaded', async function() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const isLoginPage = window.location.pathname.includes('index.html');
  const isSubjectsPage = window.location.pathname.includes('subjects.html');
  const isDashboardPage = window.location.pathname.includes('dashboard.html');
  
  if (currentUser && isLoginPage) {
    const fbUser = await getUserFromFirebase(currentUser.username);
    if (fbUser) {
      window.location.href = 'dashboard.html';
    } else {
      localStorage.removeItem('currentUser');
    }
  }
  
  if (!currentUser && (isDashboardPage || isSubjectsPage)) {
    window.location.href = 'index.html';
  }
  
  if (isDashboardPage && currentUser) {
    const fbUser = await getUserFromFirebase(currentUser.username);
    if (fbUser) {
      localStorage.setItem('currentUser', JSON.stringify(fbUser));
      loadDashboardUser();
      loadSubjectsOnDashboard();
      loadCredits();
    }
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
    yearLevel: '13',
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
    console.log('User saved to Firebase');
  } catch (error) {
    console.error('Error saving user:', error);
  }
}

async function getUserFromFirebase(username) {
  try {
    const doc = await db.collection('users').doc(username).get();
    if (doc.exists) {
      return doc.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

async function getAllUsers() {
  try {
    const snapshot = await db.collection('users').get();
    const users = {};
    snapshot.forEach(doc => {
      users[doc.id] = doc.data();
    });
    return users;
  } catch (error) {
    console.error('Error getting users:', error);
    return {};
  }
}