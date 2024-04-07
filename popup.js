document.addEventListener("DOMContentLoaded", function () {
  const db = new DBLocal();
  const textEntriesContainer = document.getElementById("textEntries");
  const inputText = document.getElementById("text-input");
  const saveButton = document.getElementById("saveButton");
  const updateButton = document.getElementById("updateButton");
  const cancelButton = document.getElementById("cancelButton");

  // Metodos CRUD
  async function addTextEntry(valueText) {
    if (!valueText.trim()) return;

    db.add(valueText.trim());
    inputText.value = "";
  }
  async function showTextEntries() {
    textEntriesContainer.innerHTML = "";
    let html = "";
    for (const item of db.dataLocal) {
      html += templateEntry(item);
    }
    textEntriesContainer.innerHTML = html;
  }
  async function updateTextEntry(id, text) {
    db.update(id, text);
  }
  async function deleteEntry(id){
    await db.delete(id);
  }

  // Eventos click: add, double click, update, cancel. change
  saveButton.addEventListener("click", async function () {
    const valueText = inputText.value;
    await addTextEntry(valueText);
    showSaveButtons()
    showTextEntries();
  });
  textEntriesContainer.addEventListener("dblclick", function (e) {
    if (e.target.tagName !== "P") return;
    inputText.value = e.target.innerText;

    updateButton.setAttribute("data-id", e.target.id);

    showSaveButtons(false);
  });
  textEntriesContainer.addEventListener("click", function (e) {
    e.preventDefault();
    if(e.target.tagName == "SPAN" && e.target.getAttribute("data-id") !== null){
        const id = e.target.getAttribute('data-id');
        deleteEntry(id);
        showTextEntries();
        return;
    }
    if (e.target.tagName !== "P") return;
    valueText = e.target.innerText;

    navigator.clipboard
      .writeText(valueText)
      .then(() => {})
      .catch((err) => {
        console.error("Error al copiar texto:", err);
      });
  });
  updateButton.addEventListener("click", async function (e) {
    const id = e.target.getAttribute("data-id");
    const updatedText = inputText.value;

    await updateTextEntry(id, updatedText);

    updateButton.removeAttribute("data-id");
    inputText.value = "";
    showSaveButtons();
    showTextEntries();
  });
  cancelButton.addEventListener("click", ()=>{
    inputText.value = "";
    showSaveButtons();
  })
  inputText.addEventListener("input", (e) =>{
    if(e.target.value.trim()){
        cancelButton.classList.remove('no-visible');
    }else{
        cancelButton.classList.add('no-visible')
    }
  })

  function showSaveButtons(show = true) {
    if (show) {
      saveButton.classList.remove("no-visible");
      updateButton.classList.add("no-visible");
      cancelButton.classList.add("no-visible");
    } else {
      saveButton.classList.add("no-visible");
      updateButton.classList.remove("no-visible");
      cancelButton.classList.remove("no-visible");
    }
  }
  function templateEntry(item) {
    return `
        <div  class="entryContainer">
          <div>
            <p id="${item.id}">${item.text}</p>
          </div>

          <span>
            <span data-id="${item.id}" class="span-size"></span>
            <svg
              class="w-6 h-6 text-gray-800 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fill-rule="evenodd"
                d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
        </div>
    `;
  }

  showTextEntries();
});
class DBLocal {
  constructor(database = "dbLocal") {
    this.dbName = database;
    if (localStorage.getItem(database)) {
      this.dataLocal = JSON.parse(localStorage.getItem(database));
    } else {
      this.dataLocal = [];
    }
  }

  add(text) {
    const newText = {
      id: this.generateUniqueId(),
      text,
    };

    this.dataLocal.push(newText);
    this.saveDB(this.dataLocal);
  }
  update(id, text) {
    const newDataEntries = this.dataLocal.map((entry) => {
      if (entry.id === id) return { id, text };
      return entry;
    });
    this.saveDB(newDataEntries);
  }
  delete(id){
    const newDataLocal = this.dataLocal.filter(entry => entry.id != id);
    this.saveDB(newDataLocal)
  }

  generateUniqueId() {
    // Generar un identificador único en formato UUID
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
  saveDB(newData) {
    this.dataLocal = newData;
    localStorage.setItem(this.dbName, JSON.stringify(newData));
  }
  destroyDB() {
    this.dataLocal = [];
    localStorage.removeItem(this.dbName);
  }
  
}
