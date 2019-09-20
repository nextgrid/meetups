import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { TASK_ID } from './config';
import './App.scss';
import { makeStyles } from '@material-ui/core/styles';

import Header from './components/Header.js';
import RankingCard from './components/RankingCard.js';
import TestCard from './components/TestCard.js';
import ProgressCard from './components/ProgressCard.js';
import StandingsCard from "./components/StandingsCard";

import SendIcon from '@material-ui/icons/Send';
import Button from '@material-ui/core/Button';

import { ThemeProvider } from '@material-ui/styles';
import { createMuiTheme } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: { main: red[500] },
    secondary: { main: '#11cb5f' }
  },
});

const useStyles = makeStyles(theme => ({
  margin: {
    margin: theme.spacing(1),
  },
  extendedIcon: {
    marginLeft: theme.spacing(1),
  },
  header: {
    color: "#FFFFFF",
    fontSize: 40,
  },
  leftPanel: {
    margin: 5,
    marginLeft: 20,
    height: "100%",
  },
  rightPanel: {
    margin: 5
  },
  row: {
    width: "100%", 
    display: 'flex', 
    justifyContent: 'center'
  }
}));

function Round(props) {
  const classes = useStyles();

  return (
    <div>
      <div 
        className="row"
        style={{
          marginLeft: "9%",
          marginRight: "9%",
          paddingTop: "2%"
        }}>
        <Header style={classes.header} part={1}/>
      </div>
      <div 
        className="row" 
        style={{
          width: "100%", 
          display: 'flex', 
          justifyContent: 'center',
        }}
      >
        <div className="col-5">
          <RankingCard 
            className={classes.root} 
            style={{
              height: 600
            }}
            round={props.round}
            results={props.results}
          />            
        </div>
        <div className="col-5">
          <TestCard 
          style={{
            height: 600
          }}
            src={props.src}
            title={props.title}
            subheader={props.subheader}/>
        </div>
      </div>
      <div 
        className="row" 
        style={{
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginTop: 30
        }}
      >
        <Button 
          variant="outlined" 
          size="large" 
          color="primary"
          onClick={props.goToNextRound}
        >
          Next round
          <SendIcon className={classes.extendedIcon} />
        </Button>
      </div>
    </div>
  )
}

Round.propTypes = {
  title: PropTypes.string,
  subheader: PropTypes.string,
  src: PropTypes.string,
  round: PropTypes.number,
  results: PropTypes.arrayOf(PropTypes.shape({
    team: PropTypes.string,
    percentage: PropTypes.number,
    stauts: PropTypes.string,
    score: PropTypes.number,
    diff: PropTypes.number,
  })),
  goToNextRound: PropTypes.func,
};

class App extends React.Component {
  state = {
    round: 0,
  };

  componentDidMount() {
    this.getAnswers(TASK_ID);
  }

  refreshRounds = () => {
    localStorage.removeItem('rounds');
    this.setState({ rounds: undefined }, () => this.getAnswers(TASK_ID));
  };

  // Get answers (parse "/judge/judge" response)
  getAnswers = (taskId) => {
    const rounds = localStorage.getItem('rounds');
    if (rounds) {
      this.setState({ rounds: JSON.parse(rounds) });
      return;
    }

    axios.get(`/api/judge/judge?taskId=${taskId}`)
      .then(({data}) => data)
      .then(rounds => {
        rounds = rounds.map(({testUrl, res}) => {
          const label = testUrl.match(/(\w{3})\d\.jpg/)[1];
          const results = res
            .map(({
              accountId, 
              status,
              res: { '0': cat, '1': dog }
            }) => ({
              id: accountId,
              status: status === 'ok',
              result: status === 'ok'
                ? label === 'cat' ? cat : dog
                : 0
            }))
            .sort((a, b) => a.result - b.result) // Ascending by results
            .map((result, index) => ({
              ...result,
              rankByResult: index + 1,
            }))
            .sort((a, b) => b.id - a.id) // Descending by group IDs
          return {
            url: testUrl,
            label,
            results,
          };
        }).map(({ url, label, results }, index, rounds) => {
          return {
            url,
            label,
            results: results
              .map((result, resultIndex) => ({
                ...result,
                score: rounds
                  .slice(0, index + 1)    
                  .map(round => round.results[resultIndex].rankByResult)
                  .reduce((prev, cur) => prev + cur),
                diff: result.rankByResult - (
                  index > 0
                  ? rounds[index - 1].results[resultIndex].rankByResult
                  : 0
                )
              }))
              .sort((a, b) => b.score - a.score)
              .map((result, resultIndex) => ({
                ...result,
                rank: resultIndex + 1
              }))
              .sort((a, b) => b.result - a.result)
          }
        });

        localStorage.setItem('rounds', JSON.stringify(rounds));
        this.setState({ rounds });
      })
      .catch((error) => console.error(error));
  };

  goToNextRound = () => {
    this.setState({ round: this.state.round + 1 });
  };

  render() {
    const { round, rounds } = this.state;

    const wrapWithTheme = (jsx) => {
      return (
        <ThemeProvider theme={theme}>
          { jsx }
        </ThemeProvider>
      );
    }

    if (round === 0) {
      return wrapWithTheme(this._getHello());
    }
    if (round < rounds.length) {
      return wrapWithTheme(this._getRound());
    }

    return wrapWithTheme(this._getBye());
  }

  _getHello() {
    return (
      <div style={{
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        paddingTop: "15%",
        paddingBottom: "15%"
      }}>
        <ProgressCard 
          isDone={!!this.state.rounds} 
          onStart={this.goToNextRound}
          onRefresh={this.refreshRounds}
        />
      </div>
    );
  }

  _getRound() {
    const { round, rounds } = this.state;
    const { url, label, results } = rounds[round - 1];

    return (
      <Round
        title={label}
        subheader={url.substring(url.lastIndexOf('/') + 1)}
        src={url}
        round={round}
        results={
          results.map(({ id, result, status, score, diff, rank }) => ({
            team: `Team ${id}`,
            status,
            percentage: Math.floor(result * 99 + 1),
            score,
            diff,
            rank
          }))
        }
        goToNextRound={this.goToNextRound}
      />
    );
  }

  _getBye() {
      const { rounds } = this.state;
      const { results } = rounds[rounds.length - 1];

      return (
        <div style={{
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          paddingTop: "10%",
          paddingBottom: "15%"
        }}>
          <StandingsCard results={results}/>
        </div>
      );
  }
}

export default App;
