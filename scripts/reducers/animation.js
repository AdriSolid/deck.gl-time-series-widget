const animationPlayingReducer = (state = {value: []}, action) => {
    if(action.type === "ANIMATION_PLAYING"){
        state = {...state, value: action.payload}
    }
    return state;
}

export default animationPlayingReducer;