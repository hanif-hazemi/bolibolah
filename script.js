// Analysis and chart rendering script
const apiKey = 'AIzaSyAXMh9gZ7eY-BA247IVi2VExDvZX87cygY'; // Replace with your actual API key
const spreadsheetId = '1Uqf5YcYRKNm_bqVIhiy-yst-x6OS_uEWiKj3GMKJFsA'; // Replace with your Google Sheets document ID
const range = 'Form Responses 1!A:D'; // Adjust the range as necessary

async function fetchData() {
    try {
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`);
        const data = await response.json();
        if (response.ok) {
            return data.values;
        } else {
            console.error('Error fetching data:', data);
            return [];
        }
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

function groupDataByMonth(data) {
    const groupedData = {};
    data.slice(1).forEach(row => {
        const [timestamp, product, price, customTime] = row;
        const dateStr = customTime || timestamp;
        const date = new Date(dateStr);
        const month = date.toLocaleString('en-US', { month: 'long' }); // Get the full month name
        const year = date.getFullYear(); // Get the year
        const monthYear = `${month} ${year}`;

        if (!groupedData[monthYear]) {
            groupedData[monthYear] = [];
        }
        groupedData[monthYear].push({ product, price: parseFloat(price) });
    });
    return groupedData;
}    

function updateMonthSelect(months) {
    const monthSelect = document.getElementById('month-select');
    monthSelect.innerHTML = months.map(month => `<option value="${month}">${month}</option>`).join('');
}

function createChart(data, month) {
    const ctx = document.getElementById('priceChart').getContext('2d');
    const monthData = data[month] || [];
    const itemGroups = monthData.reduce((groups, { product, price }) => {
        if (!groups[product]) {
            groups[product] = 0;
        }
        groups[product] += price;
        return groups;
    }, {});

    const labels = Object.keys(itemGroups);
    const prices = Object.values(itemGroups);

    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Total Price for ${month}`,
                data: prices,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    fetchData().then(data => {
        if (data.length > 0) {
            const groupedData = groupDataByMonth(data);
            const months = Object.keys(groupedData).sort((a, b) => new Date(b) - new Date(a));
            updateMonthSelect(months);
            const mostRecentMonth = months[0];
            createChart(groupedData, mostRecentMonth);

            document.getElementById('month-select').addEventListener('change', (event) => {
                const selectedMonth = event.target.value;
                createChart(groupedData, selectedMonth);
            });
        } else {
            alert('No data available or error fetching data.');
        }
    }).catch(error => {
        console.error('Error fetching data:', error);
    });

    // Function to go back to the previous page
    window.goBack = function() {
        window.history.back();
    };
});
