// calendar.js

// Initialize calendar with FullCalendar
const calendarEl = document.getElementById('calendar');
const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    events: getCalendarEvents(),
    eventClick: handleEventClick,
    eventDrop: handleEventDrop,
    eventResize: handleEventResize,
});

// Function to convert tasks to calendar events
function getCalendarEvents() {
    const tasks = [
        // Sample tasks; replace with actual task fetching logic
        { title: 'Task 1', start: '2023-10-15', end: '2023-10-15' },
        { title: 'Task 2', start: '2023-10-16', end: '2023-10-17' },
    ];
    return tasks.map(task => ({
        title: task.title,
        start: task.start,
        end: calculateEndTime(task),
        color: getTaskColor(task),
    }));
}

// Function to calculate end time based on task duration
function calculateEndTime(task) {
    // Assume a default duration of 1 day, replace with actual duration logic
    const start = new Date(task.start);
    return new Date(start.getTime() + 24 * 60 * 60 * 1000); // add 1 day
}

// Function to get task color based on duration
function getTaskColor(task) {
    // Example logic: change color based on duration
    const duration = (calculateEndTime(task) - new Date(task.start)) / (1000 * 60 * 60 * 24);
    return duration > 1 ? 'red' : 'green';
}

// Handle event click
function handleEventClick(info) {
    alert('Event: ' + info.event.title);
}

// Handle event drop
function handleEventDrop(info) {
    // Update task start/end time based on drop
    console.log(`Event dropped to: ${info.event.start}`);
}

// Handle event resize
function handleEventResize(info) {
    // Update task duration based on resize
    console.log(`Event resized to: ${info.event.end}`);
}

// Function to refresh calendar
function refreshCalendar() {
    calendar.refetchEvents();
}

// Render calendar
calendar.render();