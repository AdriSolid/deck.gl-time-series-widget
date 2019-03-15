import logger from 'redux-logger';
import thunk from 'redux-thunk';
import { applyMiddleware, createStore } from 'redux';
import Reducers from '../reducers/reducers';

const StoreRef = createStore(Reducers, applyMiddleware(thunk, logger));

export default StoreRef;
