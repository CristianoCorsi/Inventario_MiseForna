import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { getCurrentLanguage, setLanguage, useTranslation } from "@/lib/i18n"; // Added import for useTranslation
import Logo from "@/components/ui/logo"; // Import the logo component

interface SidebarProps {
  isMobileOpen: boolean;
  toggleMobileMenu: () => void;
}

export default function Sidebar({
  isMobileOpen,
  toggleMobileMenu,
}: SidebarProps) {
  const [location] = useLocation();
  const { t } = useTranslation(); // Added useTranslation hook

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col justify-between w-64 bg-white border-r border-gray-200 md:relative md:translate-x-0 transition-transform duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <Logo size="md" />
              <span className="ml-2 text-lg font-semibold">
                {t("org.name")}
              </span>
            </div>
            <button
              className="p-1 rounded-md md:hidden"
              onClick={toggleMobileMenu}
            >
              <svg
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            <Link
              href="/"
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                isActive("/")
                  ? "sidebar-active"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <svg
                className="w-5 h-5 mr-3 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                ></path>
              </svg>
              {t("nav.dashboard")} {/* Added translation */}
            </Link>

            <Link
              href="/inventory"
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                isActive("/inventory")
                  ? "sidebar-active"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <svg
                className="w-5 h-5 mr-3 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                ></path>
              </svg>
              {t("nav.inventory")} {/* Added translation */}
            </Link>

            <Link
              href="/qrcodes"
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                isActive("/qrcodes")
                  ? "sidebar-active"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <svg
                className="w-5 h-5 mr-3 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                ></path>
              </svg>
              {t("nav.qrcodes")} {/* Added translation */}
            </Link>

            <Link
              href="/loans"
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                isActive("/loans")
                  ? "sidebar-active"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <svg
                className="w-5 h-5 mr-3 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
              {t("nav.loans")} {/* Added translation */}
            </Link>

            <Link
              href="/reports"
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                isActive("/reports")
                  ? "sidebar-active"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <svg
                className="w-5 h-5 mr-3 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                ></path>
              </svg>
              {t("nav.reports")} {/* Added translation */}
            </Link>

            <div className="pt-4 mt-4 border-t border-gray-200">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t("nav.settingsTitle")}
              </h3>{" "}
              {/* Added translation */}
              <Link
                href="/settings"
                className={cn(
                  "flex items-center px-2 py-2 mt-1 text-sm font-medium rounded-md",
                  isActive("/settings")
                    ? "sidebar-active"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <svg
                  className="w-5 h-5 mr-3 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  ></path>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                </svg>
                {t("nav.settings")} {/* Added translation */}
              </Link>
              <Link
                href="/profile"
                className={cn(
                  "flex items-center px-2 py-2 mt-1 text-sm font-medium rounded-md",
                  isActive("/profile")
                    ? "sidebar-active"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <svg
                  className="w-5 h-5 mr-3 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {t("nav.profile")} {/* Added translation */}
              </Link>
              <Link
                href="/admin"
                className={cn(
                  "flex items-center px-2 py-2 mt-1 text-sm font-medium rounded-md",
                  isActive("/admin")
                    ? "sidebar-active"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <svg
                  className="w-5 h-5 mr-3 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                  />
                </svg>
                {t("nav.admin")} {/* Added translation */}
              </Link>
            </div>
          </nav>
        </div>

        {/* Language switcher */}
        <div className="mt-auto p-2 border-t border-gray-200">
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setLanguage("it")}
              className={`w-6 h-4 transition-opacity ${
                getCurrentLanguage() === "it"
                  ? "opacity-100"
                  : "opacity-50 hover:opacity-75"
              }`}
              title="Italiano"
            >
              <img
                src="https://flagcdn.com/w40/it.png"
                alt="Italiano"
                className="w-full h-full object-cover rounded"
              />
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={`w-6 h-4 transition-opacity ${
                getCurrentLanguage() === "en"
                  ? "opacity-100"
                  : "opacity-50 hover:opacity-75"
              }`}
              title="English"
            >
              <img
                src="https://flagcdn.com/w40/gb.png"
                alt="English"
                className="w-full h-full object-cover rounded"
              />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
