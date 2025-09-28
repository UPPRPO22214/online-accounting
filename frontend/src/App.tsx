import { Route, Switch } from "wouter"
import { MainPage, AccountPage } from "@/pages"

export const App = () => {
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
  )
}
