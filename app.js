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
    
    showToast(`Task \