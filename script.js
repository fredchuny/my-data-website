document.addEventListener('DOMContentLoaded', function() {
    // 1. Google Sheets API Configuration (REPLACE WITH YOUR ACTUAL VALUES)
    const API_KEY = 'https://script.google.com/macros/s/AKfycbxGdntR1eTtD2UTgUQgPGLpSz8TNQ3fqL5_w5d_DHLkIMLPWVcTZJEfPkCq01pM_L7P/exec'; // <--- IMPORTANT: Get this from Google Cloud Console
    const SPREADSHEET_ID = '1e9wzWOXVaGBh5MT7kl8WFotWfl74CzzeZTNhvLEnwGs'; // <--- IMPORTANT: Get this from your Google Sheet URL
    const SHEET_NAME_OR_RANGE = 'Sheet1!A:Z'; // <--- IMPORTANT: Adjust to your sheet name and desired range (e.g., 'Sheet1!A:G' if you only have 7 columns)

    // Make sure this matches a column header in your Google Sheet
    const CATEGORY_COLUMN_NAME = 'Category'; // <--- IMPORTANT: Adjust this to your actual category column name!

    let allData = []; // To store the original fetched data
    const noDataMessage = document.getElementById('noDataMessage');

    // Function to fetch data from Google Sheets API
    async function fetchData() {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME_OR_RANGE}?key=${API_KEY}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                // Check for specific error messages (e.g., 403 Forbidden for API key issues or sheet access)
                const errorData = await response.json();
                console.error('Error fetching data from Google Sheets API:', errorData);
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.error.message || 'Unknown error'}`);
            }
            const data = await response.json();

            // The Google Sheets API returns data as an array of arrays (rows)
            // The first array is typically the headers. We need to convert this to an array of objects.
            if (!data.values || data.values.length === 0) {
                return [];
            }

            const headers = data.values[0];
            const rows = data.values.slice(1); // Get all rows excluding the header

            const formattedData = rows.map(row => {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index] || ''; // Map values to their respective headers
                });
                return obj;
            });
            return formattedData;

        } catch (error) {
            console.error('Error fetching data:', error);
            // Display a user-friendly error message if data fetching fails
            tableBody.innerHTML = '<tr><td colspan="100%" style="text-align: center; color: red;">Failed to load data. Please check console for errors.</td></tr>';
            noDataMessage.textContent = 'Failed to load data. Please check the API key, spreadsheet ID, sheet name, and sharing settings of your Google Sheet.';
            noDataMessage.style.display = 'block';
            return [];
        }
    }

    // Main execution
    fetchData().then(data => {
        allData = data; // Store all data for filtering
        populateTable(allData); // Initial table population
        populateCategories(allData); // Populate filter dropdown
    });


    // Function to populate the table
    function populateTable(dataToDisplay) {
        const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
        const tableHeadRow = document.querySelector('#dataTable thead tr');

        tableBody.innerHTML = ''; // Clear existing table rows
        tableHeadRow.innerHTML = ''; // Clear existing headers
        noDataMessage.style.display = 'none'; // Hide no data message by default

        if (dataToDisplay.length === 0) {
            noDataMessage.textContent = 'No data found for the selected category. Please try a different filter.'; // Reset message
            noDataMessage.style.display = 'block'; // Show no data message
            return;
        }

        // Dynamically create headers based on the first object's keys
        const headers = Object.keys(dataToDisplay[0]);
        headers.forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
            tableHeadRow.appendChild(th);
        });

        // Populate table rows
        dataToDisplay.forEach(rowData => {
            const tr = document.createElement('tr');
            headers.forEach(key => { // Iterate over headers to ensure consistent column order
                const td = document.createElement('td');
                td.textContent = rowData[key];
                td.setAttribute('data-label', key); // IMPORTANT for responsive card view CSS
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });
    }

    // Function to populate the category filter dropdown (same as before)
    function populateCategories(data) {
        const categoryFilter = document.getElementById('categoryFilter');
        const categories = new Set(); // Use Set to get unique categories

        // Clear existing options, but keep "All Categories"
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';

        data.forEach(item => {
            if (item[CATEGORY_COLUMN_NAME]) {
                categories.add(item[CATEGORY_COLUMN_NAME]);
            }
        });

        // Add unique categories to the dropdown, sorted alphabetically
        Array.from(categories).sort().forEach(category => {
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
