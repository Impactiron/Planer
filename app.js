/**
 * Personal Task Planner - Main Application
 * A client-side task planning system with Excel import and automatic scheduling
 */

// ============================================================================
// Global State Management
// ============================================================================

let calendar; // FullCalendar instance
let tasks = []; // Array to store all tasks

// Storage keys
const STORAGE_KEY = 'taskPlannerData';
const SETTINGS_KEY = 'taskPlannerSettings';

// Default work hours (9 AM to 5 PM)
const WORK_START_HOUR = 9;
const WORK_END_HOUR = 17;

// ============================================================================
// Initialize Application
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Task Planner...');
    
    // Load data from localStorage
    loadDataFromStorage();
    
    // Initialize FullCalendar
    initializeCalendar();
    
    // Setup event listeners
    setupEventListeners();
    
    // Update statistics
    updateStats();
    
    // Initialize Lucide icons
    lucide.createIcons();
    
    console.log('Task Planner initialized successfully!');
});

// ============================================================================
// Calendar Initialization
// ============================================================================

/**
 * Initialize FullCalendar with configuration
 */
function initializeCalendar() {
    const calendarEl = document.getElementById('calendar');
    
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        slotMinTime: '07:00:00',
        slotMaxTime: '21:00:00',
        slotDuration: '00:30:00',
        allDaySlot: false,
        editable: true,
        droppable: true,
        eventResizableFromStart: true,
        
        // Event handlers
        eventClick: handleEventClick,
        eventDrop: handleEventDrop,
        eventResize: handleEventResize,
        
        // Load events
        events: getCalendarEvents(),
        
        // Styling
        height: 'auto',
        eventColor: '#3b82f6',
        
        // Business hours (visual indicator)
        businessHours: {
            daysOfWeek: [1, 2, 3, 4, 5, 6, 0], // Monday - Sunday
            startTime: '09:00',
            endTime: '17:00'
        }
    });
    
    calendar.render();
}

/**
 * Convert tasks to FullCalendar event format
 */
function getCalendarEvents() {
    return tasks
        .filter(task => task.scheduledDate && task.scheduledTime)
        .map(task => ({
            id: task.id,
            title: task.name,
            start: `${task.scheduledDate}T${task.scheduledTime}`,
            end: calculateEndTime(task.scheduledDate, task.scheduledTime, task.duration),
            backgroundColor: getTaskColor(task.duration),
            borderColor: getTaskColor(task.duration),
            extendedProps: {
                duration: task.duration,
                notes: task.notes,
                preferredDate: task.preferredDate
            }
        }));
}

/**
 * Calculate end time based on start time and duration
 */
function calculateEndTime(date, time, durationHours) {
    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + durationHours * 60 * 60 * 1000);
    return endDateTime.toISOString();
}

/**
 * Get color based on task duration
 */
function getTaskColor(duration) {
    if (duration < 2) return '#10b981'; // Green for short tasks
    if (duration <= 4) return '#3b82f6'; // Blue for medium tasks
    return '#8b5cf6'; // Purple for long tasks
}

// ============================================================================
// Event Listeners Setup
// ============================================================================

function setupEventListeners() {
    // Add Task button
    document.getElementById('addTaskBtn').addEventListener('click', openAddTaskModal);
    
    // Import Excel button
    document.getElementById('importExcelBtn').addEventListener('click', () => {
        document.getElementById('excelFileInput').click();
    });
    
    // Excel file input
    document.getElementById('excelFileInput').addEventListener('change', handleExcelImport);
    
    // Export Data button
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    
    // Modal close button
    document.getElementById('closeModal').addEventListener('click', closeModal);
    
    // Task form submit
    document.getElementById('taskForm').addEventListener('submit', handleTaskFormSubmit);
    
    // Delete task button
    document.getElementById('deleteTaskBtn').addEventListener('click', handleDeleteTask);
    
    // Close modal when clicking outside
    document.getElementById('taskModal').addEventListener('click', (e) => {
        if (e.target.id === 'taskModal') {
            closeModal();
        }
    });
}

// ============================================================================
// Task Management Functions
// ============================================================================

/**
 * Open modal to add a new task
 */
function openAddTaskModal() {
    document.getElementById('modalTitle').textContent = 'Add New Task';
    document.getElementById('taskForm').reset();
    document.getElementById('taskId').value = '';
    document.getElementById('deleteTaskBtn').classList.add('hidden');
    document.getElementById('taskModal').classList.remove('hidden');
    
    // Set default date to today
    document.getElementById('preferredDate').valueAsDate = new Date();
}

/**
 * Open modal to edit an existing task
 */
function openEditTaskModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Task';
    document.getElementById('taskId').value = task.id;
    document.getElementById('taskName').value = task.name;
    document.getElementById('taskDuration').value = task.duration;
    document.getElementById('preferredDate').value = task.preferredDate || '';
    document.getElementById('taskNotes').value = task.notes || '';
    document.getElementById('deleteTaskBtn').classList.remove('hidden');
    document.getElementById('taskModal').classList.remove('hidden');
}

/**
 * Close the task modal
 */
function closeModal() {
    document.getElementById('taskModal').classList.add('hidden');
    document.getElementById('taskForm').reset();
}

/**
 * Handle task form submission
 */
function handleTaskFormSubmit(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('taskId').value;
    const taskData = {
        name: document.getElementById('taskName').value.trim(),
        duration: parseFloat(document.getElementById('taskDuration').value),
        preferredDate: document.getElementById('preferredDate').value || null,
        notes: document.getElementById('taskNotes').value.trim()
    };
    
    if (taskId) {
        // Update existing task
        updateTask(taskId, taskData);
    } else {
        // Create new task
        createTask(taskData);
    }
    
    closeModal();
}

/**
 * Create a new task
 */
function createTask(taskData) {
    const task = {
        id: generateId(),
        name: taskData.name,
        duration: taskData.duration,
        preferredDate: taskData.preferredDate,
        notes: taskData.notes,
        createdAt: new Date().toISOString(),
        scheduledDate: null,
        scheduledTime: null
    };
    
    tasks.push(task);
    
    // Auto-schedule the task
    scheduleTask(task);
    
    // Save and update UI
    saveDataToStorage();
    refreshCalendar();
    updateStats();
    
    showToast(`Task "${task.name}" added successfully!`);
}

/**
 * Update an existing task
 */
function updateTask(taskId, taskData) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    const task = tasks[taskIndex];
    
    // Update task properties
    task.name = taskData.name;
    task.duration = taskData.duration;
    task.preferredDate = taskData.preferredDate;
    task.notes = taskData.notes;
    
    // Reschedule if necessary
    if (task.scheduledDate) {
        scheduleTask(task);
    }
    
    // Save and update UI
    saveDataToStorage();
    refreshCalendar();
    updateStats();
    
    showToast(`Task "${task.name}" updated successfully!`);
}

/**
 * Delete a task
 */
function handleDeleteTask() {
    const taskId = document.getElementById('taskId').value;
    if (!taskId) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (confirm(`Are you sure you want to delete "${task.name}"?`)) {
        tasks = tasks.filter(t => t.id !== taskId);
        
        closeModal();
        saveDataToStorage();
        refreshCalendar();
        updateStats();
        
        showToast(`Task "${task.name}" deleted successfully!`);
    }
}

// ============================================================================
// Automatic Scheduling Algorithm
// ============================================================================

/**
 * Schedule a task automatically, avoiding conflicts
 */
function scheduleTask(task) {
    // Determine the starting date for scheduling
    let startDate = task.preferredDate 
        ? new Date(task.preferredDate) 
        : new Date();
    
    // Start from today if preferred date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
        startDate = today;
    }
    
    // Try to find a suitable time slot
    const { date, time } = findAvailableSlot(startDate, task.duration, task.id);
    
    task.scheduledDate = date;
    task.scheduledTime = time;
}

/**
 * Find an available time slot for a task
 */
function findAvailableSlot(startDate, durationHours, excludeTaskId = null) {
    const maxDaysToCheck = 30; // Look ahead up to 30 days
    let currentDate = new Date(startDate);
    
    for (let day = 0; day < maxDaysToCheck; day++) {
        const dateString = currentDate.toISOString().split('T')[0];
        
        // Try each hour within work hours
        for (let hour = WORK_START_HOUR; hour < WORK_END_HOUR; hour++) {
            const time = `${String(hour).padStart(2, '0')}:00:00`;
            
            // Check if this slot is available
            if (isSlotAvailable(dateString, time, durationHours, excludeTaskId)) {
                return { date: dateString, time: time };
            }
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Fallback: schedule at the end of the last checked day
    const fallbackDate = currentDate.toISOString().split('T')[0];
    return { date: fallbackDate, time: `${WORK_START_HOUR}:00:00` };
}

/**
 * Check if a time slot is available (no conflicts with other tasks)
 */
function isSlotAvailable(date, time, durationHours, excludeTaskId) {
    const startTime = new Date(`${date}T${time}`);
    const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);
    
    // Check work hours
    const endHour = endTime.getHours() + endTime.getMinutes() / 60;
    if (endHour > WORK_END_HOUR) {
        return false; // Would extend beyond work hours
    }
    
    // Check conflicts with existing tasks
    for (const task of tasks) {
        if (task.id === excludeTaskId) continue;
        if (!task.scheduledDate || !task.scheduledTime) continue;
        
        const taskStart = new Date(`${task.scheduledDate}T${task.scheduledTime}`);
        const taskEnd = new Date(taskStart.getTime() + task.duration * 60 * 60 * 1000);
        
        // Check for overlap
        if (startTime < taskEnd && endTime > taskStart) {
            return false; // Conflict found
        }
    }
    
    return true; // Slot is available
}

// ============================================================================
// Calendar Event Handlers
// ============================================================================

/**
 * Handle clicking on a calendar event
 */
function handleEventClick(info) {
    const taskId = info.event.id;
    openEditTaskModal(taskId);
}

/**
 * Handle dragging and dropping an event
 */
function handleEventDrop(info) {
    const taskId = info.event.id;
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
        const newStart = info.event.start;
        task.scheduledDate = newStart.toISOString().split('T')[0];
        task.scheduledTime = newStart.toTimeString().split(' ')[0];
        
        saveDataToStorage();
        showToast(`Task "${task.name}" rescheduled!`);
    }
}

/**
 * Handle resizing an event
 */
function handleEventResize(info) {
    const taskId = info.event.id;
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
        const start = info.event.start;
        const end = info.event.end;
        const newDuration = (end - start) / (1000 * 60 * 60); // Convert to hours
        
        task.duration = Math.round(newDuration * 2) / 2; // Round to nearest 0.5
        
        saveDataToStorage();
        showToast(`Task "${task.name}" duration updated to ${task.duration} hours!`);
    }
}

/**
 * Refresh calendar with current tasks
 */
function refreshCalendar() {
    if (calendar) {
        calendar.removeAllEvents();
        calendar.addEventSource(getCalendarEvents());
    }
}

// ============================================================================
// Excel Import Functionality
// ============================================================================

/**
 * Handle Excel file import
 */
function handleExcelImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            const data = new Uint8Array(event.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Get first sheet
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            importTasksFromJson(jsonData);
            
            showToast(`Successfully imported ${jsonData.length} tasks!`);
        } catch (error) {
            console.error('Error parsing Excel file:', error);
            showToast('Error parsing Excel file. Please check the format.', 'error');
        }
    };
    
    reader.readAsArrayBuffer(file);
    
    // Reset input
    e.target.value = '';
}

/**
 * Import tasks from parsed JSON data
 * Expected format: { "Task Name": "...", "Duration (hours)": 2, "Preferred Date": "2025-11-04" }
 */
function importTasksFromJson(jsonData) {
    let importedCount = 0;
    
    for (const row of jsonData) {
        // Try different possible column names (case-insensitive)
        const taskName = row['Task Name'] || row['task name'] || row['Task'] || row['Name'];
        const duration = row['Duration (hours)'] || row['Duration'] || row['duration'] || row['Hours'];
        const preferredDate = row['Preferred Date'] || row['preferred date'] || row['Date'] || null;
        
        // Validate required fields
        if (!taskName || !duration) {
            console.warn('Skipping row with missing required fields:', row);
            continue;
        }
        
        // Create task
        const task = {
            id: generateId(),
            name: String(taskName).trim(),
            duration: parseFloat(duration),
            preferredDate: preferredDate ? formatDate(preferredDate) : null,
            notes: row['Notes'] || row['notes'] || '',
            createdAt: new Date().toISOString(),
            scheduledDate: null,
            scheduledTime: null
        };
        
        tasks.push(task);
        scheduleTask(task);
        importedCount++;
    }
    
    // Save and update UI
    saveDataToStorage();
    refreshCalendar();
    updateStats();
    
    console.log(`Imported ${importedCount} tasks from Excel file`);
}

/**
 * Format date from various Excel formats to YYYY-MM-DD
 */
function formatDate(dateValue) {
    if (!dateValue) return null;
    
    try {
        // If it's already a string in YYYY-MM-DD format
        if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
            return dateValue;
        }
        
        // If it's an Excel date number
        if (typeof dateValue === 'number') {
            const date = XLSX.SSF.parse_date_code(dateValue);
            return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
        }
        
        // Try parsing as date
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
        }
    } catch (error) {
        console.warn('Error formatting date:', dateValue, error);
    }
    
    return null;
}

// ============================================================================
// Data Export Functionality
// ============================================================================

/**
 * Export all tasks as JSON file
 */
function exportData() {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `task-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Data exported successfully!');
}

// ============================================================================
// Statistics Update
// ============================================================================

/**
 * Update statistics cards
 */
function updateStats() {
    // Total tasks
    document.getElementById('totalTasks').textContent = tasks.length;
    
    // Scheduled tasks (tasks with a scheduled date)
    const scheduledCount = tasks.filter(t => t.scheduledDate).length;
    document.getElementById('scheduledTasks').textContent = scheduledCount;
    
    // Total hours
    const totalHours = tasks.reduce((sum, task) => sum + task.duration, 0);
    document.getElementById('totalHours').textContent = totalHours.toFixed(1);
    
    // Tasks this week
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const weekTasks = tasks.filter(t => {
        if (!t.scheduledDate) return false;
        const taskDate = new Date(t.scheduledDate);
        return taskDate >= today && taskDate <= weekFromNow;
    }).length;
    document.getElementById('weekTasks').textContent = weekTasks;
}

// ============================================================================
// Local Storage Management
// ============================================================================

/**
 * Load data from localStorage
 */
function loadDataFromStorage() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            tasks = JSON.parse(storedData);
            console.log(`Loaded ${tasks.length} tasks from storage`);
        }
    } catch (error) {
        console.error('Error loading data from storage:', error);
        tasks = [];
    }
}

/**
 * Save data to localStorage
 */
function saveDataToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        console.log(`Saved ${tasks.length} tasks to storage`);
    } catch (error) {
        console.error('Error saving data to storage:', error);
        showToast('Error saving data!', 'error');
    }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a unique ID for tasks
 */
function generateId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    
    // Change icon based on type
    const icon = toast.querySelector('i');
    if (type === 'error') {
        icon.setAttribute('data-lucide', 'alert-circle');
        toast.classList.add('bg-red-600');
        toast.classList.remove('bg-gray-900');
    } else {
        icon.setAttribute('data-lucide', 'check-circle');
        toast.classList.add('bg-gray-900');
        toast.classList.remove('bg-red-600');
    }
    
    lucide.createIcons();
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

/**
 * Debug function to log current state
 */
function debugState() {
    console.log('=== Current State ===');
    console.log('Total Tasks:', tasks.length);
    console.log('Tasks:', tasks);
    console.log('==================');
}

// Make debug function available globally
window.debugState = debugState;
