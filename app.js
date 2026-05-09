// State Management (Mocking Zustand/Supabase for now, can be replaced easily)
const state = {
    user: JSON.parse(localStorage.getItem('dhruverse_user')) || null,
    tasks: JSON.parse(localStorage.getItem('dhruverse_tasks')) || [
        { id: '1', title: 'Review Q3 Metrics', completed: true, date: new Date().toISOString() },
        { id: '2', title: 'Design System Update', completed: false, date: new Date().toISOString() }
    ],
    timer: {
        focusDuration: 25,
        breakDuration: 5,
        timeLeft: 25 * 60,
        isRunning: false,
        mode: 'Focus', // 'Focus' or 'Break'
        intervalId: null
    },
    calendar: {
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear(),
        selectedDate: new Date()
    },
    habits: JSON.parse(localStorage.getItem('dhruverse_habits')) || [
        { id: 'h1', title: 'Drink Water (2L)', completed: false },
        { id: 'h2', title: 'Read 10 Pages', completed: false }
    ],
    stats: JSON.parse(localStorage.getItem('dhruverse_stats')) || {
        focusMinutesToday: 0,
        tasksCompletedToday: 0,
        lastDate: new Date().toDateString()
    }
};

function checkNewDay() {
    const today = new Date().toDateString();
    if (state.stats.lastDate !== today) {
        state.stats.focusMinutesToday = 0;
        state.stats.tasksCompletedToday = 0;
        state.stats.lastDate = today;
        state.habits.forEach(h => h.completed = false);
        saveState();
    }
}

function saveState() {
    localStorage.setItem('dhruverse_tasks', JSON.stringify(state.tasks));
    localStorage.setItem('dhruverse_habits', JSON.stringify(state.habits));
    localStorage.setItem('dhruverse_stats', JSON.stringify(state.stats));
}

// === DOM Elements ===
// Auth
const authScreen = document.getElementById('auth-screen');
const appLayout = document.getElementById('app-layout');
const authForm = document.getElementById('auth-form');
const authMessage = document.getElementById('auth-message');
const toggleAuthModeBtn = document.getElementById('toggle-auth-mode');
let isSignUpMode = false;

// Nav & Views
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');
const currentDateTitle = document.getElementById('current-date-title');
const currentDateSubtitle = document.getElementById('current-date-subtitle');

// To-Do
const taskListEl = document.getElementById('task-list');
const addTaskBtn = document.getElementById('add-task-btn');
const taskModal = document.getElementById('task-modal');
const saveTaskBtn = document.getElementById('save-task-btn');
const cancelTaskBtn = document.getElementById('cancel-task-btn');
const newTaskInput = document.getElementById('new-task-title');

// Calendar
const calendarGrid = document.getElementById('calendar-grid');
const monthYearDisplay = document.getElementById('month-year-display');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const selectedDateDisplay = document.getElementById('selected-date-display');
const eventListEl = document.getElementById('event-list');

// Timer
const timerDisplay = document.getElementById('time-left');
const timerModeDisplay = document.getElementById('timer-mode');
const timerToggleBtn = document.getElementById('timer-toggle-btn');
const timerResetBtn = document.getElementById('timer-reset-btn');
const focusSlider = document.getElementById('focus-slider');
const breakSlider = document.getElementById('break-slider');
const focusDurVal = document.getElementById('focus-dur-val');
const breakDurVal = document.getElementById('break-dur-val');
const progressCircle = document.querySelector('.progress-ring__circle');
const timerChime = document.getElementById('timer-chime');

// Insights & Habits
const totalFocusTimeEl = document.getElementById('total-focus-time');
const tasksCompletedCountEl = document.getElementById('tasks-completed-count');
const productivityScoreEl = document.getElementById('productivity-score');
const productivityBar = document.getElementById('productivity-bar');
const habitListEl = document.getElementById('habit-list');
const addHabitBtn = document.getElementById('add-habit-btn');

// Settings Modal
const openSettingsBtn = document.getElementById('open-settings-btn');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const settingsModal = document.getElementById('settings-modal');
const themeToggle = document.getElementById('theme-toggle');
const themeKnob = document.getElementById('theme-toggle-knob');
const languageSelect = document.getElementById('language-select');
const logoutBtn = document.getElementById('logout-btn');

const profileUpload = document.getElementById('profile-upload');
const headerAvatarImg = document.getElementById('header-avatar-img');
const headerAvatarIcon = document.getElementById('header-avatar-icon');
const settingsAvatarImg = document.getElementById('settings-avatar-img');
const settingsAvatarIcon = document.getElementById('settings-avatar-icon');

// Translation Dictionary
const i18n = {
    en: { settings: "Settings", changePhoto: "Change Photo", theme: "Theme", language: "Language", logout: "Log Out" },
    es: { settings: "Ajustes", changePhoto: "Cambiar Foto", theme: "Tema", language: "Idioma", logout: "Cerrar Sesión" },
    fr: { settings: "Paramètres", changePhoto: "Changer Photo", theme: "Thème", language: "Langue", logout: "Déconnexion" }
};
// === Preferences Logic ===
function loadPreferences() {
    // Theme
    const isLightMode = localStorage.getItem('dhruverse_theme') === 'light';
    if (isLightMode) {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.checked = true;
        themeKnob.style.transform = 'translateX(24px)';
    }

    // Language
    const lang = localStorage.getItem('dhruverse_language') || 'en';
    languageSelect.value = lang;
    applyLanguage(lang);

    // Profile Pic
    const profilePic = localStorage.getItem('dhruverse_profile_pic');
    if (profilePic) {
        setProfilePicUI(profilePic);
    }
}

function applyLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang] && i18n[lang][key]) {
            el.textContent = i18n[lang][key];
        }
    });
}

function setProfilePicUI(base64Str) {
    headerAvatarIcon.classList.add('hidden');
    headerAvatarImg.src = base64Str;
    headerAvatarImg.classList.remove('hidden');

    settingsAvatarIcon.classList.add('hidden');
    settingsAvatarImg.src = base64Str;
    settingsAvatarImg.classList.remove('hidden');
}

// === Settings Logic ===
openSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
    settingsModal.classList.add('active');
});

closeSettingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
    settingsModal.classList.remove('active');
});

themeToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('dhruverse_theme', 'light');
        themeKnob.style.transform = 'translateX(24px)';
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('dhruverse_theme', 'dark');
        themeKnob.style.transform = 'translateX(0)';
    }
});

languageSelect.addEventListener('change', (e) => {
    const lang = e.target.value;
    localStorage.setItem('dhruverse_language', lang);
    applyLanguage(lang);
});

profileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64Str = event.target.result;
            localStorage.setItem('dhruverse_profile_pic', base64Str);
            setProfilePicUI(base64Str);
        };
        reader.readAsDataURL(file);
    }
});

logoutBtn.addEventListener('click', async () => {
    if (supabaseClient) {
        await supabaseClient.auth.signOut();
    }
    localStorage.removeItem('dhruverse_user');
    state.user = null;
    settingsModal.classList.add('hidden');
    settingsModal.classList.remove('active');
    showAuth();
});

// === Supabase Initialization ===
const SUPABASE_URL = 'https://szcssmyplwmnqnhnxgeb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6Y3NzbXlwbHdtbnFuaG54Z2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzgxMzcsImV4cCI6MjA5Mzg1NDEzN30.CT9y0LD2QzZzc8lfqjk0B3M0hceZKIFm15JiFZlcOks';

let supabaseClient;
if (window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    });
}


// === Initialize App State ===
function init() {
    checkNewDay();
    loadPreferences();
    updateDateHeaders();
    
    if (state.user) {
        showApp();
    } else {
        showAuth();
    }
    
    // Initial renders
    renderTasks();
    renderCalendar();
    renderHabits();
    updateInsights();
    updateTimerDisplay();
}

// === Auth Logic (Mock Supabase) ===
function showAuth() {
    authScreen.classList.add('active');
    authScreen.classList.remove('hidden');
    appLayout.classList.add('hidden');
    appLayout.classList.remove('active');
}

function showApp() {
    authScreen.classList.add('hidden');
    authScreen.classList.remove('active');
    appLayout.classList.add('active');
    appLayout.classList.remove('hidden');
}

toggleAuthModeBtn.addEventListener('click', () => {
    isSignUpMode = !isSignUpMode;
    toggleAuthModeBtn.textContent = isSignUpMode ? "Already have an account? Log in" : "Don't have an account? Sign up";
    document.querySelector('.auth-box .primary-btn').textContent = isSignUpMode ? "Sign Up" : "Unlock";
});

// Mock Email/Password Auth
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (email && password.length >= 6) {
        // Mock authentication success
        state.user = { email };
        localStorage.setItem('dhruverse_user', JSON.stringify(state.user));
        showApp();
    } else {
        authMessage.textContent = "Invalid credentials. Password must be 6+ chars.";
        authMessage.classList.remove('hidden');
    }
});

// === Auth Logic (Supabase OAuth) ===
const googleOAuthBtn = document.getElementById('google-oauth-btn');
console.log("googleOAuthBtn element:", googleOAuthBtn);

if (googleOAuthBtn) {
    googleOAuthBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log("Google OAuth button clicked!");
        if (!supabaseClient) {
            console.error('Supabase client not initialized.');
            alert('Error: Supabase client not initialized.');
            return;
        }
        
        try {
            console.log("Attempting signInWithOAuth...");
            const { data, error } = await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: 'https://dhruverse.com'
                }
            });
            console.log("signInWithOAuth result:", { data, error });
            if (error) throw error;
        } catch (error) {
            console.error('OAuth error:', error);
            alert('Failed to initialize Google Login. Check console.');
        }
    });
} else {
    console.error("google-oauth-btn NOT FOUND in the DOM!");
}

// Session Restoration Check
async function checkSupabaseSession() {
    if (!supabaseClient) return;
    
    // Supabase automatically parses the URL hash after an OAuth redirect
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    
    if (session) {
        state.user = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || 'Dhruverse User'
        };
        localStorage.setItem('dhruverse_user', JSON.stringify(state.user));
        showApp();
    }
}

// Check session on load
checkSupabaseSession();
// === Navigation Logic ===
navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Update nav active state
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Show target view with animation
        const targetId = item.getAttribute('data-target');
        views.forEach(view => {
            view.classList.remove('active');
            view.classList.add('hidden');
        });
        
        const targetView = document.getElementById(targetId);
        targetView.classList.remove('hidden');
        // trigger reflow for animation
        void targetView.offsetWidth;
        targetView.classList.add('active');
    });
});

function updateDateHeaders() {
    const today = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    currentDateSubtitle.textContent = today.toLocaleDateString('en-US', options);
}

// === To-Do Logic ===
function renderTasks() {
    taskListEl.innerHTML = '';
    
    // Sort tasks: incomplete first
    const sortedTasks = [...state.tasks].sort((a, b) => a.completed - b.completed);
    
    if (sortedTasks.length === 0) {
        taskListEl.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No tasks for today. Take a break!</p>';
        return;
    }

    sortedTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item-container ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <button class="delete-task-bg-btn" data-id="${task.id}"><i class="ph ph-trash"></i></button>
            <div class="task-item ${task.completed ? 'completed' : ''}" id="task-item-${task.id}">
                <div class="checkbox-wrapper" data-id="${task.id}">
                    <i class="ph ${task.completed ? 'ph-check-square-offset' : 'ph-square'}"></i>
                </div>
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                </div>
                <button class="delete-task-btn icon-btn" data-id="${task.id}"><i class="ph ph-trash"></i></button>
            </div>
        `;
        taskListEl.appendChild(li);
        
        // Touch/Swipe Logic
        const taskItem = li.querySelector('.task-item');
        let touchStartX = 0;
        let touchEndX = 0;
        
        taskItem.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, {passive: true});
        
        taskItem.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe(taskItem, touchStartX, touchEndX);
        });
    });

    // Attach listeners
    document.querySelectorAll('.checkbox-wrapper').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            toggleTask(id);
        });
    });

    document.querySelectorAll('.delete-task-bg-btn, .delete-task-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            deleteTask(id);
        });
    });
    
    renderCalendarEventsForSelected();
}

function handleSwipe(element, start, end) {
    if (start - end > 40) { // Swiped left
        element.classList.add('swiped');
    } else if (end - start > 40) { // Swiped right
        element.classList.remove('swiped');
    }
}

function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        
        // Update stats if done today
        if (task.completed) {
            state.stats.tasksCompletedToday++;
        } else {
            state.stats.tasksCompletedToday = Math.max(0, state.stats.tasksCompletedToday - 1);
        }
        
        saveState();
        renderTasks();
        renderCalendar(); // Update calendar indicators
        updateInsights();
    }
}

function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveState();
    renderTasks();
    renderCalendar();
}

addTaskBtn.addEventListener('click', () => {
    taskModal.classList.remove('hidden');
    newTaskInput.focus();
});

cancelTaskBtn.addEventListener('click', () => {
    taskModal.classList.add('hidden');
    newTaskInput.value = '';
});

saveTaskBtn.addEventListener('click', () => {
    const title = newTaskInput.value.trim();
    if (title) {
        const newTask = {
            id: Date.now().toString(),
            title,
            completed: false,
            date: state.calendar.selectedDate.toISOString()
        };
        state.tasks.push(newTask);
        saveState();
        renderTasks();
        renderCalendar();
        taskModal.classList.add('hidden');
        newTaskInput.value = '';
    }
});


// === Calendar Logic ===
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

function renderCalendar() {
    calendarGrid.innerHTML = '';
    const { currentMonth, currentYear, selectedDate } = state.calendar;
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthYearDisplay.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const today = new Date();
    
    // Blank days for start of month
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDiv);
    }
    
    // Days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = day;
        
        const cellDate = new Date(currentYear, currentMonth, day);
        
        // Check if today
        if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
            dayDiv.classList.add('today');
        }
        
        // Check if selected
        if (day === selectedDate.getDate() && currentMonth === selectedDate.getMonth() && currentYear === selectedDate.getFullYear()) {
            dayDiv.classList.add('selected');
        }
        
        // Check for events/tasks on this day
        const hasEvent = state.tasks.some(t => {
            const tDate = new Date(t.date);
            return tDate.getDate() === day && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
        });
        
        if (hasEvent) {
            dayDiv.classList.add('has-event');
        }
        
        dayDiv.addEventListener('click', () => {
            state.calendar.selectedDate = cellDate;
            renderCalendar();
            renderCalendarEventsForSelected();
        });
        
        calendarGrid.appendChild(dayDiv);
    }
}

function renderCalendarEventsForSelected() {
    eventListEl.innerHTML = '';
    const sel = state.calendar.selectedDate;
    
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    selectedDateDisplay.textContent = sel.toLocaleDateString('en-US', options);
    
    const dayTasks = state.tasks.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getDate() === sel.getDate() && tDate.getMonth() === sel.getMonth() && tDate.getFullYear() === sel.getFullYear();
    });
    
    if (dayTasks.length === 0) {
        eventListEl.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.9rem;">No events.</p>';
        return;
    }
    
    dayTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.style.padding = '12px';
        li.innerHTML = `
            <div class="task-content">
                <div class="task-title" style="font-size: 0.9rem;">${task.title}</div>
            </div>
        `;
        eventListEl.appendChild(li);
    });
}

prevMonthBtn.addEventListener('click', () => {
    state.calendar.currentMonth--;
    if (state.calendar.currentMonth < 0) {
        state.calendar.currentMonth = 11;
        state.calendar.currentYear--;
    }
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    state.calendar.currentMonth++;
    if (state.calendar.currentMonth > 11) {
        state.calendar.currentMonth = 0;
        state.calendar.currentYear++;
    }
    renderCalendar();
});


// === Timer Logic ===
function updateTimerDisplay() {
    const minutes = Math.floor(state.timer.timeLeft / 60);
    const seconds = state.timer.timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    timerModeDisplay.textContent = state.timer.mode;
    
    // Update SVG Ring
    const totalDuration = state.timer.mode === 'Focus' ? state.timer.focusDuration * 60 : state.timer.breakDuration * 60;
    const offset = 691 - (state.timer.timeLeft / totalDuration) * 691;
    progressCircle.style.strokeDashoffset = offset;
}

function toggleTimer() {
    if (state.timer.isRunning) {
        clearInterval(state.timer.intervalId);
        state.timer.isRunning = false;
        timerToggleBtn.innerHTML = '<i class="ph ph-play"></i>';
    } else {
        state.timer.isRunning = true;
        timerToggleBtn.innerHTML = '<i class="ph ph-pause"></i>';
        state.timer.intervalId = setInterval(() => {
            state.timer.timeLeft--;
            if (state.timer.timeLeft <= 0) {
                // Switch mode
                if (state.timer.mode === 'Focus') {
                    // Completed focus session
                    state.stats.focusMinutesToday += state.timer.focusDuration;
                    saveState();
                    updateInsights();
                    
                    state.timer.mode = 'Break';
                    state.timer.timeLeft = state.timer.breakDuration * 60;
                } else {
                    state.timer.mode = 'Focus';
                    state.timer.timeLeft = state.timer.focusDuration * 60;
                }
                timerChime.play().catch(e => console.log('Audio play blocked:', e));
            }
            updateTimerDisplay();
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(state.timer.intervalId);
    state.timer.isRunning = false;
    timerToggleBtn.innerHTML = '<i class="ph ph-play"></i>';
    state.timer.mode = 'Focus';
    state.timer.timeLeft = state.timer.focusDuration * 60;
    updateTimerDisplay();
}

timerToggleBtn.addEventListener('click', toggleTimer);
timerResetBtn.addEventListener('click', resetTimer);

focusSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    state.timer.focusDuration = val;
    focusDurVal.textContent = val;
    if (!state.timer.isRunning && state.timer.mode === 'Focus') {
        state.timer.timeLeft = val * 60;
        updateTimerDisplay();
    }
});

breakSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    state.timer.breakDuration = val;
    breakDurVal.textContent = val;
    if (!state.timer.isRunning && state.timer.mode === 'Break') {
        state.timer.timeLeft = val * 60;
        updateTimerDisplay();
    }
});

// === Insights & Habits Logic ===
function updateInsights() {
    totalFocusTimeEl.textContent = `${state.stats.focusMinutesToday}m`;
    tasksCompletedCountEl.textContent = state.stats.tasksCompletedToday;
    
    // Calculate a mock score based on 120m focus + 5 tasks = 100%
    const scoreFocus = Math.min((state.stats.focusMinutesToday / 120) * 50, 50);
    const scoreTasks = Math.min((state.stats.tasksCompletedToday / 5) * 50, 50);
    const totalScore = Math.round(scoreFocus + scoreTasks);
    
    productivityScoreEl.textContent = `${totalScore}%`;
    productivityBar.style.width = `${totalScore}%`;
}

function renderHabits() {
    habitListEl.innerHTML = '';
    state.habits.forEach(habit => {
        const li = document.createElement('li');
        li.className = `task-item ${habit.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <div class="checkbox-wrapper" data-id="${habit.id}">
                <i class="ph ${habit.completed ? 'ph-check-square-offset' : 'ph-square'}"></i>
            </div>
            <div class="task-content">
                <div class="task-title">${habit.title}</div>
            </div>
            <button class="delete-habit-btn icon-btn" data-id="${habit.id}"><i class="ph ph-trash"></i></button>
        `;
        habitListEl.appendChild(li);
    });

    document.querySelectorAll('#habit-list .checkbox-wrapper').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const h = state.habits.find(h => h.id === id);
            h.completed = !h.completed;
            saveState();
            renderHabits();
        });
    });

    document.querySelectorAll('.delete-habit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            state.habits = state.habits.filter(h => h.id !== id);
            saveState();
            renderHabits();
        });
    });
}

addHabitBtn.addEventListener('click', () => {
    const title = prompt("Enter a new daily habit:");
    if (title && title.trim()) {
        state.habits.push({ id: Date.now().toString(), title: title.trim(), completed: false });
        saveState();
        renderHabits();
    }
});

// Run Init
init();
