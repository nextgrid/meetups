const express = require('express');
const path = require('path');
const BodyParser = require('body-parser');
const Multer = require('multer');

const multer = Multer({
  storage: Multer.MemoryStorage
});

const app = express();
const INDEX_FILE = 'index.html';

var tasks_controller = require('./controllers/tasksController');
var judging_controller = require('./controllers/judgingController');

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));
app.use('/static', express.static(path.resolve(__dirname, '../..', 'dist')), express.static(path.resolve(__dirname, '../..', 'public')));

// -- Tasks
// body e.g.
// { "accountId": 2, "taskId": 3, "model": "--trained model json--" }
var modelUpload = multer.fields([
  { name: "modelName", maxCount: 1 },
  { name: "model", maxCount: 1 },
  { name: "accountId", maxCount: 1 },
  { name: "taskId", maxCount: 1 }
]);
app.post('/api/tasks/send_model', modelUpload, tasks_controller.send_model_post);
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
    root: __dirname + '../../../dist/'
  });
});

const PORT = 3000;
app.listen(PORT);
