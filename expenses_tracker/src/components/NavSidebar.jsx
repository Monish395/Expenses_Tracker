import { useState, useRef, useEffect } from "react";
import {
  UserCircleIcon,
  BanknotesIcon,
  UsersIcon,
  ChartBarIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ChevronDownIcon,
  Bars3Icon,
} from "@heroicons/react/24/solid";
import { LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

// Each top-level nav section. "match" is used to auto-expand the section
// containing the current route, so refreshing on /addexpense doesn't hide
// the link the user is actually on.
const SECTIONS = [
  {
    key: "p",
    label: "Personal Expenses",
    icon: BanknotesIcon,
    iconColor: "text-blue-600",
    hoverColor: "hover:bg-blue-50 dark:hover:bg-blue-900",
    match: ["/addexpense", "/viewexpense"],
    links: [
      { to: "/addexpense", label: "Add Expense" },
      { to: "/viewexpense", label: "View/Edit Expense" },
    ],
  },
  {
    key: "g",
    label: "Group Expenses",
    icon: UsersIcon,
    iconColor: "text-green-600",
    hoverColor: "hover:bg-green-50 dark:hover:bg-green-900",
    match: ["/creategroup", "/mygroups"],
    links: [
      { to: "/creategroup", label: "Create/Join Group" },
      { to: "/mygroups", label: "My Groups" },
    ],
  },
  {
    key: "b",
    label: "Budget",
    icon: ChartBarIcon,
    iconColor: "text-purple-600",
    hoverColor: "hover:bg-purple-50 dark:hover:bg-purple-900",
    match: ["/budget/personal", "/budget/group"],
    links: [
      { to: "/budget/personal", label: "Personal Budget" },
      { to: "/budget/group", label: "Group Budget" },
    ],
  },
];

function NavSidebar() {
  const location = useLocation();
  const railRef = useRef(null);

  // expanded = full width with labels. Collapsed = icon-only rail.
  // Defaults open on large screens, closed on small ones.
  const [expanded, setExpanded] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true,
  );
  const [openSection, setOpenSection] = useState(
    SECTIONS.find((s) => s.match.includes(location.pathname))?.key ?? null,
  );

  // Collapse automatically on outside tap when in the mobile-style
  // (overlay) mode, i.e. below lg. On lg+ the rail pushes content instead
  // of overlaying it, so we don't auto-collapse there.
  useEffect(() => {
    function handleClickOutside(e) {
      if (window.innerWidth >= 1024) return;
      if (railRef.current && !railRef.current.contains(e.target)) {
        setExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Close the rail after navigating, on small screens only.
  const handleNavigate = () => {
    if (window.innerWidth < 1024) setExpanded(false);
  };

  const toggleSection = (key) => {
    setOpenSection((cur) => (cur === key ? null : key));
    if (!expanded) setExpanded(true);
  };

  return (
    <>
      {/* Backdrop overlay, mobile/tablet only, while expanded */}
      {expanded && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setExpanded(false)}
          aria-hidden="true"
        />
      )}

      <div
        ref={railRef}
        className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-900 shadow-lg flex flex-col justify-between z-40 transition-all duration-200 overflow-hidden ${
          expanded ? "w-64" : "w-16"
        }`}
      >
        <div className="min-w-[16rem]">
          {/* Header / brand + toggle */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
            <Link
              to="/home"
              onClick={handleNavigate}
              className="flex items-center gap-3 min-w-0"
            >
              <ChartBarIcon className="h-7 w-7 text-blue-500 shrink-0" />
              {expanded && (
                <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight truncate">
                  Dashboard
                </h2>
              )}
            </Link>
            <button
              onClick={() => setExpanded((e) => !e)}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0"
              aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
            >
              <Bars3Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          <nav className="flex flex-col gap-2 p-4 text-gray-800 dark:text-white">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isOpen = openSection === section.key;
              return (
                <div key={section.key}>
                  <button
                    onClick={() => toggleSection(section.key)}
                    className="w-full px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`h-5 w-5 shrink-0 ${section.iconColor}`} />
                      {expanded && (
                        <span className="font-semibold truncate">
                          {section.label}
                        </span>
                      )}
                    </div>
                    {expanded && (
                      <ChevronDownIcon
                        className={`h-4 w-4 ml-1 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                  {expanded && isOpen && (
                    <div className="ml-8 flex flex-col gap-1 animate-fadeIn">
                      {section.links.map((link) => (
                        <Link
                          key={link.to}
                          to={link.to}
                          onClick={handleNavigate}
                          className={`py-1 px-2 rounded ${section.hoverColor} cursor-pointer text-sm transition`}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Feedback */}
            <Link
              to="/feedback"
              onClick={handleNavigate}
              className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition flex gap-3 items-center"
            >
              <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 text-yellow-600 shrink-0" />
              {expanded && <span className="font-semibold truncate">Feedback</span>}
            </Link>

            {/* Profile */}
            <Link
              to="/profile"
              onClick={handleNavigate}
              className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition flex gap-3 items-center"
            >
              <UserCircleIcon className="h-5 w-5 text-gray-600 shrink-0" />
              {expanded && <span className="font-semibold truncate">Profile</span>}
            </Link>
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 min-w-[16rem]">
          <Link
            to="/login"
            onClick={handleNavigate}
            className="px-3 py-2 rounded hover:bg-red-50 dark:hover:bg-red-900 cursor-pointer transition flex gap-3 items-center text-red-600 dark:text-red-400"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {expanded && <span className="font-semibold truncate">Logout</span>}
          </Link>
        </div>
      </div>
    </>
  );
}

export default NavSidebar;
