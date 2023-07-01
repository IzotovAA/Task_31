"use strict";

import { appState } from "./app";

export const getFromStorage = function (key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
};

export const addToStorage = function (obj, key) {
  const storageData = getFromStorage(key);
  storageData.push(obj);
  localStorage.setItem(key, JSON.stringify(storageData));
};

export const generateTestUser = function (User) {
  // localStorage.clear();
  const testUser = new User("test", "123");
  User.save(testUser);
};

export const generateAdmin = function (Admin) {
  const admin = new Admin("admin", "123");
  Admin.save(admin);
};

export const addUser = function (User, login, password) {
  const user = new User(login, password);
  User.save(user);
};

export const isCurrentUserAdmin = function () {
  return appState.currentUser.login == "admin" ? true : false;
};

export const isTheLoginFree = function (login) {
  const users = getFromStorage("users");
  if (users.length == 0) return true;
  for (const user of users) {
    if (user.login == login) return false;
  }
  return true;
};

export const displayTasks = function (taskField, login, handlerTask) {
  let taskList = document.querySelectorAll(".task__item");
  // const taskListContainer = document.querySelector("#input-user");
  console.log("taskList", taskList);
  if (taskList.length) {
    taskList.forEach((element) => {
      taskField.removeChild(element);
    });
  }

  if (localStorage.getItem("tasks")) {
    const tasks = getFromStorage("tasks");
    for (const task of tasks) {
      if (login == "admin") {
        taskField.insertAdjacentHTML(
          "beforeend",
          `<li class='task__item'>${task.own}: ${task.name}</li>`
        );
      } else {
        if (task.own == login) {
          taskField.insertAdjacentHTML(
            "beforeend",
            `<li class='task__item'>${task.name}</li>`
          );
        }
      }
    }

    taskList = document.querySelectorAll(".task__item");
    // removeEvLisOnTask(tasks, handlerTask);
    addEvLisOnTask(taskList, handlerTask);
  }
};

export const updUserList = function () {
  if (localStorage.getItem("users")) {
    const userList = document.querySelectorAll("option");
    const userListContainer = document.querySelector("#input-user");
    console.log("userList", userList);
    if (userList.length) {
      userList.forEach((element) => {
        userListContainer.removeChild(element);
      });
    }

    const users = getFromStorage("users");
    for (const user of users) {
      userListContainer.insertAdjacentHTML(
        "beforeend",
        `<option value="${user.login}">${user.login}</option>`
      );
      // очистить инпут с выбором
      // отобразить в инпут всех существующих пользователей
    }
  }
};

// export const removeEvLisOnTask = function (tasks, handlerTask) {
//   if (tasks.length) {
//     for (const task of tasks) {
//       task.removeEventListener("click", handlerTask);
//     }
//   }
// };

export const addEvLisOnTask = function (tasks, handlerTask) {
  if (tasks.length) {
    for (const task of tasks) {
      task.addEventListener("click", handlerTask);
    }
  }
};
