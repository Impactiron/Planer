// js/tasks.js

// Generate a unique identifier for a task
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Create a new task
function createTask(title, description) {
    const task = {
        id: generateId(),
        title: title,
        description: description,
        completed: false
    };
    const tasks = getAllTasks();
    tasks.push(task);
    setTasks(tasks);
    return task;
}

// Update an existing task
function updateTask(id, updatedFields) {
    let tasks = getAllTasks();
    tasks = tasks.map(task => {
        if (task.id === id) {
            return {...task, ...updatedFields};
        }
        return task;
    });
    setTasks(tasks);
}

// Delete a task by ID
function deleteTask(id) {
    let tasks = getAllTasks();
    tasks = tasks.filter(task => task.id !== id);
    setTasks(tasks);
}

// Get a task by its ID
function getTaskById(id) {
    const tasks = getAllTasks();
    return tasks.find(task => task.id === id);
}

// Get all tasks
function getAllTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    return tasks;
}

// Set tasks to local storage
function setTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}