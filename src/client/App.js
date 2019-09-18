import React from 'react';
import axios from 'axios';
import './App.scss';

class App extends React.Component {
  state = {
    answers: [],
    points: [],
    participants: [],
    round: 0,
    task: { label: 'NextGrid', url: 'static/placeholder.png' },
  };

  componentDidMount() {
    this.getAnswers(1).then(ans => console.log(ans));
  }

  componentDidUpdate(_, prevState) {
    if (prevState.round < this.state.round) {
      this.getTask(this.state.round);
      this.getAnswers(this.state.round);
    }
  }

  // Get answers (parse "/judge/judge" response)
  getAnswers = (taskId) =>
    axios.get(`/api/judge/judge?taskId=${taskId}`)
      .then(({ data }) => data)
      .then(answers => {
        answers = answers.map(({ testUrl, res }) => {
          const label = testUrl.match(/(\w{3})\d\.jpg/)[1];
          const percentiles = res.map(({accountId, res: {'0': cat, '1': dog}}) => ({
            id: accountId,
            result: label === 'cat' ? cat : dog,
          })).sort((a, b) => a.result - b.result);
          const points = percentiles.reduce((acc, { id }, i) => Object.assign(acc, { [id]: i }), {});

          return {
            url: testUrl,
            label,
            percentiles,
            points,
          };
        });
        answers = answers.map((answer, i) => {
          if (i > 0) {
            answers[i - 1].points.forEach(({ id, num }) => {
              answer.points[id] += num;
            });
          }
          answer.points = Object.entries(answer.points).map(([id, num]) => ({ id, num }))
            .sort((a, b) => a.num - b.num);

          answer.diff = (i > 0)
            ? answer.points.reduce((acc, { id }, pos) =>
              Object.assign(acc, {
                [id]: answers[i - 1].points.findIndex(prev => prev.id === id ) - pos
              }), {}
            )
            : answer.points.reduce((acc, { id }) =>
              Object.assign(acc, { [id]: 0 }), {}
            );

          return answer;
        });

        return answers;
      })
      .catch((error) => console.error(error));

  getTask = (taskNum) => {
    axios.get(`api/task/${taskNum}`)
      .then(({ data }) => this.setState({ task: data }))
      .catch((error) => console.error(error));
  };

  // getAnswers = (taskNum) => {
  //   axios.get(`api/answers/${taskNum}`)
  //     .then(({ data }) => this.setState({ answers: data }))
  //     .catch((error) => console.error(error));
  // };

  goToNextRound = () => {
    this.setState({ round: this.state.round + 1 });
  };

  setColor = (result) => {
    const peak = 200;
    result *= 2;
    if (result > 1) {
      const red = Math.floor(peak * (2 - result));
      return `rgb(${red}, ${peak}, 0)`;
    } else {
      const green = Math.floor(peak * result);
      return `rgb(${peak}, ${green}, 0)`;
    }
  };

  // calcPoints = (answers) => {
  // };

  render() {
    const { answers, round, task } = this.state;
    answers.sort((a, b) => b.result - a.result);

    // const { oldPoints, newPoints } = this.calcPoints(answers);

    return (
      <div className='app'>
        <div className='left'>
          {answers.map(({ id, result }) => (
            <div style={{ color: this.setColor(result) }} key={id}>
              <h1>Team {id}</h1>
              <h1>{Math.floor(result * 99 + 1)}%</h1>
            </div>
          ))}
        </div>
        <div className='middle'>
          { round > 0
            ? <h1 className='round'>Round { round }</h1>
            : <h1 className='round'>Welcome to the event</h1>
          }
          <img className='task-pic' src={task['url']} />
          <h1 className='label'>{task['label']}</h1>
        </div>
        <div className='right'>
        </div>
        <button className='next-round-btn' onClick={this.goToNextRound}>Next round</button>
      </div>
    );
  }
}

export default App;
