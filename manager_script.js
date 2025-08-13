const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxcBlqNn0w8wnCnVV7SlOce-rsKAnpW8LDgjud-R6LVe9WgtBnYr1HVSK0I4zmZWkJ2/exec"; // ודא שהכתובת כאן נכונה

// --- אלמנטים מה-DOM ---
const form = document.getElementById('approval-form');
const clientIdInput = document.getElementById('client-id');
const clientNameInput = document.getElementById('client-name');
const clientsDatalist = document.getElementById('clients-list');
const responseMessage = document.getElementById('response-message');
const submitBtn = document.getElementById('submit-btn');

// --- אלמנטים חדשים ---
const searchInput = document.getElementById('search-input');
const tableBody = document.getElementById('clients-table-body');

let allClientsData = []; // ישמור את כל נתוני המאגר

// --- טעינת נתונים ראשונית ---
document.addEventListener('DOMContentLoaded', loadAndDisplayData);

function loadAndDisplayData() {
    fetch(WEB_APP_URL)
        .then(response => response.json())
        .then(apiResponse => {
            if (apiResponse.error) {
                throw new Error(apiResponse.error);
            }
            // ===== התיקון נמצא כאן =====
            // שינינו את apiResponse.data ל-apiResponse.database
            allClientsData = apiResponse.database || []; // שימוש ב-database וגם ב-fallback למערך ריק
            
            populateClientsDatalist(allClientsData);
            populateClientsTable(allClientsData);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            showResponseMessage("שגיאה בטעינת נתונים מהשרת", true);
        });
}

// --- פונקציות למילוי הנתונים ---
function populateClientsDatalist(clients) {
    clientsDatalist.innerHTML = '';
    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client[0]; // מזהה לקוח
        option.innerText = client[1]; // שם לקוח
        clientsDatalist.appendChild(option);
    });
}

function populateClientsTable(clients) {
    tableBody.innerHTML = ''; // נקה טבלה קיימת
    clients.forEach(client => {
        const row = document.createElement('tr');
        
        // פורמט התאריכים לקריאה נוחה
        const lastVisit = client[2] ? new Date(client[2]).toLocaleDateString('he-IL') : '';
        const startDate = client[4] ? new Date(client[4]).toLocaleDateString('he-IL') : '';
        const endDate = client[5] ? new Date(client[5]).toLocaleDateString('he-IL') : '';

        row.innerHTML = `
            <td>${client[0]}</td>
            <td>${client[1]}</td>
            <td>${lastVisit}</td>
            <td>${client[3]}</td>
            <td>${startDate}</td>
            <td>${endDate}</td>
        `;
        tableBody.appendChild(row);
    });
}

// --- אירועים ---
// האזנה לשינוי בטופס (נשאר כפי שהיה)
clientIdInput.addEventListener('input', () => {
    const selectedClient = allClientsData.find(c => String(c[0]) === clientIdInput.value);
    if (selectedClient) {
        clientNameInput.value = selectedClient[1];
    }
});

// האזנה לשליחת הטופס (גרסה מתוקנת ויציבה)
form.addEventListener('submit', (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.innerText = "שומר...";

    const formData = {
        clientId: clientIdInput.value,
        clientName: document.getElementById('client-name').value,
        approvalType: document.getElementById('approval-type').value,
        startDate: document.getElementById('start-date').value,
        endDate: document.getElementById('end-date').value,
        notes: document.getElementById('notes').value
    };

    // ===== כאן נמצא התיקון המרכזי =====
    // אנחנו שולחים את הבקשה ומצפים לתשובת JSON ישירה
    fetch(WEB_APP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(res => res.json()) // עיבוד התשובה כ-JSON
    .then(result => {
        if (result.success) {
            showResponseMessage("האישור נשמר בהצלחה!", false);
            form.reset();
            loadAndDisplayData(); // טען מחדש את כל הנתונים
        } else {
            throw new Error(result.error || 'שגיאה לא ידועה מהשרת');
        }
    })
    .catch(error => {
        showResponseMessage(`שגיאה בשמירת האישור: ${error.message}`, true);
        console.error('Submit Error:', error);
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerText = "שמור אישור";
    });
});

// --- פונקציית החיפוש החדשה ---
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    const filteredData = allClientsData.filter(client => {
        const id = String(client[0]).toLowerCase();
        const name = String(client[1]).toLowerCase();
        return id.includes(searchTerm) || name.includes(searchTerm);
    });
    
    populateClientsTable(filteredData);
});

// פונקציה להצגת הודעות (נשארה כפי שהייתה)
function showResponseMessage(message, isError) {
    responseMessage.textContent = message;
    responseMessage.className = isError ? 'error' : 'success';
}


