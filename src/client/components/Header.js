import React from 'react';
import PropTypes from 'prop-types';

const styles = {
    header: {
        color: "#FFFFFF",
        fontSize: 40
    }
};

function Header(props) {
    return (
      <div style={styles.header}>
        <p style={{ 
            display: 'inline',
            fontWeight: "bold", 
            fontFamily: 'Consolas'
        }}>next</p>
        <p style={{
            display: 'inline', 
            color: "#E84D3D", 
            fontWeight: "bold", 
            fontFamily: 'Consolas'
        }}>grid</p>
        <p style={{
            display: 'inline', 
            fontWeight: "bold", 
            fontSize: 29, 
            fontFamily: 'Consolas'
        }}> /</p>
        <p style={{
            display: 'inline', 
            fontSize: 19
        }}> Warsaw Deep Learning Labs</p>
        <p style={{
            display: 'inline', 
            fontWeight: "bold", 
            color: "#E84D3D",
            fontSize: 19
        }}> Part {props.part}</p>
      </div>
    );
}

Header.propTypes = {
    part: PropTypes.number,
};

export default Header;
