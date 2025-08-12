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

let allClientsData = [];

// --- טען את כל נתוני המאגר בעת טעינת העמוד ---
document.addEventListener('DOMContentLoaded', () => {
    fetch(WEB_APP_URL)
        .then(res => res.json())
        .then(response => {
            if (response.data) {
                allClientsData = response.data;
            }
        }).catch(err => console.error("Error fetching initial data:", err));
});

// --- האזנה לשינויים בשדות המזהה ---
prefixSelect.addEventListener('change', checkApproval);
suffixInput.addEventListener('input', checkApproval);

function checkApproval() {
    const prefix = prefixSelect.value;
    const suffix = suffixInput.value;
    let clientId = '';

    if (prefix === 'אחר') {
        clientId = suffix; // אם נבחר "אחר", המזהה הוא מה שהוקלד
    } else if (suffix.length > 0) {
        clientId = `${prefix}-${suffix}`; // הרכבת מספר טלפון
    } else {
        statusDisplay.classList.remove('visible', 'approved', 'not-approved');
        return; // אין מספיק מידע לבדיקה
    }
    
    if (clientId.length < 3) return; // אל תבדוק על מזהים קצרים מדי

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

// --- שליחת טופס רישום כניסה/יציאה ---
logForm.addEventListener('submit', (e) => {
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