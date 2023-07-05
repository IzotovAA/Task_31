"use strict";

import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "bootstrap/js/dist/modal";
// import * as bootstrap from "bootstrap";
import "./styles/style.css";
import taskFieldTemplate from "./templates/taskField.html";
// import noAccessTemplate from "./templates/noAccess.html";
import navbarAuthTemplate from "./templates/navbarAuth.html";
import navbarNotAuthTemplate from "./templates/navbarNotAuth.html";
import { User } from "./models/User";
import { Admin } from "./models/Admin";
import { Task } from "./models/Task";
import { generateTestUser } from "./utils";
import { generateAdmin } from "./utils";
import { State } from "./state";
import { authUser } from "./services/auth";
import { getFromStorage } from "./utils";
import { addToStorage } from "./utils";
import { deleteFromStorage } from "./utils";
import { editInStorage } from "./utils";
import { isCurrentUserAdmin } from "./utils";
import { isTheLoginFree } from "./utils";
import { addUser } from "./utils";
import { displayTasks } from "./utils";
import { updUserList } from "./utils";
import { removeEvLisOnTask } from "./utils";
import { addEvLisOnTask } from "./utils";

export const appState = new State();
export const inputUser = document.querySelector("#input-user");

// назначение модального окна добавления задачи
const modalWindow = new Modal(document.querySelector("#staticBackdrop"));

// модальное окно диапазона как элемент
// const modalWindowElement = document.querySelector("#staticBackdrop");

// кнопка Ок в модальном окне задачи
const taskInputOkBtn = document.querySelector(".button-input");
const taskEditOkBtn = document.querySelector(".button-input-taskedit");
const deleteTaskBtn = document.querySelector(".button-task-delete");

// кнопка Закрыть в модальном окне диапазона
// const buttonClose = document.querySelector(".button-close");

// назначение модального окна добавления нового пользователя
const modalWindowAddUser = new Modal(
  document.querySelector("#staticBackdropAddUser")
);

// кнопка Ок в модальном окне добавления пользователя
const taskInputAddUserBtn = document.querySelector(".button-input-adduser");

// назначение модального окна alert
const modalAlert = new Modal(document.querySelector("#alert"));

// модальное окно alert как элемент
// const modalAlertElement = document.querySelector("#alert");

const navbar = document.querySelector(".navbar");
const content = document.querySelector("#content");
// const inputTaskLabel = document.querySelector("#staticBackdropLabel");
const inputTask = document.querySelector(".input-task");

const inputUserForm = document.querySelector("#input-user-form");
// const inputTaskEdit = document.querySelector("#input-task-edit");

const inputLogin = document.querySelector(".input-login");
const inputPass1 = document.querySelector(".input-password-1");
const inputPass2 = document.querySelector(".input-password-2");
const alertMessage = document.querySelector("#alert-message");

localStorage.clear();
generateTestUser(User);
generateAdmin(Admin);

document.addEventListener("DOMContentLoaded", startApp);
taskInputAddUserBtn.addEventListener("click", handlerAddUserOkBtn);
// taskInputOkBtn.addEventListener("click", handlerTaskOkBtn);
// taskEditOkBtn.addEventListener("click", handlerTaskEditOkBtn);
// deleteTaskBtn.addEventListener("click", handlerDeleteTaskBtn);

let taskId = "";

function startApp() {
  navbar.innerHTML = navbarNotAuthTemplate;
  const loginForm = document.querySelector("#app-login-form");

  // greetings.innerHTML = "";

  loginForm.addEventListener("submit", handlerForm);

  function handlerForm(e) {
    e.preventDefault();

    const formData = new FormData(loginForm);
    const login = formData.get("login");
    const password = formData.get("password");

    if (!login || !password) {
      modalAlert.show();
      alertMessage.innerHTML = "Input login and password";
      return;
    }

    let auth = authUser(login, password);

    let fieldHTMLContent = auth
      ? taskFieldTemplate
      : "<h2>Please Sign In to see your tasks!</h2>";

    let navbarContent = auth ? navbarAuthTemplate : navbarNotAuthTemplate;

    content.innerHTML = fieldHTMLContent;
    navbar.innerHTML = navbarContent;

    // если авторизация не состоялась выводим alert
    if (!auth) {
      modalAlert.show();
      alertMessage.innerHTML = "Login or password incorrect, please try again";
      loginForm.removeEventListener("submit", handlerForm);
      return startApp();
    }

    const greetings = document.querySelector("#greetings");
    const username = document.querySelector("#username");

    const currentUser = appState.currentUser.login;
    // console.log(appState.currentUser.login);
    greetings.innerHTML = `Hello ${currentUser}!`;
    username.innerHTML = currentUser;
    // clearTaskList();

    // console.log("localStorage после авторизации", localStorage);

    // назначение DOM элементов после авторизации и отображения соответствующей информации
    const logoutBtn = document.querySelector("#app-logout-btn");
    const addUserBtn = document.querySelector("#app-adduser-btn");
    const backlogAddTaskBtn = document.querySelector("#backlog-addtask-btn");
    const readyAddTaskBtn = document.querySelector("#ready-addtask-btn");
    const inProgAddTaskBtn = document.querySelector("#inprogress-addtask-btn");
    const finishedAddTaskBtn = document.querySelector("#finished-addtask-btn");

    const backlog = document.querySelector(".backlog");
    const ready = document.querySelector(".ready");
    const inprogress = document.querySelector(".inprogress");
    const finished = document.querySelector(".finished");

    const tasksColumns = [backlog, ready, inprogress, finished];

    // console.log("backlog", backlog);

    // const tasks = document.querySelectorAll(".app-task__item");

    // кнопка для отладки
    // const localBtn = document.querySelector("#app-addtask-btn-loc");

    // console.log("проверка админ ли пользователь");

    if (isCurrentUserAdmin()) {
      addUserBtn.className = "btn btn-outline-info";
      document.querySelector("h1").innerHTML = "Users tasks here";
      // inputTaskEdit.classList.toggle("invisible");

      // if (tasks.length) {
      //   for (const task of tasks) {
      //     task.addEventListener("click", handlerTaskEdit);
      //   }
      // }
      // console.log("админ, если tasks.length, вышается прослушка");
      // if (tasks.length) {
      //   removeEvLisOnTask(tasks, handlerTaskEdit);
      //   addEvLisOnTask(tasks, handlerTaskEdit);
      // }
      // displayTasks(backlog, appState.currentUser.login, handlerTaskEdit);
    } else addUserBtn.className = "btn btn-outline-info app-btn--invisible";

    displayTasks(tasksColumns, currentUser, handlerTaskEdit);

    // заменил на функцию
    // if (localStorage.getItem("tasks")) {
    //         const tasks = getFromStorage("tasks");
    //   for (const task of tasks) {
    //     backlog.insertAdjacentHTML(
    //       "beforeend",
    //       `<li class='app-task__item'>${task.name}</li>`
    //     );
    //   }
    // }

    // console.log("далее должны навесится прослушиватели");
    addUserBtn.addEventListener("click", handlerAddUser);
    // taskInputAddUserBtn.addEventListener("click", handlerAddUserOkBtn);
    logoutBtn.addEventListener("click", handlerLogout);
    backlogAddTaskBtn.addEventListener("click", handlerAddTask);
    readyAddTaskBtn.addEventListener("click", handlerMoveTask);

    taskInputOkBtn.addEventListener("click", handlerTaskOkBtn);
    taskEditOkBtn.addEventListener("click", handlerTaskEditOkBtn);
    deleteTaskBtn.addEventListener("click", handlerDeleteTaskBtn);
    // localBtn.addEventListener("click", handlerLoc);

    function handlerTaskEdit(e) {
      // const login = appState.currentUser.login;
      inputUserForm.className = "div-inp input-user-form--invisible";
      console.log("handlerTaskEdit", "this", this);
      inputTask.value = this.innerHTML;

      //Apply
      taskEditOkBtn.className = "btn btn-primary button-input-taskedit";

      //add
      taskInputOkBtn.className = "btn btn-primary button-input--invisible";

      taskId = e.target.id;
      if (currentUser == "admin")
        deleteTaskBtn.className = "btn btn-primary button-task-delete";
      // console.log("this", this);
      modalWindow.show();
    }

    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    function handlerTaskEditOkBtn() {
      // const tasks = getFromStorage("tasks");

      editInStorage("tasks", taskId, "name", inputTask.value);

      modalWindow.hide();
      deleteTaskBtn.className = "btn btn-primary button-task-delete invisible";
      taskEditOkBtn.className =
        "btn btn-primary button-input-taskedit invisible";
      taskInputOkBtn.className = "btn btn-primary button-input";

      displayTasks(tasksColumns, currentUser, handlerTaskEdit);
    }

    function handlerDeleteTaskBtn() {
      deleteFromStorage("tasks", taskId);
      displayTasks(tasksColumns, currentUser, handlerTaskEdit);
      modalWindow.hide();
      // deleteTaskBtn.classList.toggle("invisible");
      // taskEditOkBtn.classList.toggle("invisible");
      // taskInputOkBtn.classList.toggle("invisible");
      deleteTaskBtn.className = "btn btn-primary button-task-delete invisible";
      taskEditOkBtn.className =
        "btn btn-primary button-input-taskedit invisible";
      taskInputOkBtn.className = "btn btn-primary button-input";
    }

    function handlerAddUser() {
      modalWindowAddUser.show();
    }

    function handlerLogout() {
      content.innerHTML = "<h2>Please Sign In to see your tasks!</h2>";
      appState.currentUser = null;
      // window.location.href = "/";
      // logoutBtn.removeEventListener("click", handlerLogout);
      // backlogAddTaskBtn.removeEventListener("click", handlerAddTask);
      taskInputOkBtn.removeEventListener("click", handlerTaskOkBtn);
      // localBtn.removeEventListener("click", handlerLoc);
      // taskInputAddUserBtn.removeEventListener("click", handlerAddUserOkBtn);
      taskEditOkBtn.removeEventListener("click", handlerTaskEditOkBtn);
      deleteTaskBtn.removeEventListener("click", handlerDeleteTaskBtn);
      // inputTaskEdit.classList.toggle("invisible");
      taskId = "";
      console.log("localStorage", localStorage);
      console.log("appState.currentUser", appState.currentUser);
      console.log("localStorage", localStorage.tasks);
      return startApp();
    }

    function handlerAddTask() {
      // const login = appState.currentUser.login;
      if (currentUser == "admin") {
        inputUserForm.className = "div-inp input-user-form";
        // inputUser.className = "div-inp input-user";
        updUserList();
      } else {
        inputUserForm.className = "div-inp input-user-form--invisible";
        // inputUser.className = "div-inp input-user--invisible";
      }

      // console.log("кнопка добавление задачи");

      modalWindow.show();
    }

    function handlerTaskOkBtn() {
      if (!inputTask.value) return;
      // const login = appState.currentUser.login;

      // debugger;
      if (currentUser == "admin") {
        const task = new Task(inputTask.value, inputUser.value);
        Task.save(task);

        // backlog.insertAdjacentHTML(
        //   "beforeend",
        //   `<li class='app-task__item'>${task.own}: ${task.name}</li>`
        // );
      } else {
        const task = new Task(inputTask.value, login);
        Task.save(task);

        // backlog.insertAdjacentHTML(
        //   "beforeend",
        //   `<li class='app-task__item'>${task.name}</li>`
        // );
        // modalWindow.hide();
      }
      // console.log("handlerTaskOkBtn");
      // removeEvLisOnTask(tasks, handlerTaskEdit);
      // addEvLisOnTask(tasks, handlerTaskEdit);
      modalWindow.hide();
      displayTasks(tasksColumns, login, handlerTaskEdit);
      console.log("localStorage.tasks", localStorage.tasks);
    }
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // доделать перенос задачи на следующую стадию
    function handlerMoveTask() {
      inputTask.className = "input input-task invisible";
      taskInputOkBtn.className = "btn btn-primary button-input invisible";
      // кнопку add скрыть, apply отобразить
      // в лейбл инпуте отобразить имя задачи
      // в названии МО написать Move task to next stage
      // не забыть после нажатия на applay вернуть настройки назад
      // возможно написать функцию для сброса настроек в изначальный вариант?
      modalWindow.show();
    }

    function handlerLoc() {
      console.log("localStorage", localStorage);
      console.log("localStorage.getItem(tasks)", localStorage.getItem("tasks"));
      console.log("appState.currentUser", appState.currentUser);
      console.log("localStorage.users", localStorage.users);
    }

    // function clearTaskList() {
    //   let taskList = document.querySelectorAll(".app-task__item");
    //   console.log("taskList", taskList);
    //   console.log("taskList.length до", taskList.length);

    //   if (taskList.length) {
    //     taskList.forEach((element) => {
    //       taskList.removeChild(element);
    //     });
    //   }

    //   console.log("taskList.length после", taskList.length);
    // }
  }
}

function handlerAddUserOkBtn() {
  const login = inputLogin.value,
    pass1 = inputPass1.value,
    pass2 = inputPass2.value;

  if (!login || !pass1 || !pass2) {
    modalAlert.show();
    alertMessage.innerHTML = "All fields are required";
    return;
  }

  if (login.match(/admin/gi)) {
    modalAlert.show();
    alertMessage.innerHTML = "This name cannot be used";
    return;
  } else if (isTheLoginFree(login)) {
    console.log("isTheLoginFree", isTheLoginFree(login));
    if (pass1 == pass2) {
      addUser(User, login, pass1);
    } else {
      modalAlert.show();
      alertMessage.innerHTML = "Password not confirmed";
      return;
    }
  } else {
    modalAlert.show();
    alertMessage.innerHTML = "That login already exists";
    return;
  }
  modalWindowAddUser.hide();
}
