import React from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

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

/* Props: round, results = {team, percentage} */
function Ranking(props) {
    return (
        <Card style={props.style}>
            <CardHeader
                title={
                    <Typography gutterBottom variant="h5" component="h2">
                        Round {props.round}
                    </Typography>
                }
                subheader="Ranking"
            />
            <CardContent>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>#</TableCell>
                            <TableCell align="left">Team</TableCell>
                            <TableCell align="right">Percentage</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.results.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell component="th" scope="row">{index + 1}</TableCell>
                                <TableCell align="left">{row.team}</TableCell>
                                <TableCell align="right">{`${getBadge(row.percentage)} ${row.percentage}%`}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default Ranking;