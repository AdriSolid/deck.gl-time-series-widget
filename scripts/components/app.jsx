import React from 'react';
import { Provider } from 'react-redux';
import StoreRef from '../store/store';
import Main from './Main';

const App = () => (
  <Provider store={StoreRef}>
    <Main />
  </Provider>
);

export default App;
