import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import SendIcon from '@material-ui/icons/Send';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles(theme => ({
    progress: {
      margin: theme.spacing(2),
    },
    logoText: {
        fontSize: 40,
        fontWeight: "bold", 
        fontFamily: 'Consolas'
    }
  }));

function ProgressCard(props) {
    const classes = useStyles();
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
                    <div className={classes.logoText}>
                        <p style={{ 
                            display: 'inline',
                        }}>next</p>
                        <p style={{
                            display: 'inline', 
                            color: "#E84D3D"
                        }}>grid</p>
                    </div>
                }
                subheader={
                    <p style={{
                        display: 'inline', 
                        fontSize: 19
                    }}> Warsaw Deep Learning Labs</p>
                }
            >
            </CardHeader>
            <CardContent 
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    textAlign: 'center'
                }}
            >
                {props.isDone
                ? (
                    <Button 
                        variant="outlined" 
                        size="large" 
                        color="primary"
                        onClick={props.onStart}
                    >
                        Start
                    </Button>
                )
                : (
                    <div>
                        <CircularProgress className={classes.progress}/>
                        <Typography gutterBottom variant="body1">
                            Fetching scores.
                        </Typography>
                        <Typography gutterBottom variant="body2">
                            Please wait.
                        </Typography>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

ProgressCard.propTypes = {
    onStart: PropTypes.func,
    isDone: PropTypes.bool,
};

export default ProgressCard;