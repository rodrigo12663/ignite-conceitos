const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found" });
  }

  request.user = user;



  return next();
}

  app.post('/users', (request, response) => {
    const { name, username } = request.body;
  
    const userAlreadyExists = users.find((user) => user.username === username);
  
    if (userAlreadyExists) {
      return response.status(400).json({ error: "User already exists!" });
    }
  
    const user = {
      id: uuidv4(),
      name,
      username,
      todos: []
    }
  
    users.push(user);
  
    response.status(201).json(user);
  });

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    response.status(404).json({
      error: "Is not possible update a non-existing todo"
    });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  response.status(201).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {;
  const {user} = request;
  const {id} = request.params;

  const todos = user.todos.find((todos)=>todos.id === id);
  

  if (!todos) {
    response.status(404).json({
      error: "is not possible update a non-existing todo"
    });
  }

  todos.done= true;

  return response.status(201).json(todos);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    response.status(404).json({
      error: "Is not possible remove a non-existing todo"
    });
  }

  user.todos.splice(todo, 1);

  response.status(204).send();
});

module.exports = app;