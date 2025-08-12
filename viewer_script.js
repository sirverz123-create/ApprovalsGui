const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxcBlqNn0w8wnCnVV7SlOce-rsKAnpW8LDgjud-R6LVe9WgtBnYr1HVSK0I4zmZWkJ2/exec";

const dbTableBody = document.querySelector('#db-table tbody');
const logTableBody = document.querySelector('#log-table tbody');

function fetchDataAndRender() {
    fetch(WEB_APP_URL)
        .then(res => res.json())
        .then(response => {
            if (response.error) {
                throw new Error(response.error);
            }
            renderDbTable(response.database || []);
            renderLogTable(response.logs || []);
        })
        .catch(err => console.error("Failed to fetch data:", err));
}

function renderDbTable(data) {
    dbTableBody.innerHTML = ''; // נקה טבלה
    data.forEach(row => {
        const tr = document.createElement('tr');
        // פורמט תאריכים
        const lastVisit = row[2] ? new Date(row[2]).toLocaleString('he-IL') : '';
        const startDate = row[4] ? new Date(row[4]).toLocaleDateString('he-IL') : '';
        const endDate = row[5] ? new Date(row[5]).toLocaleDateString('he-IL') : '';

        tr.innerHTML = `
            <td>${row[0] || ''}</td>
            <td>${row[1] || ''}</td>
            <td>${lastVisit}</td>
            <td>${row[3] || ''}</td>
            <td>${startDate}</td>
            <td>${endDate}</td>
            <td>${row[6] || ''}</td>
        `;
        dbTableBody.appendChild(tr);
    });
}

function renderLogTable(data) {
    logTableBody.innerHTML = ''; // נקה טבלה
    data.forEach(row => {
        const tr = document.createElement('tr');
        const timestamp = row[0] ? new Date(row[0]).toLocaleString('he-IL') : '';
        tr.innerHTML = `
            <td>${timestamp}</td>
            <td>${row[1] || ''}</td>
            <td>${row[2] || ''}</td>
            <td>${row[3] || ''}</td>
            <td>${row[4] || ''}</td>
        `;
        logTableBody.appendChild(tr);
    });
}

// טעינה ראשונית
document.addEventListener('DOMContentLoaded', fetchDataAndRender);

// ריענון אוטומטי כל 10 שניות
setInterval(fetchDataAndRender, 10000);