document.addEventListener('DOMContentLoaded', function() {
    // Replace with your Apps Script Web App URL
    const apiUrl = 'https://script.google.com/macros/s/AKfycbxGdntR1eTtD2UTgUQgPGLpSz8TNQ3fqL5_w5d_DHLkIMLPWVcTZJEfPkCq01pM_L7P/exec'; // <--- IMPORTANT: Paste your actual Apps Script URL here!
    // Make sure this matches a column header in your Google Sheet
    const CATEGORY_COLUMN_NAME = 'Category'; // <--- IMPORTANT: Adjust this to your actual category column name!

    let allData = []; // To store the original fetched data

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            allData = data; // Store all data for filtering
            populateTable(allData); // Initial table population
            populateCategories(allData); // Populate filter dropdown
        })
        .catch(error => console.error('Error fetching data from Apps Script:', error));

    // Function to populate the table
    function populateTable(dataToDisplay) {
        const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
        const tableHeadRow = document.querySelector('#dataTable thead tr');

        tableBody.innerHTML = ''; // Clear existing table rows
        tableHeadRow.innerHTML = ''; // Clear existing headers

        if (dataToDisplay.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="100%">No data to display.</td></tr>';
            return;
        }

        // Dynamically create headers based on the first object's keys
        Object.keys(dataToDisplay[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
            tableHeadRow.appendChild(th);
        });

        // Populate table rows
        dataToDisplay.forEach(rowData => {
            const tr = document.createElement('tr');
            Object.values(rowData).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });
    }

    // Function to populate the category filter dropdown
    function populateCategories(data) {
        const categoryFilter = document.getElementById('categoryFilter');
        const categories = new Set(); // Use Set to get unique categories

        data.forEach(item => {
            if (item[CATEGORY_COLUMN_NAME]) { // Check if the category column exists for the item
                categories.add(item[CATEGORY_COLUMN_NAME]);
            }
        });

        // Add unique categories to the dropdown
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });

        // Add event listener for filter change
        categoryFilter.addEventListener('change', function() {
            const selectedCategory = this.value;
            let filteredData = [];

            if (selectedCategory === 'all') {
                filteredData = allData;
            } else {
                filteredData = allData.filter(item => item[CATEGORY_COLUMN_NAME] === selectedCategory);
            }
            populateTable(filteredData);
        });
    }
});
