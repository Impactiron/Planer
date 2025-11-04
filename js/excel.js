// Excel File Handling using SheetJS

// Function to handle Excel file import
function handleExcelImport(file) {
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = function(e) {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        importTasksFromJson(jsonData);
    };
}

// Function to parse task data with flexible column name matching
function importTasksFromJson(data) {
    const tasks = data.map(row => {
        return {
            taskName: row['Task Name'] || row['taskName'] || '',
            durationHours: row['Duration hours'] || row['durationHours'] || 0,
            preferredDate: formatDate(row['Preferred Date']) || '',
            notes: row['Notes'] || '',
        };
    });
    console.log(tasks); // Or handle tasks however you want
}

// Function to convert Excel dates to YYYY-MM-DD format
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Returns YYYY-MM-DD
}

// Function to export tasks as JSON backup file
function exportData(tasks) {
    const json = JSON.stringify(tasks, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'tasks_backup.json';
    link.click();
}