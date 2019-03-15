import { combineReducers } from 'redux';
import animationPlayingReducer from './animation';

const reducers = combineReducers({
    animationPlayingReducer: animationPlayingReducer
});

export default reducers;