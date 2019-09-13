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

  componentDidUpdate(_, prevState) {
    if (prevState.round < this.state.round) {
      this.getTask(this.state.round);
      this.getAnswers(this.state.round);
    }
  }

  getTask = (taskNum) => {
    axios.get(`api/task/${taskNum}`)
      .then(({ data }) => this.setState({ task: data }))
      .catch((error) => console.error(error));
  };

  getAnswers = (taskNum) => {
    axios.get(`api/answers/${taskNum}`)
      .then(({ data }) => this.setState({ answers: data }))
      .catch((error) => console.error(error));
  };

  goToNextRound = () => {
    this.setState({ round: this.state.round + 1 });
  };

  render() {
    const { answers, points, participants, round, task } = this.state;

    return (
      <div className='app'>
        <div className='left'>
          {answers.map((answer, i) => (
            <div className={`answer ${answer === task['label'] ? 'correct' : 'wrong'}`} key={i}>
              <h1>Team {i + 1}</h1>
              <h1>{answer}</h1>
            </div>
          ))}
        </div>
        <div className='middle'>
          <h1 className='round'>Round { round }</h1>
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
