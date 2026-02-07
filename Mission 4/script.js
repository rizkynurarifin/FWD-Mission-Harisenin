// Inisialisasi Data
let tasks = JSON.parse(localStorage.getItem('todo_separated_v1')) || [];
let currentTab = 'todo';
let editId = null;

// Jalankan saat dokumen dimuat
document.addEventListener('DOMContentLoaded', () => {
    updateDate();
    document.getElementById('deadline-input').value = new Date().toISOString().split('T')[0];
    render();
});

// Update Tanggal di Sidebar
function updateDate() {
    const now = new Date();
    document.getElementById('day-now').innerText = now.toLocaleDateString('en-US', { weekday: 'long' });
    document.getElementById('date-now').innerText = now.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Ganti Tab
function switchTab(tab) {
    currentTab = tab;
    const tabIds = ['todo', 'done', 'overdue'];

    tabIds.forEach(t => {
        const el = document.getElementById(`tab-${t}`);
        const badge = document.getElementById(`count-${t}`);

        if (t === tab) {
            el.classList.add('active-tab');
            el.classList.remove('inactive-tab', 'border-transparent');
            badge.classList.add('active-badge');
            badge.classList.remove('inactive-badge');
        } else {
            el.classList.remove('active-tab');
            el.classList.add('inactive-tab', 'border-transparent');
            badge.classList.remove('active-badge');
            badge.classList.add('inactive-badge');
        }
    });
    render();
}

// Tambah/Update Task
function addTask() {
    const text = document.getElementById('task-input').value.trim();
    const priority = document.getElementById('priority-input').value;
    const deadline = document.getElementById('deadline-input').value;

    if (!text) return;

    if (editId) {
        tasks = tasks.map(t => t.id === editId ? { ...t, text, priority, deadline } : t);
        editId = null;
        document.getElementById('submit-btn').innerText = "Add to List";
    } else {
        tasks.push({ id: Date.now(), text, priority, deadline, completed: false });
    }

    saveData();
    document.getElementById('task-input').value = '';
}

// Simpan ke LocalStorage
function saveData() {
    localStorage.setItem('todo_separated_v1', JSON.stringify(tasks));
    render();
}

// Hapus Task
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveData();
}

// Edit Task
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    document.getElementById('task-input').value = task.text;
    document.getElementById('priority-input').value = task.priority;
    document.getElementById('deadline-input').value = task.deadline;
    editId = id;
    document.getElementById('submit-btn').innerText = "Update Task";
}

// Toggle Selesai
function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveData();
}

// Hapus Semua berdasarkan kategori
function deleteAll() {
    if (confirm("Clear current list?")) {
        const today = new Date().setHours(0, 0, 0, 0);
        if (currentTab === 'todo') tasks = tasks.filter(t => t.completed || new Date(t.deadline).setHours(0, 0, 0, 0) < today);
        else if (currentTab === 'done') tasks = tasks.filter(t => !t.completed);
        else tasks = tasks.filter(t => t.completed || new Date(t.deadline).setHours(0, 0, 0, 0) >= today);
        saveData();
    }
}

// Update Badge Count
function updateBadges() {
    const today = new Date().setHours(0, 0, 0, 0);
    document.getElementById('count-todo').innerText = tasks.filter(t => !t.completed && new Date(t.deadline).setHours(0, 0, 0, 0) >= today).length;
    document.getElementById('count-done').innerText = tasks.filter(t => t.completed).length;
    document.getElementById('count-overdue').innerText = tasks.filter(t => !t.completed && new Date(t.deadline).setHours(0, 0, 0, 0) < today).length;
}

// Render Kartu ke Layar
function render() {
    const container = document.getElementById('task-container');
    container.innerHTML = '';
    const today = new Date().setHours(0, 0, 0, 0);
    updateBadges();

    const filtered = tasks.filter(t => {
        const isOverdue = !t.completed && new Date(t.deadline).setHours(0, 0, 0, 0) < today;
        if (currentTab === 'todo') return !t.completed && !isOverdue;
        if (currentTab === 'done') return t.completed;
        if (currentTab === 'overdue') return isOverdue;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="col-span-full py-28 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[3rem] bg-white/50">
                <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5">
                    <svg class="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                </div>
                <p class="font-bold uppercase tracking-[0.2em] text-[11px] text-slate-400">No tasks in ${currentTab} list</p>
                <p class="text-[10px] mt-2 text-slate-300 font-medium">Try adding some to keep productive!</p>
            </div>`;
        return;
    }

    filtered.forEach(t => {
        const pColor = { 'High': 'bg-red-500', 'Medium': 'bg-orange-400', 'Low': 'bg-emerald-500' }[t.priority];
        const pBg = { 'High': 'bg-red-50 text-red-600', 'Medium': 'bg-orange-50 text-orange-600', 'Low': 'bg-emerald-50 text-emerald-600' }[t.priority];

        container.innerHTML += `
            <div class="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-all h-64 flex flex-col relative group">
                <div class="flex justify-between items-start mb-3 shrink-0">
                    <div class="flex items-center gap-2 px-2.5 py-1 rounded-lg ${pBg} border border-current/5">
                        <span class="w-1.5 h-1.5 rounded-full ${pColor}"></span>
                        <span class="text-[9px] font-black uppercase tracking-tighter">${t.priority}</span>
                    </div>
                    <div class="flex gap-0.5">
                        <button onclick="editTask(${t.id})" class="p-1.5 text-slate-300 hover:text-indigo-600 transition-all"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-width="2.5" stroke-linecap="round"></path></svg></button>
                        <button onclick="deleteTask(${t.id})" class="p-1.5 text-slate-300 hover:text-red-500 transition-all"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2.5" stroke-linecap="round"></path></svg></button>
                    </div>
                </div>
                <div class="flex-1 overflow-y-auto card-text-scroll mb-3">
                    <p class="text-[14px] font-bold text-slate-700 leading-snug ${t.completed ? 'line-through text-slate-300' : ''}">${t.text}</p>
                </div>
                <div class="mt-auto border-t border-slate-50 pt-3 flex items-center justify-between shrink-0">
                    <label class="flex items-center gap-2 cursor-pointer group/check">
                        <div class="relative flex items-center">
                            <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTask(${t.id})" class="peer appearance-none w-5 h-5 rounded-md border-2 border-slate-200 checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer">
                            <svg class="absolute w-3.5 h-3.5 text-white left-0.5 hidden peer-checked:block pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                        </div>
                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover/check:text-indigo-600 transition-colors">Done</span>
                    </label>
                    <div class="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">
                        <span class="text-[10px] grayscale">📅</span>
                        <span class="text-[9px] font-bold text-slate-500">${t.deadline}</span>
                    </div>
                </div>
            </div>`;
    });
}