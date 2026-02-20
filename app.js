/*
╔══════════════════════════════════════════════════════════════════════════════╗
║                       PLANNING DU JOUR - APPLICATION                         ║
╚══════════════════════════════════════════════════════════════════════════════╝
*/


/* ═══════════════════════════════════════════════════════════════════════════
   CONFIGURATION
   ═══════════════════════════════════════════════════════════════════════════ */

const CONFIG = {
    storageKey: 'planning-du-jour-v2',

    hours: [
        '06H00', '07H00', '08H00', '09H00', '10H00', '11H00',
        '12H00', '13H00', '14H00', '15H00', '16H00', '17H00',
        '18H00', '19H00', '20H00', '21H00'
    ],

    weekDays: [
        'Dimanche', 'Lundi', 'Mardi', 'Mercredi',
        'Jeudi', 'Vendredi', 'Samedi'
    ],

    months: [
        'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
        'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ],

    defaultTasks: 5
};


/* ═══════════════════════════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════════════════════════ */

let currentDate = new Date();


/* ═══════════════════════════════════════════════════════════════════════════
   DOM ELEMENTS
   ═══════════════════════════════════════════════════════════════════════════ */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const DOM = {
    // Navigation
    btnPrev:         $('#btn-prev'),
    btnNext:         $('#btn-next'),
    btnToday:        $('#btn-today'),
    datePicker:      $('#date-picker'),
    weekdayName:     $('#weekday-name'),
    fullDate:        $('#full-date'),
    dayButtons:      $$('.nav__day'),

    // Content
    scheduleContainer: $('#schedule-container'),
    todosContainer:    $('#todos-container'),
    goalsContainer:    $('#goals-container'),

    // Buttons
    btnAddTodo:      $('#btn-add-todo'),
    btnAddGoal:      $('#btn-add-goal'),

    // Toast
    toast:           $('#toast-save')
};


/* ═══════════════════════════════════════════════════════════════════════════
   STORAGE
   ═══════════════════════════════════════════════════════════════════════════ */

const Storage = {

    /**
     * Récupère toutes les données
     */
    getAll() {
        try {
            const data = localStorage.getItem(CONFIG.storageKey);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Erreur lecture localStorage:', error);
            return {};
        }
    },

    /**
     * Sauvegarde toutes les données
     */
    saveAll(data) {
        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Erreur écriture localStorage:', error);
            return false;
        }
    },

    /**
     * Récupère les données d'un jour
     */
    getDay(date) {
        const key = Utils.formatDateKey(date);
        const allData = this.getAll();
        return allData[key] || {
            schedule: {},
            todos: [],
            goals: []
        };
    },

    /**
     * Sauvegarde les données d'un jour
     */
    saveDay(date, dayData) {
        const key = Utils.formatDateKey(date);
        const allData = this.getAll();
        allData[key] = dayData;

        if (this.saveAll(allData)) {
            UI.showToast();
            return true;
        }
        return false;
    }
};


/* ═══════════════════════════════════════════════════════════════════════════
   UTILS
   ═══════════════════════════════════════════════════════════════════════════ */

const Utils = {

    /**
     * Formate une date en clé de stockage (YYYY-MM-DD)
     */
    formatDateKey(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    },

    /**
     * Formate une date en français
     */
    formatDateFull(date) {
        const day = date.getDate();
        const month = CONFIG.months[date.getMonth()];
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    },

    /**
     * Vérifie si deux dates sont dans la même semaine
     */
    isSameWeek(date1, date2) {
        const getWeekStart = (d) => {
            const date = new Date(d);
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            date.setDate(diff);
            date.setHours(0, 0, 0, 0);
            return date.getTime();
        };
        return getWeekStart(date1) === getWeekStart(date2);
    },

    /**
     * Échappe le HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }
};


/* ═══════════════════════════════════════════════════════════════════════════
   UI
   ═══════════════════════════════════════════════════════════════════════════ */

const UI = {

    /**
     * Affiche le toast de sauvegarde
     */
    showToast() {
        DOM.toast.classList.add('is-visible');
        setTimeout(() => {
            DOM.toast.classList.remove('is-visible');
        }, 1500);
    },

    /**
     * Met à jour l'affichage de la date
     */
    updateDateDisplay() {
        // Input date
        DOM.datePicker.value = Utils.formatDateKey(currentDate);

        // Nom du jour
        DOM.weekdayName.textContent = CONFIG.weekDays[currentDate.getDay()];

        // Date complète
        DOM.fullDate.textContent = Utils.formatDateFull(currentDate);

        // Boutons des jours
        this.updateWeekButtons();
    },

    /**
     * Met à jour les boutons des jours de la semaine
     */
    updateWeekButtons() {
        const today = new Date();
        const currentDayOfWeek = currentDate.getDay();
        const todayDayOfWeek = today.getDay();
        const sameWeek = Utils.isSameWeek(currentDate, today);

        DOM.dayButtons.forEach(btn => {
            const btnDay = parseInt(btn.dataset.day);

            btn.classList.remove('is-active', 'is-today');

            if (btnDay === currentDayOfWeek) {
                btn.classList.add('is-active');
            }

            if (btnDay === todayDayOfWeek && sameWeek) {
                btn.classList.add('is-today');
            }
        });
    }
};


/* ═══════════════════════════════════════════════════════════════════════════
   RENDER
   ═══════════════════════════════════════════════════════════════════════════ */

const Render = {

    /**
     * Affiche le planning horaire
     */
    schedule(data = {}) {
        DOM.scheduleContainer.innerHTML = '';

        CONFIG.hours.forEach(hour => {
            const row = document.createElement('div');
            row.className = 'schedule__row';
            row.innerHTML = `
                <span class="schedule__time">${hour}</span>
                <input
                    type="text"
                    class="schedule__input"
                    placeholder="..."
                    value="${Utils.escapeHtml(data[hour] || '')}"
                    data-hour="${hour}"
                >
            `;

            DOM.scheduleContainer.appendChild(row);

            // Events
            const input = row.querySelector('.schedule__input');
            input.addEventListener('input', App.save);
            input.addEventListener('blur', App.save);
        });
    },

    /**
     * Affiche les tâches (todos ou goals)
     */
    tasks(container, items = [], type) {
        container.innerHTML = '';

        // Par défaut, affiche des tâches vides
        if (items.length === 0) {
            items = Array(CONFIG.defaultTasks)
                .fill(null)
                .map(() => ({ text: '', done: false }));
        }

        items.forEach((item) => {
            this.addTask(container, item, type);
        });
    },

    /**
     * Ajoute une tâche
     */
    addTask(container, data = { text: '', done: false }, type) {
        const li = document.createElement('li');
        li.className = 'task';
        li.innerHTML = `
            <label class="task__checkbox">
                <input type="checkbox" ${data.done ? 'checked' : ''}>
                <span class="task__checkmark"></span>
            </label>
            <input
                type="text"
                class="task__text ${data.done ? 'is-done' : ''}"
                placeholder="..."
                value="${Utils.escapeHtml(data.text || '')}"
            >
            <button class="task__delete" aria-label="Supprimer">&times;</button>
        `;

        container.appendChild(li);

        // Éléments
        const checkbox = li.querySelector('input[type="checkbox"]');
        const textInput = li.querySelector('.task__text');
        const deleteBtn = li.querySelector('.task__delete');

        // Events
        checkbox.addEventListener('change', () => {
            textInput.classList.toggle('is-done', checkbox.checked);
            App.save();
        });

        textInput.addEventListener('input', App.save);
        textInput.addEventListener('blur', App.save);

        deleteBtn.addEventListener('click', () => {
            li.remove();
            App.save();
        });

        return li;
    }
};


/* ═══════════════════════════════════════════════════════════════════════════
   APP
   ═══════════════════════════════════════════════════════════════════════════ */

const App = {

    /**
     * Initialisation
     */
    init() {
        this.load();
        this.setupEvents();
        this.setupAutoSave();

        console.log('✨ Planning du Jour initialisé');
        console.log('⌨️  Raccourcis: Alt+← | Alt+→ | Alt+T');
    },

    /**
     * Charge le jour courant
     */
    load() {
        const data = Storage.getDay(currentDate);

        UI.updateDateDisplay();
        Render.schedule(data.schedule);
        Render.tasks(DOM.todosContainer, data.todos, 'todos');
        Render.tasks(DOM.goalsContainer, data.goals, 'goals');
    },

    /**
     * Sauvegarde le jour courant
     */
    save() {
        const data = App.collectData();
        Storage.saveDay(currentDate, data);
    },

    /**
     * Collecte les données actuelles
     */
    collectData() {
        // Schedule
        const schedule = {};
        $$('.schedule__input').forEach(input => {
            const value = input.value.trim();
            if (value) {
                schedule[input.dataset.hour] = value;
            }
        });

        // Todos
        const todos = [];
        $$('#todos-container .task').forEach(task => {
            const text = task.querySelector('.task__text').value.trim();
            const done = task.querySelector('input[type="checkbox"]').checked;
            if (text) {
                todos.push({ text, done });
            }
        });

        // Goals
        const goals = [];
        $$('#goals-container .task').forEach(task => {
            const text = task.querySelector('.task__text').value.trim();
            const done = task.querySelector('input[type="checkbox"]').checked;
            if (text) {
                goals.push({ text, done });
            }
        });

        return { schedule, todos, goals };
    },

    /**
     * Navigation vers une date
     */
    goToDate(date) {
        this.save();
        currentDate = date;
        this.load();
    },

    /**
     * Navigation relative
     */
    goToOffset(days) {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + days);
        this.goToDate(newDate);
    },

    /**
     * Navigation vers un jour de la semaine
     */
    goToWeekday(targetDay) {
        const currentDay = currentDate.getDay();
        const diff = targetDay - currentDay;
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + diff);
        this.goToDate(newDate);
    },

    /**
     * Configure les événements
     */
    setupEvents() {
        // Navigation
        DOM.btnPrev.addEventListener('click', () => this.goToOffset(-1));
        DOM.btnNext.addEventListener('click', () => this.goToOffset(1));
        DOM.btnToday.addEventListener('click', () => this.goToDate(new Date()));

        // Date picker
        DOM.datePicker.addEventListener('change', (e) => {
            const [y, m, d] = e.target.value.split('-').map(Number);
            this.goToDate(new Date(y, m - 1, d));
        });

        // Jours de la semaine
        DOM.dayButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.goToWeekday(parseInt(btn.dataset.day));
            });
        });

        // Ajout de tâches
        DOM.btnAddTodo.addEventListener('click', () => {
            const task = Render.addTask(DOM.todosContainer, {}, 'todos');
            task.querySelector('.task__text').focus();
            this.save();
        });

        DOM.btnAddGoal.addEventListener('click', () => {
            const task = Render.addTask(DOM.goalsContainer, {}, 'goals');
            task.querySelector('.task__text').focus();
            this.save();
        });

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            if (!e.altKey) return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.goToOffset(-1);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.goToOffset(1);
                    break;
                case 't':
                case 'T':
                    e.preventDefault();
                    this.goToDate(new Date());
                    break;
            }
        });

        // Swipe mobile
        let touchStartX = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].screenX;

            if (Math.abs(diff) > 80) {
                this.goToOffset(diff > 0 ? 1 : -1);
            }
        }, { passive: true });
    },

    /**
     * Configure la sauvegarde automatique
     */
    setupAutoSave() {
        // Avant fermeture
        window.addEventListener('beforeunload', () => this.save());

        // Perte de focus
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.save();
            }
        });

        // Toutes les 30 secondes
        setInterval(() => this.save(), 30000);
    }
};


/* ═══════════════════════════════════════════════════════════════════════════
   DÉMARRAGE
   ═══════════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => App.init());
