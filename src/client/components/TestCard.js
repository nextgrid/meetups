import React from 'react';
import PropTypes from 'prop-types';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';

function TestCard(props) {
    return (
        <Card style={props.style}>
            <CardHeader
                title={
                    <Typography 
                        gutterBottom 
                        variant="h5" 
                        component="h2"
                    >
                        {props.title}
                    </Typography>
                }
                subheader={props.subheader}/>

            <CardMedia
                component="img"
                image={props.src}
                height="100%"
            />
        </Card>
    );
}

TestCard.propTypes = {
    title: PropTypes.string,
    subheader: PropTypes.string,
    src: PropTypes.string,
};

export default TestCard;