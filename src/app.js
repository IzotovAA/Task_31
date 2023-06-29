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
import { isCurrentUserAdmin } from "./utils";
import { isTheLoginFree } from "./utils";
import { addUser } from "./utils";
import { displayTasks } from "./utils";
import { updUserList } from "./utils";

export const appState = new State();
export const inputUser = document.querySelector("#input-user");

// назначение модального окна добавления задачи
const modalWindow = new Modal(document.querySelector("#staticBackdrop"));

// модальное окно диапазона как элемент
// const modalWindowElement = document.querySelector("#staticBackdrop");

// кнопка Ок в модальном окне задачи
const taskInputOkBtn = document.querySelector(".button-input");

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

const inputUserLabel = document.querySelector("#input-user-form");

const inputLogin = document.querySelector(".input-login");
const inputPass1 = document.querySelector(".input-password-1");
const inputPass2 = document.querySelector(".input-password-2");
const alertMessage = document.querySelector("#alert-message");

localStorage.clear();
generateTestUser(User);
generateAdmin(Admin);

document.addEventListener("DOMContentLoaded", startApp);

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

    if (!login || !password) return;

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
    // console.log(appState.currentUser.login);
    greetings.innerHTML = `Hello ${appState.currentUser.login}`;

    // clearTaskList();

    // console.log("localStorage после авторизации", localStorage);

    const addUserBtn = document.querySelector("#app-adduser-btn");
    const logoutBtn = document.querySelector("#app-logout-btn");
    const addTaskBtn = document.querySelector("#app-addtask-btn");
    const taskField1 = document.querySelector(".backlog");

    // кнопка для отладки
    const localBtn = document.querySelector("#app-addtask-btn-loc");

    if (isCurrentUserAdmin()) {
      addUserBtn.className = "btn btn-outline-info";
      document.querySelector("h1").innerHTML = "Users tasks here";
    } else addUserBtn.className = "btn btn-outline-info app-btn--invisible";

    displayTasks(taskField1, appState.currentUser.login);

    // заменил на функцию
    // if (localStorage.getItem("tasks")) {
    //         const tasks = getFromStorage("tasks");
    //   for (const task of tasks) {
    //     taskField1.insertAdjacentHTML(
    //       "beforeend",
    //       `<li class='task__item'>${task.name}</li>`
    //     );
    //   }
    // }

    addUserBtn.addEventListener("click", handlerAddUser);
    taskInputAddUserBtn.addEventListener("click", handlerAddUserOkBtn);
    logoutBtn.addEventListener("click", handlerLogout);
    addTaskBtn.addEventListener("click", handlerAddTask);
    taskInputOkBtn.addEventListener("click", handlerTaskOkBtn);
    localBtn.addEventListener("click", handlerLoc);

    function handlerAddUser() {
      modalWindowAddUser.show();
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
      if (inputLogin.value.match(/admin/gi)) {
        modalAlert.show();
        alertMessage.innerHTML = "This name cannot be used";
        return;
      } else if (isTheLoginFree(login)) {
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

    function handlerLogout() {
      content.innerHTML = "<h2>Please Sign In to see your tasks!</h2>";
      appState.currentUser = null;
      // window.location.href = "/";
      // logoutBtn.removeEventListener("click", handlerLogout);
      // addTaskBtn.removeEventListener("click", handlerAddTask);
      taskInputOkBtn.removeEventListener("click", handlerTaskOkBtn);
      // localBtn.removeEventListener("click", handlerLoc);
      console.log("localStorage", localStorage);
      console.log("appState.currentUser", appState.currentUser);
      return startApp();
    }

    function handlerAddTask() {
      const login = appState.currentUser.login;
      if (login == "admin") {
        inputUserLabel.className = "div-inp input-user-form";
        // inputUser.className = "div-inp input-user";
        updUserList();
      } else {
        inputUserLabel.className = "div-inp input-user-form--invisible";
        // inputUser.className = "div-inp input-user--invisible";
      }
      modalWindow.show();
    }

    function handlerTaskOkBtn() {
      if (!inputTask.value) return;
      const login = appState.currentUser.login;

      // debugger;
      if (login == "admin") {
        const task = new Task(inputTask.value, inputUser.value);
        Task.save(task);

        taskField1.insertAdjacentHTML(
          "beforeend",
          `<li class='task__item'>${task.own}: ${task.name}</li>`
        );

        modalWindow.hide();
      } else {
        const task = new Task(inputTask.value, login);
        Task.save(task);

        taskField1.insertAdjacentHTML(
          "beforeend",
          `<li class='task__item'>${task.name}</li>`
        );
        modalWindow.hide();
      }
    }

    function handlerLoc() {
      console.log("localStorage", localStorage);
      console.log("localStorage.getItem(tasks)", localStorage.getItem("tasks"));
      console.log("appState.currentUser", appState.currentUser);
      console.log("localStorage.users", localStorage.users);
    }

    // function clearTaskList() {
    //   let taskList = document.querySelectorAll(".task__item");
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
