/* @refresh reload */
import { render } from 'solid-js/web'

import './index.css'
import App from './UI/pages/App'
import { Route, Router } from '@solidjs/router'
import { Auth } from './UI/pages/Auth'

const root = document.getElementById('root')

declare global {
  interface Console {
    logTime: typeof console.log
  }
}

console.logTime = (...args) => {
  const t = new Date();
  var timestamp = `[${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}] `;
  console.log(timestamp, ...args);
}

render(
  () =>
    <Router>
      <Route path='/' component={App} />
      <Route path='/auth' component={Auth} />
    </Router>
  , root!
);
