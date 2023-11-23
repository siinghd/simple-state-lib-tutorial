import logo from './logo.svg';
import './App.css';
import SimpleStore from './simpleStore';
SimpleStore.createStore(
  'themeStore',
  {
    theme: 'dark',
  },
  (set) => ({
    toggleTheme: (nextTheme) =>
      set((state) => ({ ...state, theme: nextTheme })),
    setLightTime: (_) => set((_) => ({ theme: 'light' })),
    setDarkTime: (_) => set((_) => ({ theme: 'dark' })),
  })
);
function App() {
  const [theme, toggleTheme, setDarkTime, setLightTime] = SimpleStore.useStore(
    'themeStore',
    [
      (store) => store.state.theme,
      (store) => store.toggleTheme,
      (store) => store.setDarkTime,
      (store) => store.setLightTime,
    ]
  );
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>{theme}</p>

        <button
          onClick={() => toggleTheme(theme === 'light' ? 'dark' : 'light')}
        >
          Chage the theme
        </button>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
