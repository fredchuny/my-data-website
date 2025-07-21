document.addEventListener('DOMContentLoaded', function() {
    // Replace with your Apps Script Web App URL
    const apiUrl = 'https://script.google.com/macros/s/AKfycbxGdntR1eTtD2UTgUQgPGLpSz8TNQ3fqL5_w5d_DHLkIMLPWVcTZJEfPkCq01pM_L7P/exec'; // <--- VERIFY THIS IS YOUR LATEST, ACTIVE APPS SCRIPT URL!

    // Make sure this matches a column header in your Google Sheet (case-sensitive)
    const CATEGORY_COLUMN_NAME = 'Category'; // <--- IMPORTANT: Adjust this to your actual category column name!

    let allData = []; // To store the original fetched data
    const noDataMessage = document.getElementById('noDataMessage'); // Get the no data message element

    // --- Start of Mobile Column Prioritization (Optional) ---
    // Define which columns are most important to display on mobile cards.
    // If a column isn't listed here, it won't be displayed on mobile (but will on desktop).
    // Ensure these names EXACTLY match your Google Sheet headers.
    const MOBILE_VISIBLE_COLUMNS = ['Category', 'Name', 'Description', 'Value']; // ADJUST THIS LIST!
    // --- End of Mobile Column Prioritization ---

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                // If the response is not OK (e.g., 400, 404, 500), throw an error
                // Attempt to read error message from response if available
                return response.text().then(text => { // Get response as text to see if it's an error message
                    try {
                        const json = JSON.parse(text);
                        throw new Error(`HTTP error! status: ${response.status} - ${json.error || text}`);
                    } catch (e) {
                        throw new Error(`HTTP error! status: ${response.status} - ${text}`);
                    }
                });
            }
            return response.json();
        })
        .then(data => {
            allData = data; // Store all data for filtering
            populateTable(allData); // Initial table population
            populateCategories(allData); // Populate filter dropdown
        })
        .catch(error => {
            console.error('Error fetching data from Apps Script:', error);
            noDataMessage.textContent = `Failed to load data: ${error.message || 'Unknown error. Check Apps Script deployment and console for details.'}`;
            noDataMessage.style.display = 'block'; // Show error message to user
        });

    // Function to populate the table
    function populateTable(dataToDisplay) {
        const tableBody = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
        const tableHeadRow = document.querySelector('#dataTable thead tr');

        tableBody.innerHTML = ''; // Clear existing table rows
        tableHeadRow.innerHTML = ''; // Clear existing headers
        noDataMessage.style.display = 'none'; // Hide no data message by default

        if (dataToDisplay.length === 0) {
            noDataMessage.textContent = 'No data found for the selected category.'; // Reset message
            noDataMessage.style.display = 'block'; // Show no data message
            return;
        }

        // Dynamically create headers based on the first object's keys
        const allHeaders = Object.keys(dataToDisplay[0]);
        let headersToDisplay = allHeaders;

        // Apply mobile column filtering for headers if on small screen
        if (window.innerWidth <= 768) {
            headersToDisplay = MOBILE_VISIBLE_COLUMNS.filter(col => allHeaders.includes(col));
        }

        headersToDisplay.forEach(key => { // Use headersToDisplay for TH
            const th = document.createElement('th');
            th.textContent = key;
            tableHeadRow.appendChild(th);
        });

        // Populate table rows
        dataToDisplay.forEach(rowData => {
            const tr = document.createElement('tr');
            allHeaders.forEach(key => { // IMPORTANT: Iterate over ALL headers to create TDs for data-label
                const td = document.createElement('td');
                td.textContent = rowData[key] || ''; // Use empty string for undefined values
                td.setAttribute('data-label', key); // IMPORTANT for responsive card view CSS
                
                // If we are on mobile AND this column is NOT in MOBILE_VISIBLE_COLUMNS, hide it
                if (window.innerWidth <= 768 && !MOBILE_VISIBLE_COLUMNS.includes(key)) {
                    td.style.display = 'none'; // Directly hide this td for mobile if not in visible list
                }

                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });
    }

    // Function to populate the category filter dropdown
    function populateCategories(data) {
        const categoryFilter = document.getElementById('categoryFilter');
        const categories = new Set(); // Use Set to get unique categories

        // Clear existing options, but keep "All Categories"
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';

        data.forEach(item => {
            if (item[CATEGORY_COLUMN_NAME]) { // Check if the category column exists for the item
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
