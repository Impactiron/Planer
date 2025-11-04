function loadDataFromStorage() {
    try {
        const data = localStorage.getItem('taskPlannerData');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error loading data from storage:", error);
        return [];
    }
}

function saveDataToStorage(tasks) {
    try {
        localStorage.setItem('taskPlannerData', JSON.stringify(tasks));
    } catch (error) {
        console.error("Error saving data to storage:", error);
    }
}