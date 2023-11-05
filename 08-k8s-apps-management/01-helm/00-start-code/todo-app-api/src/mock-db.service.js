// https://www.stefanjudis.com/snippets/how-to-import-json-files-in-es-modules-node-js/
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const initialData = require("./mock-todo-collection.json");

const createSortFunc = (property, obj) => {
  const sortOrder = obj[property];

  if (sortOrder < 0) {
    return (objA, objB) => objA[property] - objB[property];
  }

  if (sortOrder > 0) {
    return (objA, objB) => objB[property] - objA[property];
  }
};

const getMaxValue = (collection = [], property) => {
  const maxValueFunctor = collection.reduce((acc, curr) => {
    const accId = +acc[property];
    const currId = +curr[property];
    if (accId >= currId) {
      return acc;
    }

    return curr;
  });

  return maxValueFunctor;
};

const select = (property, obj) => obj[property];

class Collection {
  constructor() {
    this.data = initialData;
  }

  insert(todo, cb) {
    try {
      const maxValue = getMaxValue(this.data, "_id");
      const maxId = select("_id", maxValue);
      const newTodo = {
        ...todo,
        _id: +maxId + 1,
      };

      this.data = [...this.data, newTodo];
      if (!cb) {
        return Promise.resolve(newTodo);
      }
      cb(null, newTodo);
    } catch (error) {
      if (!cb) {
        return Promise.reject(error);
      }
      cb(error, null);
    }
  }

  async insertOne(todo, cb) {
    if (!cb) {
      await this.insert(todo);
    } else {
      this.insert(todo, cb);
    }
  }

  find() {
    return this;
  }

  sort(sortingObj) {
    if (sortingObj) {
      const property = Object.keys(sortingObj)[0];
      const sortFunc = createSortFunc(property, sortingObj);
      this.data.sort(sortFunc);
    }

    return this;
  }

  toArray(cb) {
    if (!cb) {
      return Promise.resolve([...this.data]);
    } else {
      cb(null, [...this.data]);
    }
  }
}

export const collection = new Collection();

// module.exports = collection;
