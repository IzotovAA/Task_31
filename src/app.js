"use strict";

import "bootstrap/dist/css/bootstrap.min.css";
import Modal from "bootstrap/js/dist/modal";
import "./styles/style.css";
import taskFieldTemplate from "./templates/taskField.html";
import navbarAuthTemplate from "./templates/navbarAuth.html";
import navbarNotAuthTemplate from "./templates/navbarNotAuth.html";
import footerAuth from "./templates/footerAuth.html";
import footerNotAuth from "./templates/footerNotAuth.html";
import { User } from "./models/User";
import { Admin } from "./models/Admin";
import { Task } from "./models/Task";
import { State } from "./state";
import { authUser } from "./services/auth";
import {
  getFromStorage,
  generateTestUser,
  generateAdmin,
  deleteFromStorage,
  editInStorage,
  isCurrentUserAdmin,
  isTheLoginFree,
  addUser,
  displayTasks,
  updUserList,
  updTasksList,
  moveToNextStage,
  updBtnStatus,
  userIdByName,
} from "./utils";

export const appState = new State();

// удаление пользователя реализовал, надо сделать изменение иконки пользователя в зависимости
// от попап окна, открыто/закрыто, а так же реализовать попап окно на иконку пользователя
// и на бургер меню, а точнее подумать нужно ли оно вообще

// назначение модального окна (МО) добавления задачи
const modalWindow = new Modal(document.querySelector("#staticBackdrop"));

// модальное окно добавления задачи как элемент
const modalWindowElement = document.querySelector("#staticBackdrop");

// кнопки в МО
const taskAddOkBtn = document.querySelector(".button-input"); // кнопка Add
const taskEditOkBtn = document.querySelector(".button-input-taskedit"); // кнопка Apply
const deleteTaskBtn = document.querySelector(".button-task-delete"); // кнопка Delete task

// назначение модального окна добавления нового пользователя
const modalWindowAddUser = new Modal(
  document.querySelector("#staticBackdropAddUser")
);

// кнопка Apply в модальном окне добавления пользователя
const taskInputAddUserBtn = document.querySelector(".button-input-adduser");

// назначение модального окна alert
const modalAlert = new Modal(document.querySelector("#alert"));

// DOM элементы
const navbar = document.querySelector(".navbar"); // панель навигации (ПН)
const content = document.querySelector("#content"); // для вставления основного содержания, задач
const footer = document.querySelector("#footer"); // футер
const modalWindowLabel = document.querySelector("#staticBackdropLabel"); // заголовок МО добавления задач
const inputTask = document.querySelector(".input-task"); // input в МО добавления задач
const inputTaskLabel = document.querySelector(".input-task-label"); // надпись над input в МО
const inputUser = document.querySelector("#input-user"); // всплывающий список в МО
const inputUserLabel = document.querySelector(".input-user-label"); // надпись над всплывающим списком в МО
const inputUserForm = document.querySelector("#input-user-form"); // обёртка всплывающего списка

// input в МО создания нового пользователя
const inputLogin = document.querySelector(".input-login");
const inputPass1 = document.querySelector(".input-password-1");
const inputPass2 = document.querySelector(".input-password-2");

const alertMessage = document.querySelector("#alert-message"); // поле сообщения alert

let applyBtnFlag = "TaskEdit"; // флаг для функционала кнопки Apply в МО задачи

localStorage.clear();
generateTestUser(User);
generateAdmin(Admin);

document.addEventListener("DOMContentLoaded", startApp); // после загрузки DOM запускается функция
modalWindowElement.addEventListener("hidden.bs.modal", handlerDefault); // слушатель на скрытие МО

let taskId = ""; // переменная для хранения id задачи

// запускает приложение, отображает необходимые элементы, осуществляет основную функциональность приложения
function startApp() {
  navbar.innerHTML = navbarNotAuthTemplate; // в ПН отображается не авторизованный шаблон
  footer.innerHTML = footerNotAuth; // в футер отображается не авторизованный шаблон
  let username = document.querySelector("#username"); // поле вывода имя пользователя
  username.innerHTML = `Kanban board, ${new Date().getFullYear()}`; // выводим текущий год
  const loginForm = document.querySelector("#app-login-form"); // форма входа

  loginForm.addEventListener("submit", handlerForm); // прослушка на submit

  // срабатывает при попытке логина
  function handlerForm(e) {
    e.preventDefault(); // отключаем отправку формы

    // передача данных из инпутов логина и пароля в переменные
    const formData = new FormData(loginForm);
    const login = formData.get("login");
    const password = formData.get("password");

    // если логин или пароль пустой выводит alert
    if (!login || !password) {
      modalAlert.show();
      alertMessage.innerHTML = "Input login and password";
      return;
    }
    // ...

    let auth = authUser(login, password); // сохраняем результат проверки логина и пароля

    // присвоить переменной соответствующий шаблон основного содержания в зависимости от результата авторизации
    let fieldHTMLContent = auth
      ? taskFieldTemplate
      : "<h2>Please Sign In to see your tasks!</h2>";

    // присвоить переменной шаблон НП в зависимости от результата авторизации
    let navbarContent = auth ? navbarAuthTemplate : navbarNotAuthTemplate;

    // присвоить переменной шаблон футера в зависимости от результата авторизации
    let footerContent = auth ? footerAuth : footerNotAuth;

    // передача шаблонов из переменных в DOM приложения
    content.innerHTML = fieldHTMLContent;
    navbar.innerHTML = navbarContent;
    footer.innerHTML = footerContent;

    // если авторизация не состоялась выводим alert
    if (!auth) {
      modalAlert.show();
      alertMessage.innerHTML = "Login or password incorrect, please try again";
      loginForm.removeEventListener("submit", handlerForm); // удаляем прослушку
      return startApp(); // прерываем и запускаем заново работу приложения
    }
    // ...

    username = document.querySelector("#username"); // обновляем DOM поля вывода имя пользователя после авторизации
    const greetings = document.querySelector("#greetings"); // поле приветствия
    const currentUser = appState.currentUser.login; // сохраняем логин текущего пользователя

    // отображаем приветствие и имя пользователя
    greetings.innerHTML = `Hello ${currentUser}!`;

    // отображаем пользователя и год в footer
    username.innerHTML = `Kanban board by ${currentUser}, ${new Date().getFullYear()}`;

    // назначение DOM элементов после авторизации и отображения соответствующей информации
    const logoutBtn = document.querySelector("#app-logout-btn"); // кнопка выхода
    const addUserBtn = document.querySelector("#app-adduser-btn"); // кнопка добавления нового пользователя
    const deleteUserBtn = document.querySelector("#app-deleteuser-btn"); // кнопка удаления пользователя

    // кнопки добавления задач в полях статусов
    const backlogAddTaskBtn = document.querySelector("#backlog-addtask-btn");
    const readyAddTaskBtn = document.querySelector("#ready-addtask-btn");
    const inProgAddTaskBtn = document.querySelector("#inprogress-addtask-btn");
    const finishedAddTaskBtn = document.querySelector("#finished-addtask-btn");

    // поля статусов задач
    const backlog = document.querySelector(".backlog");
    const ready = document.querySelector(".ready");
    const inprogress = document.querySelector(".inprogress");
    const finished = document.querySelector(".finished");

    // сохраняем список полей статусов задач в массив
    const tasksColumns = [backlog, ready, inprogress, finished];

    // если пользователь админ отображает необходимую информацию
    if (isCurrentUserAdmin()) {
      addUserBtn.className = "btn btn-outline-info";
      deleteUserBtn.className = "btn btn-outline-info";
    } else {
      addUserBtn.className = "btn btn-outline-info app-btn--invisible";
      deleteUserBtn.className = "btn btn-outline-info app-btn--invisible";
    }
    // ...

    displayTasks(tasksColumns, currentUser, handlerTaskEdit); // отображаем задачи
    updBtnStatus(tasksColumns); // обновляем статусы кнопок

    // добавляем прослушку
    addUserBtn.addEventListener("click", handlerAddUser); // кнопка добавления пользователя
    deleteUserBtn.addEventListener("click", handlerDeleteUser); // кнопка удаления пользователя
    logoutBtn.addEventListener("click", handlerLogout); // кнопка выхода
    backlogAddTaskBtn.addEventListener("click", handlerAddTask); // кнопка добавить задачу в поле backlog
    readyAddTaskBtn.addEventListener("click", handlerMoveTask); // кнопка добавить задачу в поле ready
    inProgAddTaskBtn.addEventListener("click", handlerMoveTask); // кнопка добавить задачу в поле inprogress
    finishedAddTaskBtn.addEventListener("click", handlerMoveTask); // кнопка добавить задачу в поле finished
    taskAddOkBtn.addEventListener("click", handlerTaskOkBtn); // кнопка Add в МО
    taskEditOkBtn.addEventListener("click", handlerTaskEditOkBtn); // кнопка Apply в МО
    deleteTaskBtn.addEventListener("click", handlerDeleteTaskBtn); // кнопка Delete в МО
    taskInputAddUserBtn.addEventListener("click", handlerAddUserOkBtn); // слушатель на кнопку AddUser

    // отображает МО с необходимой информацией при нажатии на задачу
    function handlerTaskEdit(e) {
      applyBtnFlag = "TaskEdit"; // установка флага для использования МО для редактирования задачи
      inputUserForm.className = "div-inp input-user-form--invisible"; // скрываем всплывающий список
      inputTask.value = this.innerHTML; // отображаем в инпуте название текущей задачи
      taskEditOkBtn.className = "btn btn-success button-input-taskedit"; // отображаем кнопку Apply
      taskAddOkBtn.className = "btn btn-success button-input--invisible"; // скрываем кнопку Add

      taskId = e.target.id; // сохраняем id редактируемой задачи
      // если админ, отображаем кнопку Delete
      if (currentUser == "admin")
        deleteTaskBtn.className = "btn btn-warning button-task-delete";

      modalWindow.show(); // отображаем МО
    }
    // ...

    // срабатывае при нажатии на кнопку Apply в МО
    function handlerTaskEditOkBtn() {
      // в зависимости от флага редактирует либо переносит задачу в следующую стадию
      // либо удаляет выбранного пользователя
      if (applyBtnFlag == "TaskEdit") {
        editInStorage("tasks", taskId, "name", inputTask.value);
        taskId = "";
      } else if (applyBtnFlag == "MoveTask") {
        moveToNextStage(inputUser.value);
      } else if (applyBtnFlag == "DeleteUser") {
        // удаляем пользователя и далее все задачи принадлежащие ему
        deleteFromStorage("users", userIdByName(inputUser.value));
        const storageData = getFromStorage("tasks");
        if (storageData.length) {
          storageData.forEach((task) => {
            if (task.own == inputUser.value) {
              deleteFromStorage("tasks", task.id);
            }
          });
        }
      }

      modalWindow.hide(); // скрываем МО

      // выставление состояния элементов по умолчанию
      deleteTaskBtn.className = "btn btn-warning button-task-delete invisible"; // кнопка удаления задачи
      taskEditOkBtn.className =
        "btn btn-success button-input-taskedit invisible"; // кнопка Apply
      taskAddOkBtn.className = "btn btn-success button-input"; // кнопка Add
      inputTask.className = "input input-task"; // input в МО добавления задач
      inputTaskLabel.className = "div-inp input-task-label"; // надпись над input в МО
      modalWindowLabel.innerHTML = "Input task name"; // заголовок МО добавления задач
      inputUserForm.className = "div-inp input-user-form invisible"; // всплывающий список

      displayTasks(tasksColumns, currentUser, handlerTaskEdit);
      updBtnStatus(tasksColumns);
    }
    // ...

    // срабатывает при нажатии на кнопку Delete
    function handlerDeleteTaskBtn() {
      deleteFromStorage("tasks", taskId);
      displayTasks(tasksColumns, currentUser, handlerTaskEdit);
      updBtnStatus(tasksColumns);
      modalWindow.hide(); // скрываем МО

      deleteTaskBtn.className = "btn btn-warning button-task-delete invisible"; // скрываем Delete
      taskEditOkBtn.className =
        "btn btn-success button-input-taskedit invisible"; // скрываем Apply
      taskAddOkBtn.className = "btn btn-success button-input"; // отображаем Add
    }
    // ...

    // срабатывает при нажатии на кнопку добавления нового пользователя, отображает МО
    function handlerAddUser() {
      modalWindowAddUser.show();
    }
    // ...

    // срабатывает при нажатии на кнопку удаления пользователя, отображает МО
    function handlerDeleteUser() {
      applyBtnFlag = "DeleteUser"; // установка флага

      // настраиваем отображение элементов МО
      taskEditOkBtn.className = "btn btn-success button-input-taskedit"; // кнопка Apply отображаем
      taskAddOkBtn.className = "btn btn-success button-input--invisible"; // кнопка Add скрываем
      inputTask.className = "input input-task invisible"; // input в МО добавления задач скрываем
      inputTaskLabel.className = "div-inp input-task-label invisible"; // надпись над input скрываем
      modalWindowLabel.innerHTML = "Delete user"; // заголовок МО добавления задач
      inputUserForm.className = "div-inp input-user-form"; // всплывающий список отображаем
      inputUserLabel.innerHTML = "Select a user"; // меняем надпись над всплывающим списком

      updUserList();
      modalWindow.show(); // отображаем МО
    }
    // ...

    // срабатывает при нажатии на кнопку выход
    function handlerLogout() {
      // сброс основного содержания и текущего пользователя
      content.innerHTML = "<h2>Please Sign In to see your tasks!</h2>";
      appState.currentUser = null;

      // удаление слушателей которые останутся после выхода и повесятся ещё раз при перезапуске startApp
      taskAddOkBtn.removeEventListener("click", handlerTaskOkBtn);
      taskEditOkBtn.removeEventListener("click", handlerTaskEditOkBtn);
      deleteTaskBtn.removeEventListener("click", handlerDeleteTaskBtn);
      addUserBtn.removeEventListener("click", handlerAddUser);
      taskInputAddUserBtn.removeEventListener("click", handlerAddUserOkBtn);

      taskId = ""; // сброс id
      applyBtnFlag = "TaskEdit"; // сброс флага для функционала кнопки Apply в МО задачи

      return startApp(); // перезапуск приложения
    }
    // ...

    // срабатывает при нажатии кнопки добавления новой задачи
    function handlerAddTask() {
      // если админ отображает всплывающий список иначе скрывает
      if (currentUser == "admin") {
        inputUserForm.className = "div-inp input-user-form";
      } else {
        inputUserForm.className = "div-inp input-user-form--invisible";
      }

      modalWindow.show(); // отображаем МО
    }
    // ...

    // срабатывает при нажатии на кнопку Add
    function handlerTaskOkBtn() {
      if (!inputTask.value) return; // если инпут пустой ничего не происходит

      // если админ создаёт задачу для выбранного пользователя, иначе для залогиненого
      if (currentUser == "admin") {
        const task = new Task(inputTask.value, inputUser.value);
        Task.save(task);
      } else {
        const task = new Task(inputTask.value, login);
        Task.save(task);
      }

      displayTasks(tasksColumns, login, handlerTaskEdit);
      updBtnStatus(tasksColumns);
      modalWindow.hide();
    }
    // ...

    // срабатывает при нажатии на кнопку add task во всех полях кроме backlog
    function handlerMoveTask(e) {
      const locationList = ["backlog", "ready", "inprogress", "finished"];
      applyBtnFlag = "MoveTask";

      // настройка нужного отображения
      inputTaskLabel.className = "div-inp input-task-label invisible"; // надпись над input скрываем
      inputTask.className = "input input-task invisible"; // input скрываем
      taskAddOkBtn.className = "btn btn-success button-input invisible"; // кнопку add скрываем
      taskEditOkBtn.className = "btn btn-success button-input-taskedit"; // кнопку apply отображаем
      modalWindowLabel.innerHTML = "Move task to next stage"; // меняем название МО
      inputUserLabel.innerHTML = "Select a task"; // меняем надпись над всплывающим списком

      // перебираем поля статусов
      for (const location of locationList) {
        // если id нажатой кнопки содержит название поля статуса,
        // то передаём название данного поля в функцию отображения задач во всплывающем списке
        if (e.target.id.match(location)) {
          updTasksList(location);
          break;
        }
      }

      inputUserForm.className = "div-inp input-user-form"; // отобразить всплывающий список
      modalWindow.show();
    }
    // ...

    // срабатывает при нажатии кнопки добавления нового пользователя
    function handlerAddUserOkBtn() {
      // передача данных из инпутов в переменные
      const login = inputLogin.value,
        pass1 = inputPass1.value,
        pass2 = inputPass2.value;

      // если какой-то инпут пустой отображает alert
      if (!login || !pass1 || !pass2) {
        modalAlert.show();
        alertMessage.innerHTML = "All fields are required";
        return;
      }
      // ...

      // если имя пользователя содержит admin отображает alert
      if (login.match(/admin/gi)) {
        modalAlert.show();
        alertMessage.innerHTML = "This name cannot be used";
        return;
      }

      // если такого имя пользователя не существует
      // и если пароли в инпутах совпадают, то создаёт нового пользователя,
      // иначе выводит alert
      else if (isTheLoginFree(login)) {
        if (pass1 == pass2) {
          addUser(User, login, pass1);
        } else {
          modalAlert.show();
          alertMessage.innerHTML = "Password not confirmed";
          return;
        }
      }

      // иначе выводит alert
      else {
        modalAlert.show();
        alertMessage.innerHTML = "That login already exists";
        return;
      }
      // ...

      updBtnStatus(tasksColumns); // обновляем статусы кнопок

      modalWindowAddUser.hide(); // скрываем МО
    }
    // ...
  }
  // ...
}
// ...

// сбрасывает необходимые настройки отображения к начальным
function handlerDefault() {
  inputTaskLabel.className = "div-inp input-task-label"; // отображаем надпись над input в МО
  deleteTaskBtn.className = "btn btn-warning button-task-delete invisible"; // скрываем кнопку удаления задачи в МО
  taskEditOkBtn.className = "btn btn-success button-input-taskedit invisible"; // скрываем кнопку Apply в МО
  inputUserForm.className = "div-inp input-user-form invisible"; // скрываем всплывающий список в МО
  modalWindowLabel.innerHTML = "Input task name"; // меняем название МО
  inputUserLabel.innerHTML = "Select a user"; // меняем надпись на всплывающим списком в МО
  taskAddOkBtn.className = "btn btn-success button-input"; // отображаем кнопку Add в МО
  inputTask.className = "input input-task"; // отображаем input в МО добавления задач
}
// ...
