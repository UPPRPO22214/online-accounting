import { Route, Switch } from 'wouter';
import { MainPage, AccountPage } from '@/pages';

export const App = () => {
  return (
    <>
      <header></header>
      <main className="p-2 md:py-10 md:px-60">
        <Switch>
          <Route path="/">
            <MainPage />
          </Route>
          <Route path="/account/:accountId">
            <AccountPage />
          </Route>
          <Route>404</Route>
        </Switch>
      </main>
      <footer></footer>
    </>
  );
};
