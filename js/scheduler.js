class Scheduler {
    constructor() {
        this.tasks = [];
        this.workHours = { start: 9, end: 17 };
    }

    scheduleTask(task) {
        const availableSlot = this.findAvailableSlot(task);
        if (availableSlot) {
            this.tasks.push({ ...task, slot: availableSlot });
            return availableSlot;
        } else {
            throw new Error('No available slot found for this task.');
        }
    }

    findAvailableSlot(task) {
        for (let hour = this.workHours.start; hour < this.workHours.end; hour++) {
            if (this.isSlotAvailable(hour, task.duration)) {
                return hour;
            }
        }
        return null;
    }

    isSlotAvailable(hour, duration) {
        const conflictingTask = this.tasks.find(t => t.slot === hour && (t.duration + t.slot) > hour);
        return !conflictingTask;
    }

    rescheduleAllTasks() {
        this.tasks.sort((a, b) => a.slot - b.slot);
        this.tasks.forEach((task, index) => {
            task.slot = this.findAvailableSlot(task) || task.slot;
        });
    }
}

// Example usage
const scheduler = new Scheduler();
scheduler.scheduleTask({ name: 'Task 1', duration: 2 });
