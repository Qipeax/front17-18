if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("ServiceWorker зарегистрирован:", registration.scope);
    } catch (err) {
      console.error("Ошибка регистрации:", err);
    }
  });
}
document.addEventListener("DOMContentLoaded", function () {
  const noteInput = document.getElementById("note-input");
  const addButton = document.getElementById("addbutton");
  const notesList = document.getElementById("notes-list");
  const offlineBanner = document.getElementById("offline-banner");

  function updateOnlineStatus() {
    if (navigator.onLine) {
      offlineBanner.style.display = "none";
    } else {
      offlineBanner.style.display = "block";
    }
  }

  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
  updateOnlineStatus();

  function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notesList.innerHTML = '';
    
    notes.forEach((note, index) => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note';
        noteElement.innerHTML = `
            <p class="note-text">${note.text}</p>
            <button class="note-edit" data-index="${index}">Изменить</button>
            <button class="note-remove" data-index="${index}">Удалить</button>
        `;
        notesList.appendChild(noteElement);
    });

    document.querySelectorAll(".note-remove").forEach((button) => {
      button.addEventListener("click", function () {
        const index = parseInt(this.getAttribute("data-index"));
        removeNote(index);
      });
    });
  }

  document.querySelectorAll('.note-edit').forEach(button => {
    button.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        editNote(index);
    });
});

  function addNote() {
    const text = noteInput.value.trim();
    if (text === "") return;

    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.push({ text });
    localStorage.setItem("notes", JSON.stringify(notes));

    noteInput.value = "";
    loadNotes();
  }

  // Удаление заметки
  function removeNote(index) {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    notes.splice(index, 1);
    localStorage.setItem("notes", JSON.stringify(notes));
    loadNotes();
  }

  function editNote(index) {
    const notes = JSON.parse(localStorage.getItem("notes")) || [];
    const noteElement = notesList.children[index];
    const textElement = noteElement.querySelector(".note-text");

    // Если уже в режиме редактирования - сохраняем
    if (noteElement.classList.contains("edit-mode")) {
      const newText = textElement.querySelector("input").value.trim();
      if (newText) {
        notes[index].text = newText;
        localStorage.setItem("notes", JSON.stringify(notes));
      }
      loadNotes(); // Перезагружаем список
      return;
    }

    // Входим в режим редактирования
    noteElement.classList.add("edit-mode");
    const currentText = notes[index].text;
    textElement.innerHTML = `
        <input type="text" value="${currentText}" class="edit-input">
    `;

    // Меняем текст кнопки на "Сохранить"
    const editButton = noteElement.querySelector(".note-edit");
    editButton.textContent = "Сохранить";

    // Фокус на поле ввода
    textElement.querySelector("input").focus();
  }

  // Обработчики событий
  addButton.addEventListener("click", addNote);
  noteInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      addNote();
    }
  });

  loadNotes();
});
