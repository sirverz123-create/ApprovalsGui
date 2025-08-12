// ==========================================================
// !!!! שלב קריטי: ודא שכתובת ה-URL שלך נמצאת כאן !!!!
// ==========================================================
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxcBlqNn0w8wnCnVV7SlOce-rsKAnpW8LDgjud-R6LVe9WgtBnYr1HVSK0I4zmZWkJ2/exec";
// ==========================================================


// קבלת אלמנטים מה-DOM
const form = document.getElementById('approval-form');
const clientIdInput = document.getElementById('client-id');
const clientNameInput = document.getElementById('client-name');
const clientsDatalist = document.getElementById('clients-list');
const responseMessage = document.getElementById('response-message');
const submitBtn = document.getElementById('submit-btn');

let existingClients = [];

// פונקציה שתרוץ כשהדף נטען
document.addEventListener('DOMContentLoaded', () => {
    loadClients();
});

// פונקציה לטעינת לקוחות מהשרת
function loadClients() {
    fetch(WEB_APP_URL)
        .then(response => response.json())
        .then(data => {
            if (data.clients) {
                existingClients = data.clients;
                populateClientsDatalist(existingClients);
            }
        })
        .catch(error => {
            console.error("Error fetching clients:", error);
            showResponseMessage("שגיאה בטעינת לקוחות קיימים", true);
        });
}

// פונקציה למילוי רשימת ההשלמה האוטומטית
function populateClientsDatalist(clients) {
    clientsDatalist.innerHTML = ''; // נקה רשימה קיימת
    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.clientId;
        option.innerText = client.clientName;
        clientsDatalist.appendChild(option);
    });
}

// האזנה לאירוע בחירת לקוח מהרשימה
clientIdInput.addEventListener('input', () => {
    const selectedClient = existingClients.find(c => c.clientId === clientIdInput.value);
    if (selectedClient) {
        clientNameInput.value = selectedClient.clientName;
    }
});


// האזנה לאירוע שליחת הטופס
form.addEventListener('submit', (e) => {
    e.preventDefault(); // מנע שליחה רגילה של הטופס
    submitBtn.disabled = true;
    submitBtn.innerText = "שומר...";

    // איסוף הנתונים מהטופס
    const formData = {
        clientId: clientIdInput.value,
        clientName: document.getElementById('client-name').value,
        approvalType: document.getElementById('approval-type').value,
        startDate: document.getElementById('start-date').value,
        endDate: document.getElementById('end-date').value,
        notes: document.getElementById('notes').value
    };

    // ===============================================
    // כאן נמצא התיקון המרכזי
    // ===============================================
    fetch(WEB_APP_URL, {
        method: 'POST',
        // שינוי קטן ב-headers והסרת 'mode: no-cors'
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(formData) // גוף הבקשה נשאר זהה
    })
    .then(response => response.json()) // כעת ניתן לקרוא את התשובה
    .then(result => {
        if (result.success) {
            showResponseMessage("האישור נשמר בהצלחה!", false);
            form.reset();
            loadClients(); // טעינה מחדש של הלקוחות
        } else {
            // אם ה-API החזיר שגיאה מבוקרת
            throw new Error(result.error || 'שגיאה לא ידועה מהשרת');
        }
    })
    .catch(error => {
        console.error("Error submitting form:", error);
        showResponseMessage(`שגיאה בשמירת האישור: ${error.message}`, true);
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerText = "שמור אישור";
    });
});

// פונקציה להצגת הודעות למשתמש
function showResponseMessage(message, isError) {
    responseMessage.textContent = message;
    responseMessage.className = isError ? 'error' : 'success';
    responseMessage.style.display = 'block';
}