import type React from 'react';
import { Route, Switch } from 'wouter';
import { MainPage, AccountPage } from '@/pages';

export const MainSwitch: React.FC = () => {
  return (
    <Switch>
      <Route path="/">
        <MainPage />
      </Route>
      <Route path="/account/:accountId">
        <AccountPage />
      </Route>
      <Route>404</Route>
    </Switch>
  );
};
