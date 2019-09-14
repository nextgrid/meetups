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


var sendModelParams = multer.fields([
  { name: "modelName", maxCount: 1 },
  { name: "model", maxCount: 1 },     // ZIP file
  { name: "accountId", maxCount: 1 },
  { name: "taskId", maxCount: 1 }
]);
app.post('/api/task/send_model', sendModelParams, tasks_controller.send_model_post);

// Params: taskId
app.get('/api/judge/judge/', judging_controller.judge_task_get);

// Get next task
app.get('/api/task/:id', (req, res) => {
  const {id} = req.params;
  if (id % 2) {
    res.json({
      label: 'dog',
      url: 'static/dog' + (Math.floor(id / 2) + 1) + '.jpg'
    });
  } else {
    res.json({
      label: 'cat',
      url: 'static/cat' + (id / 2) + '.jpg'
    });
  }
});

// Get answer for a given task
app.get('/api/answers/:id', (req, res) => {
  const answers = [];
  for (let i = 0; i < 5; i++) {
    answers.push(Math.random() * 2 > 1 ? 'dog' : 'cat');
  }
  res.json(answers);
});

app.get('*', (req, res) => {
  res.sendFile(INDEX_FILE, {
    root: __dirname + '../../../dist/'
  });
});

const PORT = 3000;
app.listen(PORT);
