import React from 'react';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Fade from '@material-ui/core/Fade';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { TrendingDown, TrendingUp, TrendingFlat } from '@material-ui/icons';

const getBadge = (result) => {
    if (result > 90.0) return "🌕🌕🌕";
    if (result > 80.0) return "🌔🌕🌕";
    if (result > 70.0) return "🌓🌕🌕";
    if (result > 60.0) return "🌒🌕🌕";
    if (result > 50.0) return "🌑🌔🌕";
    if (result > 40.0) return "🌑🌓🌕";
    if (result > 30.0) return "🌑🌒🌕";
    if (result > 20.0) return "🌑🌑🌔";
    if (result > 10.0) return "🌑🌑🌓";

    return "🌑🌑🌒";
};

const getTrend = (diff) => {
    if (diff > 0) return (<TrendingUp style={{ color: 'green' }} />);
    if (diff === 0) return (<TrendingFlat style={{ color: 'yellow' }} />);

    return (<TrendingDown style={{ color: 'red' }} />);
}

class Ranking extends React.Component {
    render() {
        return (
            <Card style={this.props.style}>
                <CardHeader
                    title={
                        <Typography gutterBottom variant="h5" component="h2">
                            Round {this.props.round}
                        </Typography>
                    }
                    subheader="Ranking"
                />
                <CardContent>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell align="left">Team</TableCell>
                                <TableCell align="center">Result</TableCell>
                                <TableCell align="center">Acc</TableCell>
                                <TableCell align="center">Round score</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.props.results.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell align="left">{row.teamName}</TableCell>
                                    <TableCell 
                                        align="center" 
                                        style={{color: row.correct ? "#19ff85" : "#ff3c19" }}>
                                    { row.status
                                        ? `${row.result}`
                                        : `💀`
                                    }</TableCell>
                                    <TableCell 
                                        align="center" 
                                        style={{color: row.correct ? "#19ff85" : "#ff3c19" }}>
                                    { row.status
                                        ? `${row.acc}%`
                                        : `💀`
                                    }</TableCell>
                                    <TableCell align="center">{row.score}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        );
    }
}

Ranking.propTypes = {
    round: PropTypes.number,
    results: PropTypes.arrayOf(PropTypes.shape({
        teamName: PropTypes.string,
        correct: PropTypes.bool,
        result: PropTypes.string,
        acc: PropTypes.number,
        status: PropTypes.bool,
        score: PropTypes.number,
        diff: PropTypes.number,
    })),
};

export default Ranking;