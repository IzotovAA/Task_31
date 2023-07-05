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

// задумка: в общем ul списке идут списки ul c логинами и в кажом таком списке перечень li с задачами для конкретного пользователя
// переделать на отображение задач во всех полях статусов (backlog, ready, inprogress, finished) !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
export const displayTasks = function (taskFieldList, login, handlerTask) {
  // ищем списки задач пользователей
  let userOfTaskList = document.querySelectorAll(".app-task__user");

  // backlog (taskField)
  // app-task__user (userOfTaskList)
  // app-task__item (taskList)

  // если админ и списки задач найдены, то удаляем из всех полей статусов списки задач пользователей
  if (login == "admin") {
    if (userOfTaskList.length) {
      // taskList = document.querySelectorAll(".app-task__item");
      taskFieldList.forEach((field) => {
        userOfTaskList = field.querySelectorAll(".app-task__user");
        userOfTaskList.forEach((element) => {
          field.removeChild(element);
        });
      });
    }
  }

  // ищем задачи
  let taskList = document.querySelectorAll(".app-task__item");

  // if (taskList.length) {
  //   taskList.forEach((element) => {
  //     taskFieldList.forEach((field) => {
  //       field.removeChild(element);
  //     });
  //   });
  // }

  // если найдены задачи удаляем их из всех полей статусов
  if (taskList.length) {
    while (taskList.length) {
      taskFieldList.forEach((field) => {
        taskList = field.querySelectorAll(".app-task__item");
        taskList.forEach((element) => {
          field.removeChild(element);
        });
        taskList = document.querySelectorAll(".app-task__item");
        // console.log("очистка, taskList", taskList);
      });
    }
  }

  // const taskListContainer = document.querySelector("#input-user");
  // console.log("taskList", taskList);
  // if (taskList.length) {
  //   taskList.forEach((element) => {
  //     taskFieldList.removeChild(element);
  //   });
  // }

  // если в localStorage есть какие то задачи, то создаём колекции с ключами-именами пользователей и массивами задач-значениями
  // и отображаем задачи в нужных полях статусов
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
      // console.log("tasksByUser", tasksByUser);
      // let i = 0;

      // for (const key of tasksByUser.keys()) {
      // console.log("key", key);
      // taskFieldList.insertAdjacentHTML(
      //   "beforeend",
      //   `<ul class="app-task__user">${key}:</ul>`
      // );
      // userOfTaskList = document.querySelectorAll(".app-task__user");

      // tasksByUser.get(key).forEach((elem) => {
      //   userOfTaskList[i].insertAdjacentHTML(
      //     "beforeend",
      //     `<li class="app-task__item" id='${elem.id}'>${elem.name}</li>`
      //   );
      // });

      // перебираем DOM полей статусов задач, отображаем в полях статуса всех пользователей имеющих задачи с данными статусами
      for (const field of taskFieldList) {
        for (const key of tasksByUser.keys()) {
          for (const task of tasksByUser.get(key)) {
            if (field.className.match(task.location)) {
              field.insertAdjacentHTML(
                "beforeend",
                `<ul class="app-task__user ${field}">${key}</ul>`
              );
              break;
            }
          }
        }

        // находим DOM всех отображённых в данном поле статуса списков задач пользователей
        userOfTaskList = field.querySelectorAll(".app-task__user");

        // перебираем DOM отображённых в данном поле статуса списков задач пользователей
        // если статус задачи совпадает со статусом данного поля то отображает её
        for (const user of userOfTaskList) {
          // console.log("user", user);
          // перебираем задачи пользователя
          tasksByUser.get(user.innerText).forEach((task) => {
            if (field.className.match(task.location)) {
              user.insertAdjacentHTML(
                "beforeend",
                `<li class="app-task__item" id='${task.id}'>${task.name}</li>`
              );
            }
          });
        }

        // userOfTaskList = document.querySelectorAll(".app-task__user");

        // for (const task of tasksByUser.get(key)) {
        //   for (const userStage of userOfTaskList) {
        //     if (
        //       userStage.innerHTML == key &&
        //       userStage.className.match(task.location)
        //     ) {
        //       userStage.insertAdjacentHTML(
        //         "beforeend",
        //         `<li class="app-task__item" id='${task.id}'>${task.name}</li>`
        //       );
        //     }
        //   }
        // }
      }
    } else {
      // console.log("если не админ");

      // перебираем DOM полей статусов задач, перебираем задачи пользователей
      // если статус задачи соответствует статусу поля и логин соответствует владельцу задачи, то отображаем её
      taskFieldList.forEach((field) => {
        for (const task of tasks) {
          // console.log(
          //   "field.className.match(task.location)",
          //   field.className.match(task.location)
          // );
          if (field.className.match(task.location)) {
            if (task.own == login) {
              field.insertAdjacentHTML(
                "beforeend",
                `<li class='app-task__item' id='${task.id}'>${task.name}</li>`
              );
            }
          }
        }
      });
    }

    // находим DOM всех задач
    taskList = document.querySelectorAll(".app-task__item");
    // removeEvLisOnTask(tasks, handlerTask);

    // вешаем прослушку на каждую задачу
    addEvLisOnTask(taskList, handlerTask);
  }
};

// отображает список пользователей
export const updUserList = function () {
  if (localStorage.getItem("users")) {
    const userList = document.querySelectorAll("option");
    const userListContainer = document.querySelector("#input-user");
    // console.log("userList", userList);
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

// отображает список задач
export const updTasksList = function () {
  if (localStorage.getItem("tasks")) {
    const userList = document.querySelectorAll("option");
    const userListContainer = document.querySelector("#input-user");
    // console.log("tasksList", userList);
    if (userList.length) {
      userList.forEach((element) => {
        userListContainer.removeChild(element);
      });
    }

    const tasks = getFromStorage("tasks");
    for (const task of tasks) {
      userListContainer.insertAdjacentHTML(
        "beforeend",
        `<option value="${task.name}">${task.name}</option>`
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

// вешает прослушку handlerTask на каждый элемент DOM из массива tasks
export const addEvLisOnTask = function (tasks, handlerTask) {
  if (tasks.length) {
    for (const task of tasks) {
      task.addEventListener("click", handlerTask);
    }
  }
};

// удаляет элемент из localStorage по ключу и id
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

// изменяет элемент в localStorage по ключу, id, изменяемому полу и информации в данном поле
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

// перемещает задачу на следующую стадию (работа функции не проверена на практике)
export const moveToNextStage = function (taskId) {
  const locationList = ["backlog", "ready", "inprogress", "finish"];
  const storageData = getFromStorage("tasks");
  storageData.forEach((element) => {
    if (element.id == taskId) {
      if (element.location == locationList[3]) return false;
      for (let i = 0; i < locationList.length - 1; i++) {
        if (location[i] == element.location) {
          editInStorage("tasks", taskId, "location", locationList[i + 1]);
          break;
        }
      }
    }
  });
};
