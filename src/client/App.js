import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
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
    this.getAnswers(1);
  }

  // Get answers (parse "/judge/judge" response)
  getAnswers = (taskId) => {
    axios.get(`/api/judge/judge?taskId=${taskId}`)
      .then(({data}) => data)
      .then(rounds => {
        this.setState({ rounds: rounds.map(({testUrl, res}) => {
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
        })});
      })
      .catch((error) => console.error(error));
  };

  goToNextRound = () => {
    this.setState({ round: this.state.round + 1 });
  };

  render() {
    const { round, rounds } = this.state;

    return (
      <ThemeProvider theme={theme}>
        {round === 0
        ? (
          <div style={{
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            paddingTop: "15%"
          }}>
            <ProgressCard 
              isDone={!!rounds} 
              onStart={this.goToNextRound}
            />
          </div>
        )
        : (() => {
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
        })()
        }
      </ThemeProvider>
    )
  }
}

export default App;
