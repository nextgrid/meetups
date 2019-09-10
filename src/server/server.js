const express = require('express');
const path = require('path');

const app = express();
const INDEX_FILE = 'index.html';

var tasks_controller = require('./controllers/tasksController');
var judging_controller = require('./controllers/judgingController');

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'dist')));

// -- Tasks
// body e.g.
// { "accountId": 2, "taskId": 3, "model": "--trained model json--" }
app.post('/api/tasks/send_model', tasks_controller.send_model_post);
app.get('/api/tasks/latest_model', tasks_controller.latest_model_get);
// params: accountId, taskId
app.get('/api/tasks/models_by_acc_and_task', tasks_controller.models_by_account_and_task_get);
app.get('/api/tasks/all_models', tasks_controller.all_models_get);

// -- Judge
app.get('/api/judge/compound_judge/', judging_controller.judge_task_compound_get);

// -- Other
app.get('/api', (req, res) => {
  res.send('Test endpoint message');
});

app.get('*', (req, res) => {
  res.sendFile(INDEX_FILE, {
    root: __dirname
  });
});

const PORT = 3000;
app.listen(PORT);
