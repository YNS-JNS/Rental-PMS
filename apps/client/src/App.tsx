import { cn } from '@/lib/utils';

function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      {/* Card Container - Modern Shadow & Rounded Corners */}
      <div
        className={cn(
          'w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-xl ring-1 ring-gray-900/5',
          'transition-all hover:shadow-2xl',
        )}
      >
        {/* Header Section */}
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">Rental PMS</h2>
          <p className="mt-2 text-sm text-gray-500">Professional Property Management System</p>
        </div>

        {/* Status Badge Mockup */}
        <div className="flex justify-center space-x-4">
          <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            System Online
          </span>
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            v1.0.0
          </span>
        </div>

        {/* Action Button Mockup */}
        <div className="pt-4">
          <button
            className={cn(
              'flex w-full justify-center rounded-md bg-black px-3 py-2.5 text-sm font-semibold text-white shadow-sm',
              'hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black',
              'transition-colors duration-200',
            )}
          >
            Access Dashboard
          </button>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-gray-400">
        &copy; 2024 Rental Management System. All rights reserved.
      </p>
    </div>
  );
}

export default App;
