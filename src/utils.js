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

// задумка: в общем ul списке идут списки ul c логинами и в кажом таком списке перечень li с задачами для пользователя
export const displayTasks = function (taskField, login, handlerTask) {
  let userOfTaskList = document.querySelectorAll(".app-task__user");

  // backlog (taskField)
  // app-task__user (userOfTaskList)
  // task__item (taskList)

  if (login == "admin") {
    if (userOfTaskList.length) {
      // taskList = document.querySelectorAll(".task__item");
      userOfTaskList.forEach((element) => {
        taskField.removeChild(element);
      });
    }
  }

  let taskList = document.querySelectorAll(".task__item");

  if (taskList.length) {
    taskList.forEach((element) => {
      taskField.removeChild(element);
    });
  }

  // const taskListContainer = document.querySelector("#input-user");
  // console.log("taskList", taskList);
  // if (taskList.length) {
  //   taskList.forEach((element) => {
  //     taskField.removeChild(element);
  //   });
  // }

  if (localStorage.getItem("tasks")) {
    const tasks = getFromStorage("tasks");
    const tasksByUser = new Map();
    for (const task of tasks) {
      // console.log("task.own", task.own);
      // console.log("проверка map has test", tasksByUser.has(task.own));
      if (!tasksByUser.has(task.own)) {
        tasksByUser.set(task.own, [task]);
        // console.log("должно push task", task);
      } else {
        const tempUserArr = tasksByUser.get(task.own);
        // console.log("tempUserArr", tempUserArr);
        tempUserArr.push(task);
        // console.log("tempUserArr после push", tempUserArr);
        tasksByUser.set(task.own, tempUserArr);
      }

      // console.log("вывести map get test", tasksByUser.get(task.own));
      // console.log("вывести map", tasksByUser);
    }

    if (login == "admin") {
      let i = 0;
      // taskField.insertAdjacentHTML(
      //   "beforeend",
      //   `<li class='task__item'>${task.own}: ${task.name}</li>`
      // );
      // backlog (taskField)
      // app-task__user (userOfTaskList)
      // task__item (taskList)
      for (const key of tasksByUser.keys()) {
        // console.log("key", key);
        taskField.insertAdjacentHTML(
          "beforeend",
          `<ul class="app-task__user">${key}:</ul>`
        );
        userOfTaskList = document.querySelectorAll(".app-task__user");

        tasksByUser.get(key).forEach((elem) => {
          userOfTaskList[i].insertAdjacentHTML(
            "beforeend",
            `<li class="task__item" id='${elem.id}'>${elem.name}</li>`
          );
        });
        i++;
      }

      // taskField.insertAdjacentHTML(
      //   "beforeend",
      //   `<ul class="app-task__user">
      //     ${task.own}:
      //     <li class="task__item">${task.name}</li>
      //   </ul>`
      // );
    } else {
      // console.log("если не админ");
      for (const task of tasks) {
        if (task.own == login) {
          taskField.insertAdjacentHTML(
            "beforeend",
            `<li class='task__item' id='${task.id}'>${task.name}</li>`
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

export const deleteFromStorage = function (key, id) {
  const storageData = getFromStorage(key);
  const tempArr = [];

  storageData.forEach((element) => {
    if (element.id != id) {
      tempArr.push(element);
    }
  });

  localStorage.setItem(key, JSON.stringify(tempArr));
};

export const editInStorage = function (key, id, changeItem, newInfo) {
  const storageData = getFromStorage(key);
  const tempArr = [];

  storageData.forEach((element) => {
    if (element.id != id) {
      tempArr.push(element);
      deleteFromStorage(key, element.id);
    } else {
      element[changeItem] = newInfo;
      tempArr.push(element);
      deleteFromStorage(key, id);
    }
  });

  localStorage.setItem(key, JSON.stringify(tempArr));
};

export const moveToNextStage = function (taskId) {
  const storageData = getFromStorage("tasks");
};
