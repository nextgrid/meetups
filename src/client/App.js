import React from 'react';
import axios from 'axios';
import './App.scss';
import { makeStyles } from '@material-ui/core/styles';

import Header from './components/Header.js';
import RankingCard from './components/RankingCard.js';
import TestCard from './components/TestCard.js';
import ProgressCard from './components/ProgressCard.js';

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
    marginLeft: 300,
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

/* Props: goToNextRound */
function Round(props) {
  const classes = useStyles();

  return (
    <div>
      <div 
        className="row"
        style={{
          marginLeft: "17%",
          marginRight: "17%",
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
        <div className="col-4">
          <RankingCard 
            className={classes.root} 
            style={{
              height: 600
            }}
            round={props.round}
            results={props.results}
          />            
        </div>
        <div className="col-4">
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
      .then(answers => {
        answers = answers.map(({testUrl, res}) => {
          const label = testUrl.match(/(\w{3})\d\.jpg/)[1];
          const percentiles = res.map(({accountId, res: {'0': cat, '1': dog}}) => ({
            id: accountId,
            result: label === 'cat' ? cat : dog,
          })).sort((a, b) => a.result - b.result);
          const points = percentiles.reduce((acc, {id}, i) => Object.assign(acc, {[id]: i}), {});

          return {
            url: testUrl,
            label,
            percentiles,
            points,
          };
        });
        answers = answers.map((answer, i) => {
          if (i > 0) {
            answers[i - 1].points.forEach(({id, num}) => {
              answer.points[id] += num;
            });
          }
          answer.points = Object.entries(answer.points).map(([id, num]) => ({id, num}))
            .sort((a, b) => a.num - b.num);

          answer.diff = (i > 0)
            ? answer.points.reduce((acc, {id}, pos) =>
              Object.assign(acc, {
                [id]: answers[i - 1].points.findIndex(prev => prev.id === id) - pos
              }), {}
            )
            : answer.points.reduce((acc, {id}) =>
              Object.assign(acc, {[id]: 0}), {}
            );

          return answer;
        });

        this.setState({answers});
      })
      .catch((error) => console.error(error));
  };

  goToNextRound = () => {
    this.setState({ round: this.state.round + 1 });
  };

  render() {
    const { round, answers } = this.state;

    return (
      <ThemeProvider theme={theme}>
        {round == 0
        ? (
          <div style={{
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            paddingTop: "15%"
          }}>
            <ProgressCard 
              isDone={!!answers} 
              onStart={this.goToNextRound}
            />
          </div>

        )
        : (() => {
          const { url, label, percentiles, points, diff } = answers[round - 1];
          percentiles.reverse();

          return (
            <Round 
              title={label}
              subheader="TBA"
              src={url}
              round={round}
              results={
                percentiles.map(({ id, result }) => ({
                  team: `Team ${id}`,
                  percentage: Math.floor(result * 99 + 1)
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
