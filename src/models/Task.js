"use strict";

import { BaseModel } from "./BaseModel";
import { addToStorage } from "../utils";
import { appState } from "../app";

export class Task extends BaseModel {
  constructor(taskName, taskOwn) {
    super();
    // this.own = appState.currentUser.login;
    this.own = taskOwn;
    this.name = taskName;
    this.storageKey = "tasks";
  }

  static save(task) {
    try {
      addToStorage(task, task.storageKey);
      return true;
    } catch (e) {
      throw new Error(e);
    }
  }
}
