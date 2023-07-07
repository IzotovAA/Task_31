"use strict";

import { appState } from "./app";

// достаёт данные из localStorage
export const getFromStorage = function (key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
};
// ...

// добавляет данные в localStorage
export const addToStorage = function (obj, key) {
  const storageData = getFromStorage(key);
  storageData.push(obj);
  localStorage.setItem(key, JSON.stringify(storageData));
};
// ...

// создаёт нового пользователя, аргумент - класс User
export const generateTestUser = function (User) {
  const testUser = new User("test", "123");
  User.save(testUser);
};
// ...

// создаёт админа, аргумент - класс Admin
export const generateAdmin = function (Admin) {
  const admin = new Admin("admin", "123");
  Admin.save(admin);
};
// ...

// добавляет нового пользователя, , аргументы: класс User, имя, пароль
export const addUser = function (User, login, password) {
  const user = new User(login, password);
  User.save(user);
};
// ...

// проверяет является ли текущий пользователь админом
export const isCurrentUserAdmin = function () {
  return appState.currentUser.login == "admin" ? true : false;
};
// ...

// проверяет свободно ли имя пользователя или занято
export const isTheLoginFree = function (login) {
  const users = getFromStorage("users");
  if (users.length == 0) return true;
  for (const user of users) {
    if (user.login == login) return false;
  }
  return true;
};
// ...

// отображает задания во всех полях статусов, аргументы: список с полями статусов,
// имя пользователя для которого отображаем, обработчик для прослушки отображённых задач
export const displayTasks = function (taskFieldList, login, handlerTask) {
  // ищем и сохраняем списки задач пользователей (если задачи отображались при админе)
  let userOfTaskList = document.querySelectorAll(".app-task__user");

  // backlog (taskField)
  // app-task__user (userOfTaskList)
  // app-task__item (taskList)

  // если админ и списки задач найдены, то перебираем поля статусов
  // ищем в них и удаляем списки задач пользователей
  if (login == "admin") {
    if (userOfTaskList.length) {
      taskFieldList.forEach((field) => {
        userOfTaskList = field.querySelectorAll(".app-task__user");
        userOfTaskList.forEach((element) => {
          field.removeChild(element);
        });
      });
    }
  }

  // ищем и сохраняем задачи (если задачи отображались при обычном пользователе)
  let taskList = document.querySelectorAll(".app-task__item");

  // если задачи найдены, то перебираем поля статусов,
  // ищем в них и удаляем все задачи
  if (taskList.length) {
    taskFieldList.forEach((field) => {
      taskList = field.querySelectorAll(".app-task__item");
      taskList.forEach((element) => {
        field.removeChild(element);
      });
    });
  }

  // если в localStorage есть какие то задачи, то создаём колекцию
  // с ключами - именами пользователей и значениями - массивами задач
  // и отображаем задачи в нужных полях статусов
  if (localStorage.getItem("tasks")) {
    const tasks = getFromStorage("tasks");
    const tasksByUser = new Map();

    // перебираем задачи
    for (const task of tasks) {
      // если Map не содержит ключа - имя владельца задачи,
      // то добавляем задачу по ключу - имени
      if (!tasksByUser.has(task.own)) {
        tasksByUser.set(task.own, [task]);
      }

      // иначе создаём временный массив, копируем в него задачи которые хранятся в Map
      // добавляем во временный массив перебираемую задачу
      // записываем массив с новой задачей в Map
      else {
        const tempUserArr = tasksByUser.get(task.own);
        tempUserArr.push(task);
        tasksByUser.set(task.own, tempUserArr);
      }
    }

    // если админ
    if (login == "admin") {
      // перебираем DOM полей статусов задач
      for (const field of taskFieldList) {
        // перебираем имена пользователей в Map
        for (const key of tasksByUser.keys()) {
          // перебираем задачи каждого пользователя
          for (const task of tasksByUser.get(key)) {
            // если класс поля статуса содержит название статуса из задачи пользователя,
            // то отбразить список задач пользователя в поле статуса
            // (на данном этапе пустой ul с именем,
            // в котором позже будет добавлен список задач li)
            if (field.className.match(task.location)) {
              field.insertAdjacentHTML(
                "beforeend",
                `<ul class="app-task__user ${field}">${key}</ul>`
              );
              // прервать перебор задач, на каждое поле статуса
              // нужно лишь одно отображение списка задач пользователя
              break;
            }
          }
        }

        // находим DOM всех отображённых в данном поле статуса списков задач пользователей
        userOfTaskList = field.querySelectorAll(".app-task__user");

        // перебираем DOM отображённых в данном поле статуса списков задач пользователей
        for (const user of userOfTaskList) {
          // перебираем задачи пользователя
          tasksByUser.get(user.innerText).forEach((task) => {
            // если статус задачи совпадает со статусом данного поля то отображаем её
            if (field.className.match(task.location)) {
              user.insertAdjacentHTML(
                "beforeend",
                `<li class="app-task__item" id='${task.id}'>${task.name}</li>`
              );
            }
          });
        }
      }
    }

    // иначе (не админ)
    else {
      // перебираем DOM полей статусов задач
      taskFieldList.forEach((field) => {
        // перебираем задачи пользователей
        for (const task of tasks) {
          // если статус задачи соответствует статусу поля
          if (field.className.match(task.location)) {
            // если логин соответствует владельцу задачи, то отображаем её
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

    // находим DOM всех отображённых задач
    taskList = document.querySelectorAll(".app-task__item");

    // вешаем прослушку на каждую задачу, обработчик берём из аргумента
    addEvLisOnTask(taskList, handlerTask);
  }
};
// ...

// обновляет и отображает список пользователей в строке выбора !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// остановился тут
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

// обновляет и отображает список задач в строке выбора (функция не проверена на практике)
// работает не корректно
// надо исправить, например в инпуте ready должны отображаться только задачи локализованные в backlog и т.д.
// что то не так работает с добавлением задач в finished, хочет брать из backlog, а должна из inprogress !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
export const updTasksList = function (field) {
  if (localStorage.getItem("tasks")) {
    const userList = document.querySelectorAll("option");
    const userListContainer = document.querySelector("#input-user");
    const locationList = ["backlog", "ready", "inprogress", "finished"];
    let displayField = "backlog";
    const user = appState.currentUser.login;
    const tasks = getFromStorage("tasks");

    if (userList.length) {
      userList.forEach((element) => {
        userListContainer.removeChild(element);
      });
    }

    for (let i = 0; i < locationList.length; i++) {
      if (locationList[i] == field) {
        displayField = locationList[i - 1];
      }
    }

    for (const task of tasks) {
      if (task.location == displayField) {
        if (user == "admin" || task.own == user) {
          userListContainer.insertAdjacentHTML(
            "beforeend",
            `<option value="${task.id}">${task.name}</option>`
          );
        }
      }
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

// изменяет элемент в localStorage по ключу, id, изменяемому полю и информации в данном поле
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

// перемещает задачу на следующую стадию
export const moveToNextStage = function (taskId) {
  console.log("taskId", taskId);
  const locationList = ["backlog", "ready", "inprogress", "finished"];
  const storageData = getFromStorage("tasks");
  storageData.forEach((element) => {
    // console.log("element.id == taskId", element.id == taskId);
    if (element.id == taskId) {
      if (element.location == locationList[3]) return false;
      for (let i = 0; i < locationList.length - 1; i++) {
        // console.log(
        //   "location[i] == element.location",
        //   location[i] == element.location
        // );
        // console.log("element.location", element.location);
        // console.log("location[i]", location[i]);
        if (locationList[i] == element.location) {
          editInStorage("tasks", taskId, "location", locationList[i + 1]);
          break;
        }
      }
    }
  });
};
