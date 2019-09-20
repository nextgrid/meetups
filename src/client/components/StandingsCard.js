import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import { SUSPENSE_SECONDS } from '../config';

const styles = { };

const getLabel = (second) => {
    if (second >= 5) return "Check FB 📱";
    if (second >= 4) return "Send kisses 💋";
    if (second >= 3) return "Fasten seatbelt 🛬";
    if (second >= 2) return "Wipe sweat 💦";
    if (second >= 1) return "Don't panic 😱";
    
    return "";
}

class StandingsCard extends React.Component {
    state = {
        countdownMsec: (SUSPENSE_SECONDS + 1) * 1000,
    };

    componentDidMount() {
        this.countdownFunction = setInterval(
            () => this.setState({ countdownMsec: this.state.countdownMsec - 10 }),
            10,
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.countdownMsec === 1000) {
            clearInterval(this.countdownFunction);
            new Audio('/static/winner.mp3').play();
        }
    }

    render() {
        const { classes } = this.props;
        const { countdownMsec } = this.state;

        if (countdownMsec > 1000) {
            return (
                <Card style={{
                    width: "40%",
                    height: "45%",
                    justifyContent: 'center',
                    textAlign: 'center',
                    padding: 30
                }}>
                    <CardHeader
                        title={
                            <Typography gutterBottom variant="h5" component="h2">
                                Final results in { parseInt(countdownMsec / 1000) }!
                            </Typography>
                        }
                        subheader={
                            <p style={{
                                display: 'inline', 
                                fontSize: 19
                            }}> { getLabel(parseInt(countdownMsec / 1000)) }</p>
                        }
                    />
                    <CardContent style={{
                        marginTop: '20px'
                    }}>
                        <CircularProgress
                            className={classes.progress}
                            variant="determinate"
                            value={(5000 - countdownMsec) / 50 + 10}
                            size={100}
                        />
                    </CardContent>
                </Card>
            )
        }

        const { style, results } = this.props;
        results.sort((a, b) => b.score - a.score);

        return (
            <Card style={style}>
                <CardHeader
                    title={
                        <Typography gutterBottom variant="h5" component="h2">
                            Summary
                        </Typography>
                    }
                />
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Place</TableCell>
                                <TableCell align="left">Team</TableCell>
                                <TableCell align="center">Score</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {results.map(({ teamName, score }, index) => (
                                <TableRow key={index}>
                                    <TableCell component="th" scope="row">{index + 1}</TableCell>
                                    <TableCell align="left">{teamName}</TableCell>
                                    <TableCell align="center">{score}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        );
    }
}

StandingsCard.propTypes = {
    round: PropTypes.number,
    results: PropTypes.arrayOf(PropTypes.shape({
        teamName: PropTypes.string,
        percentage: PropTypes.number,
        status: PropTypes.bool,
        score: PropTypes.number,
        diff: PropTypes.number,
    })),
};

export default withStyles(styles)(StandingsCard);
