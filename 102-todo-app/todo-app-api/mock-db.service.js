const initialData = require('./mock-todo-collection.json');

const createSortFunc = (property, obj) => {
  const sortOrder = obj[property];

  if (sortOrder < 0) {
    return (objA, objB) => objA[property] - objB[property];
  }

  if (sortOrder > 0) {
    return (objA, objB) => objB[property] - objA[property];
  }
}

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
}

const select = (property, obj) => obj[property];

class Collection {
  constructor() {
    this.data = initialData;
  }

  insert(todo, cb) {
    try {
      const maxValue = getMaxValue(this.data, '_id');
      const maxId = select('_id', maxValue);
      const newTodo = {
        ...todo,
        _id: +maxId + 1
      };

      this.data = [...this.data, newTodo];
      cb(null, newTodo);
    } catch (error) {
      cb(error, null);
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
    cb(null, [...this.data]);
  }
}

const collection = new Collection();

module.exports = collection;