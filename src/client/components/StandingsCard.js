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

const styles = {

};

class StandingsCard extends React.Component {
    state = {
        countdownSeconds: SUSPENSE_SECONDS,
    };

    componentDidMount() {
        this.countdownFunction = setInterval(
            () => this.setState({ countdownSeconds: this.state.countdownSeconds - 1 }),
            1000,
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.countdownSeconds + this.state.countdownSeconds === 1) {
            clearInterval(this.countdownFunction);
            new Audio('/static/winner.mp3').play();
        }
    }

    render() {
        const { classes } = this.props;
        const { countdownSeconds } = this.state;

        if (countdownSeconds > 0) {
            return (
                <Card style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <CardHeader
                        title={
                            <Typography gutterBottom variant="h5" component="h2">
                                Just { countdownSeconds } second
                                { countdownSeconds === 1 ? '' : 's' }
                                {' '} to go!
                            </Typography>
                        }
                    />
                    <CardContent style={{
                        marginTop: '20px'
                    }}>
                        <CircularProgress
                            className={classes.progress}
                            variant="determinate"
                            value={(5 - countdownSeconds) * 20}
                            size={200}
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
                                <TableCell>#</TableCell>
                                <TableCell align="left">Team</TableCell>
                                <TableCell align="center">Score</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {results.map(({id, score}, index) => (
                                <TableRow key={index}>
                                    <TableCell component="th" scope="row">{index + 1}</TableCell>
                                    <TableCell align="left">Team {id}</TableCell>
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
        id: PropTypes.number,
        percentage: PropTypes.number,
        status: PropTypes.bool,
        score: PropTypes.number,
        diff: PropTypes.number,
    })),
};

export default withStyles(styles)(StandingsCard);
