export const animationResponse = (type, value) => {
    return dispatch => {
        if (type == 'animation-value') {
            dispatch({ type: "ANIMATION_PLAYING", payload: value });
        }
    }
}