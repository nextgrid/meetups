import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { TrendingDown, TrendingUp, TrendingFlat } from '@material-ui/icons';

function StandingsCard(props) {
    return (
        <Card style={props.style}>
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
                        {props.results.map(({ id, score }, index) => (
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

StandingsCard.propTypes = {
    round: PropTypes.number,
    results: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        percentage: PropTypes.number,
        stauts: PropTypes.string,
        score: PropTypes.number,
        diff: PropTypes.number,
    })),
};

export default StandingsCard;
