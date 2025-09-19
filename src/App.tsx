import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <h1>PrepMate</h1>
        <p>Your prep companion starts here.</p>
        <button type="button" onClick={() => setCount((c) => c + 1)}>
          Count is {count}
        </button>
      </header>
    </div>
  );
}

export default App;
