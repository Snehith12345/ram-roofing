import { LogOut, User } from "lucide-react";

function BuildingIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );
}

export default function Navbar({ userEmail, displayName, onLogout }) {
  const label = displayName || userEmail?.split("@")[0] || "User";

  return (
    <nav className="border-b border-gray-200 bg-white shadow-lg print:hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex min-w-0 flex-1 items-center">
            <div className="flex flex-shrink-0 items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                <BuildingIcon className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 truncate text-lg font-bold text-gray-900 sm:text-xl">
                <span className="hidden sm:inline">RAM Roofing Industries</span>
                <span className="sm:hidden">RAM Roofing</span>
              </span>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <User className="h-4 w-4 text-gray-500 sm:h-5 sm:w-5" />
              <span className="max-w-[6rem] truncate text-xs font-medium text-gray-700 sm:max-w-none sm:text-sm">{label}</span>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center space-x-1 p-1 text-gray-500 transition-colors hover:text-gray-700"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden text-xs sm:inline sm:text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
