
const firebaseConfig = {
  apiKey: "AIzaSyDVocKv9qantGFyijN3rbouEkpW_3AE-WE",
  authDomain: "mytodoapp-9aa37.firebaseapp.com",
  projectId: "mytodoapp-9aa37",
  storageBucket: "mytodoapp-9aa37.firebasestorage.app",
  messagingSenderId: "885434429026",
  appId: "1:885434429026:web:26ad6f19f9eb787d3d2b3b"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

const authSection = document.getElementById('auth-section');
const todoSection = document.getElementById('todo-section');
const userEmailDisplay = document.getElementById('user-email');
const clockDate = document.getElementById('clock-date');

let currentEditKey = null;

// Clock
function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString();
  const date = now.toLocaleDateString();
  clockDate.innerText = `${date} - ${time}`;
}
setInterval(updateClock, 1000);

// Show/hide clock and sections
auth.onAuthStateChanged(user => {
  if (user) {
    authSection.classList.add('hidden');
    todoSection.classList.remove('hidden');
    userEmailDisplay.innerText = user.email;
    clockDate.style.display = 'block';
    fetchTodos(user.uid);
  } else {
    authSection.classList.remove('hidden');
    todoSection.classList.add('hidden');
    userEmailDisplay.innerText = '';
    clockDate.style.display = 'none';
  }
});

// Auth
function signUp() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.createUserWithEmailAndPassword(email, password)
    .then(() => alert("Signup Successful"))
    .catch(err => alert(err.message));
}

function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => alert("Login Successful"))
    .catch(err => alert(err.message));
}

function logout() {
  auth.signOut();
}

// Todo actions
function addTodo() {
  const input = document.getElementById('todo-input');
  const todo = input.value.trim();
  if (!todo) return alert("Enter a todo");
  const uid = auth.currentUser.uid;
  db.ref('todos/' + uid).push({ text: todo });
  input.value = '';
}

function fetchTodos(uid) {
  const todoList = document.getElementById('todo-list');
  db.ref('todos/' + uid).on('value', snapshot => {
    todoList.innerHTML = '';
    snapshot.forEach(child => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.textContent = child.val().text;

      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.onclick = () => openModal(child.key, child.val().text);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.onclick = () => deleteTodo(child.key);

      li.appendChild(span);
      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
      todoList.appendChild(li);
    });
  });
}

function deleteTodo(key) {
  const uid = auth.currentUser.uid;
  db.ref('todos/' + uid + '/' + key).remove();
}

function deleteAllTodos() {
  const uid = auth.currentUser.uid;
  db.ref('todos/' + uid).remove();
}

// Modal Edit
function openModal(key, text) {
  currentEditKey = key;
  document.getElementById('edit-input').value = text;
  document.getElementById('edit-modal').classList.remove('hidden');
}

function closeModal() {
  currentEditKey = null;
  document.getElementById('edit-modal').classList.add('hidden');
}

function saveEdit() {
  const newText = document.getElementById('edit-input').value.trim();
  if (!newText || !currentEditKey) return;
  const uid = auth.currentUser.uid;
  db.ref('todos/' + uid + '/' + currentEditKey).update({ text: newText });
  closeModal();
}
