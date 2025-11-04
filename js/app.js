document.addEventListener('DOMContentLoaded', function() {
    // Initialize the task planner application
    loadDataFromStorage();
    initializeCalendar();
    setupEventListeners();
    updateStats();
    // Initialize Lucide icons
    Lucide.init();
});