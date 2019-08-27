const color = 'rgb(0, 126, 230)';

export const styles = theme => ({
  slider: {
    width: '99%',
    margin: '8px 0 30px 0',
    padding: '0 6px 0 6px',
    '& button': {
      backgroundColor: color,
      '&:after': {
        content: '""',
        borderRight: `3px solid ${color}`,
        height: '26px',
        marginTop: '-36px'
      }
    }
  }
});
