import { Link } from 'react-router-dom';
import { GraduationCap, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 text-2xl font-bold text-primary-600 dark:text-primary-400 mb-8">
          <GraduationCap className="w-8 h-8" />
          AlumniConnect
        </div>

        {/* 404 */}
        <div className="mb-8">
          <h1 className="text-9xl font-extrabold text-primary-600/20 dark:text-primary-400/20 leading-none select-none">
            404
          </h1>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white -mt-4">Page Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-sm mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 btn-secondary px-6 py-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 btn-primary px-6 py-3"
          >
            <Home className="w-4 h-4" />
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
