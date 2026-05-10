const state = {
    user: JSON.parse(localStorage.getItem('dhruverse_user')) || null,
    tasks: [],
    timer: {
        focusDuration: 25,
        breakDuration: 5,
        timeLeft: 25 * 60,
        isRunning: false,
        mode: 'Focus', 
        intervalId: null
    },
    calendar: {
        currentMonth: new Date().getMonth(),
        currentYear: new Date().getFullYear(),
        selectedDate: new Date()
    },
    habits: [],
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
    localStorage.setItem('dhruverse_stats', JSON.stringify(state.stats));
}
const authScreen = document.getElementById('auth-screen');
const appLayout = document.getElementById('app-layout');
const authForm = document.getElementById('auth-form');
const authMessage = document.getElementById('auth-message');
const toggleAuthModeBtn = document.getElementById('toggle-auth-mode');
let isSignUpMode = false;
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');
const currentDateTitle = document.getElementById('current-date-title');
const currentDateSubtitle = document.getElementById('current-date-subtitle');
const taskListEl = document.getElementById('task-list');
const addTaskBtn = document.getElementById('add-task-btn');
const taskModal = document.getElementById('task-modal');
const saveTaskBtn = document.getElementById('save-task-btn');
const cancelTaskBtn = document.getElementById('cancel-task-btn');
const newTaskInput = document.getElementById('new-task-title');
const calendarGrid = document.getElementById('calendar-grid');
const monthYearDisplay = document.getElementById('month-year-display');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const selectedDateDisplay = document.getElementById('selected-date-display');
const eventListEl = document.getElementById('event-list');
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
const totalFocusTimeEl = document.getElementById('total-focus-time');
const tasksCompletedCountEl = document.getElementById('tasks-completed-count');
const productivityScoreEl = document.getElementById('productivity-score');
const productivityBar = document.getElementById('productivity-bar');
const habitListEl = document.getElementById('habit-list');
const addHabitBtn = document.getElementById('add-habit-btn');
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
const i18n = {
    en: { settings: "Settings", changePhoto: "Change Photo", theme: "Theme", language: "Language", logout: "Log Out" },
    es: { settings: "Ajustes", changePhoto: "Cambiar Foto", theme: "Tema", language: "Idioma", logout: "Cerrar Sesión" },
    fr: { settings: "Paramètres", changePhoto: "Changer Photo", theme: "Thème", language: "Langue", logout: "Déconnexion" }
};
function loadPreferences() {
    const isLightMode = localStorage.getItem('dhruverse_theme') === 'light';
    if (isLightMode) {
        document.documentElement.setAttribute('data-theme', 'light');
        themeToggle.checked = true;
        themeKnob.style.transform = 'translateX(24px)';
    }
    const lang = localStorage.getItem('dhruverse_language') || 'en';
    languageSelect.value = lang;
    applyLanguage(lang);
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
        reader.onload = async (event) => {
            const base64Str = event.target.result;
            localStorage.setItem('dhruverse_profile_pic', base64Str);
            setProfilePicUI(base64Str);
            
            if (state.user && supabaseClient) {
                try {
                    const { error } = await supabaseClient
                        .from('profiles')
                        .update({ avatar_url: base64Str })
                        .eq('id', state.user.id);
                    if (error) throw error;
                } catch (err) {
                    console.error("Error saving profile picture to Supabase:", err);
                }
            }
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
function init() {
    checkNewDay();
    loadPreferences();
    updateDateHeaders();
    if (state.user) {
        showApp();
    } else {
        showAuth();
    }
    renderTasks();
    renderCalendar();
    renderHabits();
    updateInsights();
    updateTimerDisplay();
}
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
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (email && password.length >= 6) {
        state.user = { email };
        localStorage.setItem('dhruverse_user', JSON.stringify(state.user));
        showApp();
    } else {
        authMessage.textContent = "Invalid credentials. Password must be 6+ chars.";
        authMessage.classList.remove('hidden');
    }
});
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
                    redirectTo: 'https://dhruverse.vercel.app'
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
function setupSupabaseAuth() {
    if (!supabaseClient) return;
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (session) {
            let fullName = session.user.user_metadata?.full_name || 'Dhruverse User';
            let avatarUrl = session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture || null;
            try {
                const { data, error } = await supabaseClient
                    .from('profiles')
                    .select('full_name, avatar_url')
                    .eq('id', session.user.id)
                    .single();
                if (!error && data) {
                    if (data.full_name) fullName = data.full_name;
                    if (data.avatar_url) avatarUrl = data.avatar_url;
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
            }
            state.user = {
                id: session.user.id,
                email: session.user.email,
                name: fullName,
                avatar: avatarUrl
            };
            if (state.user.avatar) {
                setProfilePicUI(state.user.avatar);
            } else {
                const savedPic = localStorage.getItem('dhruverse_profile_pic');
                if (savedPic) setProfilePicUI(savedPic);
            }
            localStorage.setItem('dhruverse_user', JSON.stringify(state.user));
            showApp();
            fetchData();
        } else {
            state.user = null;
            localStorage.removeItem('dhruverse_user');
            showAuth();
        }
    });
}
setupSupabaseAuth();
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        const targetId = item.getAttribute('data-target');
        views.forEach(view => {
            view.classList.remove('active');
            view.classList.add('hidden');
        });
        const targetView = document.getElementById(targetId);
        targetView.classList.remove('hidden');
        void targetView.offsetWidth;
        targetView.classList.add('active');
    });
});
function updateDateHeaders() {
    const today = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    currentDateSubtitle.textContent = today.toLocaleDateString('en-US', options);
}
async function fetchData() {
    if (!supabaseClient || !state.user) return;
    try {
        const { data: tasksData, error: tasksError } = await supabaseClient
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });
        if (tasksError) throw tasksError;
        state.tasks = tasksData || [];
        const { data: habitsData, error: habitsError } = await supabaseClient
            .from('habits')
            .select('*')
            .order('created_at', { ascending: true });
        if (habitsError) throw habitsError;
        state.habits = habitsData || [];
        renderTasks();
        renderHabits();
        renderCalendar();
    } catch (err) {
        console.error("Error fetching data:", err);
    }
}
function renderTasks() {
    taskListEl.innerHTML = '';
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
    if (start - end > 40) { 
        element.classList.add('swiped');
    } else if (end - start > 40) { 
        element.classList.remove('swiped');
    }
}
async function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        if (task.completed) {
            state.stats.tasksCompletedToday++;
        } else {
            state.stats.tasksCompletedToday = Math.max(0, state.stats.tasksCompletedToday - 1);
        }
        saveState();
        renderTasks();
        renderCalendar();
        updateInsights();
        if (id.toString().startsWith('temp-')) return;
        try {
            const { error } = await supabaseClient
                .from('tasks')
                .update({ completed: task.completed })
                .eq('id', id);
            if (error) throw error;
        } catch (err) {
            console.error("Error toggling task:", err);
            task.completed = !task.completed; 
            renderTasks();
        }
    }
}
async function deleteTask(id) {
    const previousTasks = [...state.tasks];
    state.tasks = state.tasks.filter(t => t.id !== id);
    renderTasks();
    renderCalendar();
    if (id.toString().startsWith('temp-')) return;
    try {
        const { error } = await supabaseClient
            .from('tasks')
            .delete()
            .eq('id', id);
        if (error) throw error;
    } catch (err) {
        console.error("Error deleting task:", err);
        state.tasks = previousTasks; 
        renderTasks();
    }
}
addTaskBtn.addEventListener('click', () => {
    taskModal.classList.remove('hidden');
    newTaskInput.focus();
});
cancelTaskBtn.addEventListener('click', () => {
    taskModal.classList.add('hidden');
    newTaskInput.value = '';
});
saveTaskBtn.addEventListener('click', async () => {
    const title = newTaskInput.value.trim();
    if (title && supabaseClient && state.user) {
        const tempId = 'temp-' + Date.now();
        const newTask = {
            id: tempId,
            title,
            completed: false,
            created_at: new Date().toISOString()
        };
        state.tasks.unshift(newTask);
        renderTasks();
        renderCalendar();
        taskModal.classList.add('hidden');
        newTaskInput.value = '';
        try {
            const { data, error } = await supabaseClient
                .from('tasks')
                .insert([{ user_id: state.user.id, title, completed: false }])
                .select()
                .single();
            if (error) throw error;
            state.tasks = state.tasks.map(t => t.id === tempId ? data : t);
            renderTasks();
        } catch (err) {
            console.error("Error adding task:", err);
            state.tasks = state.tasks.filter(t => t.id !== tempId); 
            renderTasks();
            alert("Failed to save task to database.");
        }
    } else if (!state.user) {
        alert("Please log in to save tasks.");
    }
});
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
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDiv);
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        dayDiv.textContent = day;
        const cellDate = new Date(currentYear, currentMonth, day);
        if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
            dayDiv.classList.add('today');
        }
        if (day === selectedDate.getDate() && currentMonth === selectedDate.getMonth() && currentYear === selectedDate.getFullYear()) {
            dayDiv.classList.add('selected');
        }
        const hasEvent = state.tasks.some(t => {
            const tDate = new Date(t.created_at || t.date);
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
        const tDate = new Date(t.created_at || t.date);
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
function updateTimerDisplay() {
    const minutes = Math.floor(state.timer.timeLeft / 60);
    const seconds = state.timer.timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    timerModeDisplay.textContent = state.timer.mode;
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
                if (state.timer.mode === 'Focus') {
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
function updateInsights() {
    totalFocusTimeEl.textContent = `${state.stats.focusMinutesToday}m`;
    tasksCompletedCountEl.textContent = state.stats.tasksCompletedToday;
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
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const h = state.habits.find(h => h.id === id);
            h.completed = !h.completed;
            renderHabits();
            if (id.toString().startsWith('temp-')) return;
            try {
                const { error } = await supabaseClient
                    .from('habits')
                    .update({ completed: h.completed })
                    .eq('id', id);
                if (error) throw error;
            } catch (err) {
                console.error("Error toggling habit:", err);
                h.completed = !h.completed;
                renderHabits();
            }
        });
    });
    document.querySelectorAll('.delete-habit-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const prevHabits = [...state.habits];
            state.habits = state.habits.filter(h => h.id !== id);
            renderHabits();
            if (id.toString().startsWith('temp-')) return;
            try {
                const { error } = await supabaseClient
                    .from('habits')
                    .delete()
                    .eq('id', id);
                if (error) throw error;
            } catch (err) {
                console.error("Error deleting habit:", err);
                state.habits = prevHabits;
                renderHabits();
            }
        });
    });
}
addHabitBtn.addEventListener('click', async () => {
    const title = prompt("Enter a new daily habit:");
    if (title && title.trim() && supabaseClient && state.user) {
        const tempId = 'temp-' + Date.now();
        const newHabit = { id: tempId, title: title.trim(), completed: false };
        state.habits.push(newHabit);
        renderHabits();
        try {
            const { data, error } = await supabaseClient
                .from('habits')
                .insert([{ user_id: state.user.id, title: title.trim(), completed: false }])
                .select()
                .single();
            if (error) throw error;
            state.habits = state.habits.map(h => h.id === tempId ? data : h);
            renderHabits();
        } catch (err) {
            console.error("Error adding habit:", err);
            state.habits = state.habits.filter(h => h.id !== tempId);
            renderHabits();
            alert("Failed to save habit to database.");
        }
    } else if (!state.user) {
        alert("Please log in to save habits.");
    }
});
const miniTimerDisplay = document.getElementById('mini-timer-display');
const miniTimerToggle = document.getElementById('mini-timer-toggle');
const presetBtns = document.querySelectorAll('.preset-btn');
let miniTimerInterval = null;
let miniTimeLeft = 25 * 60;
let isMiniTimerRunning = false;
function updateMiniTimerUI() {
    const m = Math.floor(miniTimeLeft / 60);
    const s = miniTimeLeft % 60;
    miniTimerDisplay.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
presetBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (isMiniTimerRunning) return;
        presetBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        miniTimeLeft = parseInt(e.target.getAttribute('data-time')) * 60;
        updateMiniTimerUI();
    });
});
miniTimerToggle.addEventListener('click', () => {
    if (isMiniTimerRunning) {
        clearInterval(miniTimerInterval);
        isMiniTimerRunning = false;
        miniTimerToggle.innerHTML = '<i class="ph ph-play" style="font-size: 1.5rem;"></i>';
        document.body.classList.remove('timer-active-glow');
    } else {
        isMiniTimerRunning = true;
        miniTimerToggle.innerHTML = '<i class="ph ph-pause" style="font-size: 1.5rem;"></i>';
        document.body.classList.add('timer-active-glow');
        miniTimerInterval = setInterval(() => {
            miniTimeLeft--;
            if (miniTimeLeft <= 0) {
                clearInterval(miniTimerInterval);
                isMiniTimerRunning = false;
                miniTimerToggle.innerHTML = '<i class="ph ph-play" style="font-size: 1.5rem;"></i>';
                document.body.classList.remove('timer-active-glow');
                miniTimeLeft = 25 * 60;
                presetBtns.forEach(b => b.classList.remove('active'));
                presetBtns[0].classList.add('active');
            }
            updateMiniTimerUI();
        }, 1000);
    }
});
init();
