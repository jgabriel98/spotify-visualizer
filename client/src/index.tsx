/* @refresh reload */
import { render } from 'solid-js/web'

import { ColorModeProvider } from '@kobalte/core'
import { Route, Router } from '@solidjs/router'
import './index.css'
import App from './UI/pages/App'
import { AuthPage } from './UI/pages/Auth'
import { Settings } from './UI/pages/settings'
import { SettingsProvider } from './UI/pages/settings/context'

const root = document.getElementById('root')!

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
    <SettingsProvider dimensionContainer={root}>
      <ColorModeProvider initialColorMode='dark' storageManager={undefined}>
        <Router>
          <Route path='/' component={App} />
          <Route path='/auth' component={AuthPage} />
          <Route path='/settings' component={Settings} />
        </Router>
      </ColorModeProvider>
    </SettingsProvider>
  , root!
);
