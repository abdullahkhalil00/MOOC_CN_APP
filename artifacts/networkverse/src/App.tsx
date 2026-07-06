import { Switch, Route, Router as WouterRouter } from "wouter";
import { Experience } from "@/components/Experience";

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Switch>
        <Route path="/" component={Experience} />
      </Switch>
    </WouterRouter>
  );
}

export default App;
