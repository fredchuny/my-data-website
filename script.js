document.addEventListener('DOMContentLoaded', function() {
    // Replace with your Apps Script Web App URL
    const apiUrl = 'https://script.google.com/macros/s/AKfycbxGdntR1eTtD2UTgUQgPGLpSz8TNQ3fqL5_w5d_DHLkIMLPWVcTZJEfPkCq01pM_L7P/exec';

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
            const tableHeadRow = document.querySelector('#dataTable thead tr');

            if (data.length > 0) {
                // Clear existing headers if any, then add new ones based on the first object's keys
                tableHeadRow.innerHTML = '';
                Object.keys(data[0]).forEach(key => {
                    const th = document.createElement('th');
                    th.textContent = key;
                    tableHeadRow.appendChild(th);
                });

                data.forEach(rowData => {
                    const tr = document.createElement('tr');
                    Object.values(rowData).forEach(value => {
                        const td = document.createElement('td');
                        td.textContent = value;
                        tr.appendChild(td);
                    });
                    tableBody.appendChild(tr);
                });
            }
        })
        .catch(error => console.error('Error fetching data from Apps Script:', error));
});
