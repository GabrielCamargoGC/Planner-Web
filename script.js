
const firebaseConfig = {
    apiKey: "AIzaSyC2AtnDxjHzIkH8VqMIXzHoJdhFYPCIID4",
    authDomain: "planner-87ec0.firebaseapp.com",
    projectId: "planner-87ec0",
    storageBucket: "planner-87ec0.firebasestorage.app",
    messagingSenderId: "1097422360286",
    appId: "1:1097422360286:web:0fc54bf831e4b9b18e7c4f"
  };


firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();


let userId = null; 

auth.onAuthStateChanged(user => {
    if (user) {
        
        userId = user.uid;
        document.getElementById('welcomeMessage').textContent = `Olá, ${user.displayName || 'Usuário'}!`;
        startApp(); 
    } else {
        
        window.location.href = 'login.html';
    }
});


document.getElementById('logoutBtn').addEventListener('click', () => {
    auth.signOut();
});



function startApp() {
    
    const userDocRef = db.collection('planners').doc(userId);
    let allUserData = {}; 

    
    userDocRef.onSnapshot(doc => {
        if (doc.exists) {
            allUserData = doc.data();
            renderAll(allUserData);
        } else {
            console.log("Documento do usuário não encontrado, iniciando com dados padrão.");
            renderAll({}); 
        }
    }, error => {
        console.error("Erro ao ouvir o documento:", error);
    });

    
    function renderAll(data) {
        renderSchedule(data.schedule || []);
        renderWeeklyPlanner(data.weeklyTasks || {});
        renderDailyPlan(dailyDateInput.value, data.dailyPlans || {});
        renderHabits(data.habits || {});
        renderNotes(data.notes || []);
    }

    
    const tabs = document.querySelectorAll('nav button');
    const tabContents = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(item => item.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            tab.classList.add('active');
            const targetContentId = `content-${tab.id.split('-')[2]}`;
            document.getElementById(targetContentId).classList.add('active');
        });
    });
    
    
const tableBody = document.querySelector('#schedule-table tbody');
const addRowBtn = document.getElementById('addRowBtn');

const addTimeModal = document.getElementById('custom-prompt-modal');
const timeInput = document.getElementById('timeInput');
const confirmAddTimeBtn = document.getElementById('confirmAddTimeBtn');
const confirmModal = document.getElementById('custom-confirm-modal');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');


let rowIdToDelete = null;


function renderSchedule(scheduleData) {
    tableBody.innerHTML = ''; 
    if (!scheduleData || scheduleData.length === 0) return; 

    scheduleData.forEach(data => {
        const row = document.createElement('tr');
        row.dataset.rowId = data.id;
        row.innerHTML = `
            <td contenteditable="true">${data.time || ''}</td>
            <td contenteditable="true">${data.seg || ''}</td>
            <td contenteditable="true">${data.ter || ''}</td>
            <td contenteditable="true">${data.qua || ''}</td>
            <td contenteditable="true">${data.qui || ''}</td>
            <td contenteditable="true">${data.sex || ''}</td>
            <td contenteditable="true">${data.sab || ''}</td>
            <td contenteditable="true">${data.dom || ''}</td>
            <td><button class="delete-row-btn">🗑️</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function saveSchedule() {
    if (!userId) return; 
    const scheduleData = [];
    tableBody.querySelectorAll('tr').forEach(row => {
        const cells = row.querySelectorAll('td');
        if (row.dataset.rowId) { 
            scheduleData.push({
                id: row.dataset.rowId,
                time: cells[0].textContent, seg: cells[1].textContent, ter: cells[2].textContent,
                qua: cells[3].textContent, qui: cells[4].textContent, sex: cells[5].textContent,
                sab: cells[6].textContent, dom: cells[7].textContent
            });
        }
    });
    userDocRef.set({ schedule: scheduleData }, { merge: true });
}


addRowBtn.addEventListener('click', () => {
    timeInput.value = ''; 
    addTimeModal.style.display = 'flex';
    timeInput.focus();
});


confirmAddTimeBtn.addEventListener('click', () => {
    const time = timeInput.value.trim();
    if (time) {
        const newRow = { 
            id: `row-${Date.now()}`, 
            time: time, 
            seg: "", ter: "", qua: "", qui: "", sex: "", sab: "", dom: "" 
        };
        const currentSchedule = allUserData.schedule || [];
        userDocRef.set({ schedule: [...currentSchedule, newRow] }, { merge: true });
        addTimeModal.style.display = 'none'; 
    } else {
        alert("Por favor, digite um horário.");
    }
});



tableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-row-btn')) {
        rowIdToDelete = e.target.closest('tr').dataset.rowId;
        document.getElementById('confirmMessage').textContent = "Você tem certeza que deseja remover este horário?";
        confirmModal.style.display = 'flex';
    }
});


confirmDeleteBtn.addEventListener('click', () => {
    if (rowIdToDelete) {
        const updatedSchedule = allUserData.schedule.filter(row => row.id !== rowIdToDelete);
        userDocRef.set({ schedule: updatedSchedule }, { merge: true });
        rowIdToDelete = null; 
        confirmModal.style.display = 'none'; 
    }
});



tableBody.addEventListener('blur', (e) => {
    if (e.target.hasAttribute('contenteditable')) {
        saveSchedule();
    }
}, true);

function animateAndRemove(element, callback) {
    element.classList.add('item-removing');
    element.addEventListener('animationend', () => {
        element.remove();
        if (callback) callback();
    }, { once: true });
}

function initializeDefaultSchedule() {
    console.log("Inicializando grade padrão para novo usuário.");
    const defaultSchedule = [
        { id: `row-${Date.now()}-1`, time: "07:00 - 08:00", seg: "Estudar", ter: "", qua: "Estudar", qui: "", sex: "Estudar", sab: "", dom: "" },
        { id: `row-${Date.now()}-2`, time: "08:00 - 09:00", seg: "Café ☕️", ter: "Revisar", qua: "Café ☕️", qui: "Revisar", sex: "Café ☕️", sab: "Lazer", dom: "Lazer" },
        { id: `row-${Date.now()}-3`, time: "09:00 - 10:00", seg: "Estudar", ter: "", qua: "Estudar", qui: "", sex: "Estudar", sab: "", dom: "" }
    ];
    
    userDocRef.set({ schedule: defaultSchedule }, { merge: true });
}


function renderAll(data) {
    
    if (data.schedule === undefined) { 
        initializeDefaultSchedule();
    } else {
        renderSchedule(data.schedule);
    }
    
    renderWeeklyPlanner(data.weeklyTasks || {});
    renderDailyPlan(dailyDateInput.value, data.dailyPlans || {});
    renderHabits(data.habits || {});
    renderNotes(data.notes || []);
}

    
    const weeklyContainer = document.querySelector('.weekly-planner-container');
    const daysOfWeek = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
    const dayKeys = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

    function renderWeeklyPlanner(weeklyTasks) {
        weeklyContainer.innerHTML = '';
        daysOfWeek.forEach((day, index) => {
            const dayKey = dayKeys[index];
            const tasksForDay = weeklyTasks[dayKey] || [];
            const dayColumn = document.createElement('div');
            dayColumn.className = 'day-column';
            dayColumn.innerHTML = `<h3>${day}</h3><ul data-day="${dayKey}"></ul><div class="add-item-form"><input type="text" placeholder="Nova tarefa..."><button class="add-weekly-task-btn">+</button></div>`;
            const ul = dayColumn.querySelector('ul');
            tasksForDay.forEach(taskText => {
                const li = document.createElement('li');
                li.innerHTML = `<span>${taskText}</span><button class="delete-task-btn">x</button>`;
                ul.appendChild(li);
            });
            weeklyContainer.appendChild(dayColumn);
        });
    }

    weeklyContainer.addEventListener('click', (e) => {
        const currentTasks = allUserData.weeklyTasks || {};
        if (e.target.classList.contains('add-weekly-task-btn')) {
            const input = e.target.previousElementSibling;
            const dayKey = e.target.closest('.day-column').querySelector('ul').dataset.day;
            const taskText = input.value.trim();
            if (taskText) {
                const dayTasks = currentTasks[dayKey] || [];
                dayTasks.push(taskText);
                currentTasks[dayKey] = dayTasks;
                userDocRef.set({ weeklyTasks: currentTasks }, { merge: true });
                input.value = '';
            }
        }
        if (e.target.classList.contains('delete-task-btn')) {
            const taskText = e.target.previousElementSibling.textContent;
            const dayKey = e.target.closest('.day-column').querySelector('ul').dataset.day;
            currentTasks[dayKey] = currentTasks[dayKey].filter(t => t !== taskText);
            userDocRef.set({ weeklyTasks: currentTasks }, { merge: true });
        }
    });

    
    const dailyDateInput = document.getElementById('dailyDateInput');
    const prioritiesList = document.getElementById('prioritiesList');
    const todosList = document.getElementById('todosList');

    function renderDailyPlan(date, dailyPlans) {
        prioritiesList.innerHTML = '';
        todosList.innerHTML = '';
        const planForDay = dailyPlans[date] || { priorities: [], todos: [] };
        planForDay.priorities.forEach(item => prioritiesList.innerHTML += `<li><span>${item}</span><button class="delete-item-btn">x</button></li>`);
        planForDay.todos.forEach(item => todosList.innerHTML += `<li><span>${item}</span><button class="delete-item-btn">x</button></li>`);
    }

    function updateDailyPlan(type, action, value) {
        const date = dailyDateInput.value;
        if (!date) return;
        const currentPlans = allUserData.dailyPlans || {};
        if (!currentPlans[date]) currentPlans[date] = { priorities: [], todos: [] };
        
        if (action === 'add') {
            currentPlans[date][type].push(value);
        } else if (action === 'remove') {
            currentPlans[date][type] = currentPlans[date][type].filter(item => item !== value);
        }
        userDocRef.set({ dailyPlans: currentPlans }, { merge: true });
    }

    dailyDateInput.valueAsDate = new Date(); 
    dailyDateInput.addEventListener('change', () => renderDailyPlan(dailyDateInput.value, allUserData.dailyPlans || {}));
    document.getElementById('addPriorityBtn').addEventListener('click', () => {
        const input = document.getElementById('newPriorityInput');
        if (input.value.trim()) {
            updateDailyPlan('priorities', 'add', input.value.trim());
            input.value = '';
        }
    });
    document.getElementById('addTodoBtn').addEventListener('click', () => {
        const input = document.getElementById('newTodoInput');
        if (input.value.trim()) {
            updateDailyPlan('todos', 'add', input.value.trim());
            input.value = '';
        }
    });
    prioritiesList.addEventListener('click', e => {
        if (e.target.classList.contains('delete-item-btn')) {
            updateDailyPlan('priorities', 'remove', e.target.previousElementSibling.textContent);
        }
    });
    todosList.addEventListener('click', e => {
        if (e.target.classList.contains('delete-item-btn')) {
            updateDailyPlan('todos', 'remove', e.target.previousElementSibling.textContent);
        }
    });

    
    const habitsTableBody = document.getElementById('habits-table-body');
    const habitDays = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];


function renderHabits(habitsData) {
    habitsTableBody.innerHTML = '';
    for (const habitName in habitsData) {
        const row = document.createElement('tr');
        

        row.dataset.habitName = habitName;

        let cells = `<td>${habitName}</td>`;
        habitDays.forEach(day => {
            const isChecked = habitsData[habitName][day] || false;
            cells += `<td><input type="checkbox" class="habit-checkbox" data-day="${day}" ${isChecked ? 'checked' : ''}></td>`;
        });

        cells += `<td><button class="delete-habit-btn">🗑️</button></td>`;
        
        row.innerHTML = cells;
        habitsTableBody.appendChild(row);
    }
}
    
    document.getElementById('addHabitBtn').addEventListener('click', () => {
        const input = document.getElementById('newHabitInput');
        const habitName = input.value.trim();
        if (habitName) {
            const currentHabits = allUserData.habits || {};
            if (!currentHabits[habitName]) {
                currentHabits[habitName] = {};
                userDocRef.set({ habits: currentHabits }, { merge: true });
                input.value = '';
            } else {
                alert('Este hábito já existe.');
            }
        }
    });

    habitsTableBody.addEventListener('click', e => {
        if (e.target.classList.contains('habit-checkbox')) {
            const habitName = e.target.closest('tr')?.dataset.habitName;
            if (habitName) {
                const currentHabits = allUserData.habits || {};
                currentHabits[habitName][e.target.dataset.day] = e.target.checked;
                userDocRef.set({ habits: currentHabits }, { merge: true });
            }
        }
    

        if (e.target.classList.contains('delete-habit-btn')) {
            const rowToRemove = e.target.closest('tr');

            const habitNameToDelete = rowToRemove?.dataset.habitName;
    
            if (habitNameToDelete) {

                animateAndRemove(rowToRemove, () => {

                    const currentHabits = allUserData.habits || {};
                    delete currentHabits[habitNameToDelete];
                    userDocRef.set({ habits: currentHabits }, { merge: true });
                });
            } else {
                console.error("Não foi possível encontrar o nome do hábito para deletar.");
            }
        }
    });


    
const notesList = document.getElementById('notesList');
const noteInput = document.getElementById('noteInput');
const addNoteBtn = document.getElementById('addNoteBtn');


function renderNotes(notesData) {
    notesList.innerHTML = '';
    if (notesData) {
        notesData.forEach(noteText => {
            
            const li = createNoteElement(noteText);
            notesList.appendChild(li);
        });
    }
}


function createNoteElement(text) {
    const li = document.createElement('li');
    li.innerHTML = `<span>${text}</span><button class="delete-note-btn">x</button>`;
    return li;
}


addNoteBtn.addEventListener('click', () => {
    const text = noteInput.value.trim();
    if (text) {
       
        const newItem = createNoteElement(text);
        newItem.classList.add('item-added'); 
        notesList.appendChild(newItem);
        noteInput.value = '';

        
        const currentNotes = allUserData.notes || [];
        currentNotes.push(text);
        userDocRef.set({ notes: currentNotes }, { merge: true });
    }
});


notesList.addEventListener('click', e => {
    if (e.target.classList.contains('delete-note-btn')) {
        const liToRemove = e.target.parentElement;
        const textToRemove = liToRemove.querySelector('span').textContent;

        
        liToRemove.classList.add('item-removing');

        
        liToRemove.addEventListener('animationend', () => {
            liToRemove.remove(); 
            const updatedNotes = (allUserData.notes || []).filter(note => note !== textToRemove);
            userDocRef.set({ notes: updatedNotes }, { merge: true }); 
        }, { once: true }); 
    }
});

    
    
    document.querySelectorAll('.icon').forEach(icon => {
        icon.addEventListener('click', () => {
            navigator.clipboard.writeText(icon.textContent)
                .then(() => alert(`Ícone "${icon.textContent}" copiado!`))
                .catch(err => console.error('Erro ao copiar ícone: ', err));
        });
    });

    
    document.querySelectorAll('.modal-btn-cancel, .modal-overlay').forEach(element => {
        element.addEventListener('click', (event) => {
            if (event.target === element) { 
                document.querySelectorAll('.modal-overlay').forEach(modal => modal.style.display = 'none');
            }
        });
    });
}