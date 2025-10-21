import '../styles/index.css';
import { MainSwitch } from '../routes';

export const App = () => {
  return (
    <>
      <header></header>
      <main className="p-2 md:py-10 md:px-60">
        <MainSwitch />
      </main>
      <footer></footer>
    </>
  );
};
