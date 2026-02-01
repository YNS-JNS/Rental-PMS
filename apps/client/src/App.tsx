import { useState } from 'react';
import { cn } from '@/lib/utils'; // Testing Alias

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <h1 className={cn('text-4xl font-bold text-blue-600', 'hover:text-blue-800')}>
        Rental Management System
      </h1>
      <p className="mt-4 text-lg text-gray-600">Monorepo Setup Complete 🚀</p>
      <div className="mt-8">
        <button
          onClick={() => setCount((c) => c + 1)}
          className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800 transition"
        >
          Count is {count}
        </button>
      </div>
    </div>
  );
}

export default App;
