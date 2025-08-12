const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxcBlqNn0w8wnCnVV7SlOce-rsKAnpW8LDgjud-R6LVe9WgtBnYr1HVSK0I4zmZWkJ2/exec";

// --- אלמנטים מה-DOM ---
const logForm = document.getElementById('log-form');
const clientNameInput = document.getElementById('client-name');
const prefixSelect = document.getElementById('phone-prefix');
const suffixInput = document.getElementById('phone-suffix');
const statusDisplay = document.getElementById('status-display');
const approvalStatusSpan = document.getElementById('approval-status');
const approvalEndDateSpan = document.getElementById('approval-end-date');
const submitBtn = document.getElementById('submit-btn');
const namesDatalist = document.getElementById('names-list'); // רשימת שמות
const idsDatalist = document.getElementById('ids-list');   // רשימת מזהים
const checkBtn = document.getElementById('check-approval-btn');

let allClientsData = [];

// --- טעינת נתונים ראשונית ---
document.addEventListener('DOMContentLoaded', () => {
    fetch(WEB_APP_URL)
        .then(res => res.json())
        .then(response => {
            if (response.data) {
                allClientsData = response.data;
                populateDatalists(allClientsData); // קריאה לפונקציה החדשה
            }
        }).catch(err => console.error("Error fetching initial data:", err));
});

// --- פונקציה למילוי שתי הרשימות ---
function populateDatalists(clients) {
    namesDatalist.innerHTML = '';
    idsDatalist.innerHTML = '';
    clients.forEach(client => {
        const clientId = client[0];
        const clientName = client[1];
        
        // הוסף שם לרשימת השמות
        const nameOption = document.createElement('option');
        nameOption.value = clientName;
        namesDatalist.appendChild(nameOption);
        
        // הוסף מזהה לרשימת המזהים
        const idOption = document.createElement('option');
        idOption.value = clientId;
        idsDatalist.appendChild(idOption);
    });
}

// --- פונקציית מילוי אוטומטי ---
function autofillClientData(value, fieldType) {
    let client;
    if (fieldType === 'name') {
        client = allClientsData.find(c => String(c[1]) === value);
    } else { // fieldType === 'id'
        client = allClientsData.find(c => String(c[0]) === value);
    }

    if (client) {
        const clientId = String(client[0]);
        const clientName = client[1];
        
        clientNameInput.value = clientName;
        
        const phoneParts = clientId.split('-');
        if (phoneParts.length === 2 && !isNaN(phoneParts[1])) {
            prefixSelect.value = phoneParts[0];
            suffixInput.value = phoneParts[1];
        } else {
            prefixSelect.value = 'אחר';
            suffixInput.value = clientId;
        }
    }
}

// --- האזנות ---
checkBtn.addEventListener('click', checkApproval);

// האזנה לבחירת שם מהרשימה
clientNameInput.addEventListener('input', (e) => autofillClientData(e.target.value, 'name'));

// האזנה לבחירת מזהה מהרשימה
suffixInput.addEventListener('input', (e) => {
    const prefix = prefixSelect.value;
    if (prefix === 'אחר') {
        autofillClientData(e.target.value, 'id');
    } else {
        const fullId = `${prefix}-${e.target.value}`;
        autofillClientData(fullId, 'id');
    }
});


// --- פונקציית בדיקת האישור (מופעלת רק בלחיצת כפתור) ---
function checkApproval() {
    // ... (הקוד כאן נשאר ללא שינוי) ...
    const prefix = prefixSelect.value;
    const suffix = suffixInput.value;
    let clientId = '';

    if (prefix === 'אחר') {
        clientId = suffix;
    } else if (suffix.length > 0) {
        clientId = `${prefix}-${suffix}`;
    } else {
        alert("אנא הזן מספר מזהה.");
        return;
    }

    const client = allClientsData.find(c => String(c[0]) === clientId);
    statusDisplay.classList.add('visible');

    if (client) {
        const approvalType = client[3];
        const startDate = client[4] ? new Date(client[4]) : null;
        const endDate = client[5] ? new Date(client[5]) : null;
        const today = new Date();
        today.setHours(0,0,0,0);

        if (startDate && endDate && today >= startDate && today <= endDate) {
            statusDisplay.className = 'visible approved';
            approvalStatusSpan.textContent = approvalType;
            approvalEndDateSpan.textContent = endDate.toLocaleDateString('he-IL');
        } else {
            statusDisplay.className = 'visible not-approved';
            approvalStatusSpan.textContent = "לא בתוקף";
            approvalEndDateSpan.textContent = '---';
        }
    } else {
        statusDisplay.className = 'visible not-approved';
        approvalStatusSpan.textContent = 'לא נמצא במאגר';
        approvalEndDateSpan.textContent = '---';
    }
}

// --- שליחת טופס רישום כניסה/יציאה (ללא שינוי) ---
logForm.addEventListener('submit', (e) => {
    // ... (הקוד כאן נשאר ללא שינוי) ...
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerText = "רושם...";
    const prefix = prefixSelect.value;
    const suffix = suffixInput.value;
    let clientId = (prefix === 'אחר') ? suffix : `${prefix}-${suffix}`;
    const formData = {
        requestType: 'logEntry',
        action: document.querySelector('input[name="action"]:checked').value,
        clientName: clientNameInput.value,
        clientId: clientId
    };
    fetch(WEB_APP_URL, {
        method: 'POST',
        body: JSON.stringify(formData)
    })
    .then(res => res.json())
    .then(result => {
        if (result.success) {
            alert('הרישום בוצע בהצלחה!');
            logForm.reset();
            statusDisplay.classList.remove('visible', 'approved', 'not-approved');
        } else {
            throw new Error(result.error);
        }
    })
    .catch(err => alert(`שגיאה ברישום: ${err.message}`))
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerText = "בצע רישום";
    });
});
