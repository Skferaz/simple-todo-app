# simple-todo-app

A small todo application: Express routes over a SQLite-backed store.

Used as a fixture for automated code review tooling, so the branches
deliberately contain a range of code quality, security, and test coverage
characteristics.

## Running

```bash
npm install
npm start
```

The server listens on port 3000.

## Endpoints

| Method | Path          | Description            |
|--------|---------------|------------------------|
| GET    | `/todos`      | List all todos         |
| GET    | `/todos/:id`  | Fetch a single todo    |
| POST   | `/todos`      | Create a todo          |
| PATCH  | `/todos/:id`  | Update a todo          |
| DELETE | `/todos/:id`  | Delete a todo          |

## Tests

```bash
npm test
```
