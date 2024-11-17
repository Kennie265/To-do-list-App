let selectedDate = new Date();
let currentActivity = '';
let currentIcon = '';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    populateCalendar();
    loadTasks();
    updateTaskCount();
});

// Populate calendar strip with dates
function populateCalendar() {
    const calendarStrip = document.getElementById('calendarStrip');
    const today = new Date();
    
    for(let i = -2; i <= 4; i++) {
        const date = new Date();
        date.setDate(today.getDate() + i);
        
        const dateItem = document.createElement('div');
        dateItem.className = 'date-item';
        if(i === 0) dateItem.classList.add('active');
        
        const day = document.createElement('span');
        day.className = 'day';
        day.textContent = date.getDate();
        
        const weekday = document.createElement('span');
        weekday.className = 'weekday';
        weekday.textContent = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        dateItem.appendChild(day);
        dateItem.appendChild(weekday);
        dateItem.addEventListener('click', () => selectDate(date, dateItem));
        
        calendarStrip.appendChild(dateItem);
    }
}

function selectDate(date, element) {
    selectedDate = date;
    document.querySelectorAll('.date-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');
    loadTasks();
}

function showTaskForm(activity, icon) {
    currentActivity = activity;
    currentIcon = icon;
    document.querySelector('.activity-list').style.display = 'none';
    document.getElementById('taskForm').style.display = 'block';
}

function createTask() {
    const title = document.getElementById('taskTitle').value;
    const time = document.getElementById('taskTime').value;
    const duration = document.getElementById('taskDuration').value;
    
    if(!title || !time || !duration) {
        alert('Please fill all fields');
        return;
    }

    const task = {
        id: Date.now(),
        title,
        time,
        duration,
        activity: currentActivity,
        icon: currentIcon,
        date: selectedDate.toDateString()
    };

    // Get existing tasks
    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));

    loadTasks();
    closeModal();
    resetTaskForm();
}

function loadTasks() {
    const taskList = document.getElementById('taskList');
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
        .filter(task => new Date(task.date).toDateString() === selectedDate.toDateString());

    taskList.innerHTML = '';

    if(tasks.length === 0) {
        taskList.innerHTML = '<div class="empty-state">No tasks for this day</div>';
        updateTaskCount();
        return;
    }

    tasks.sort((a, b) => a.time.localeCompare(b.time))
        .forEach(task => {
            const endTime = calculateEndTime(task.time, task.duration);
            const taskElement = document.createElement('li');
            taskElement.className = 'task-item';
            taskElement.innerHTML = `
                <div class="task-dot"></div>
                <div class="task-content">
                    <div>${task.icon} ${task.title}</div>
                    <div class="task-time">${task.time} - ${endTime}</div>
                </div>
                <button class="delete-btn" onclick="deleteTask(event, ${task.id})">×</button>
            `;
            taskList.appendChild(taskElement);
        });

    updateTaskCount();
}

function calculateEndTime(startTime, durationMinutes) {
    const [hours, minutes] = startTime.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes) + parseInt(durationMinutes));
    return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
}

function deleteTask(event, taskId) {
    event.stopPropagation();
    if(!confirm('Are you sure you want to delete this task?')) return;

    let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    tasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
}

function updateTaskCount() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]')
        .filter(task => new Date(task.date).toDateString() === selectedDate.toDateString());
    const count = tasks.length;
    document.getElementById('taskCount').textContent = `${count} task${count !== 1 ? 's' : ''} today`;
}

function openModal() {
    document.getElementById('taskModal').style.display = 'flex';
    document.querySelector('.activity-list').style.display = 'block';
    document.getElementById('taskForm').style.display = 'none';
}

function closeModal() {
    document.getElementById('taskModal').style.display = 'none';
    resetTaskForm();
}

function resetTaskForm() {
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskTime').value = '';
    document.getElementById('taskDuration').value = '20';
    currentActivity = '';
    currentIcon = '';
}