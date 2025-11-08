import { useState } from "react";
import {
  UserCircleIcon,
  BanknotesIcon,
  UsersIcon,
  ChartBarIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";

function NavSidebar() {
  const [showsub_p, setShowsub_p] = useState(false);
  const [showarrow_p, setShowarrow_p] = useState(false);
  const [showsub_g, setShowsub_g] = useState(false);
  const [showarrow_g, setShowarrow_g] = useState(false);
  const [showsub_b, setShowsub_b] = useState(false);
  const [showarrow_b, setShowarrow_b] = useState(false);

  return (
    <div className="h-screen w-64 bg-white dark:bg-gray-900 shadow-lg flex flex-col justify-between">
      <div>
        <Link
          to="/home"
          className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3"
        >
          <ChartBarIcon className="h-7 w-7 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            Dashboard
          </h2>
        </Link>
        <nav className="flex flex-col gap-2 p-4 text-gray-800 dark:text-white">
          {/* Personal Expenses */}
          <div
            className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition flex items-center justify-between"
            onMouseOver={() => setShowarrow_p(true)}
            onMouseOut={() => setShowarrow_p(false)}
            onClick={() => setShowsub_p((p) => !p)}
          >
            <div className="flex items-center gap-3">
              <BanknotesIcon className="h-5 w-5 text-blue-600" />
              <span className="font-semibold">Personal Expenses</span>
            </div>
            <ChevronDownIcon
              className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                showsub_p ? "rotate-180" : ""
              } ${showarrow_p ? "opacity-100" : "opacity-40"}`}
            />
          </div>
          {showsub_p && (
            <div className="ml-8 flex flex-col gap-1 animate-fadeIn">
              <Link
                to="/addexpense"
                className="py-1 px-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer text-sm transition"
              >
                Add Expense
              </Link>
              <Link
                to="/viewexpense"
                className="py-1 px-2 rounded hover:bg-blue-50 dark:hover:bg-blue-900 cursor-pointer text-sm transition"
              >
                View/Edit Expense
              </Link>
            </div>
          )}

          {/* Group Expenses */}
          <div
            className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition flex items-center justify-between"
            onMouseOver={() => setShowarrow_g(true)}
            onMouseOut={() => setShowarrow_g(false)}
            onClick={() => setShowsub_g((g) => !g)}
          >
            <div className="flex items-center gap-3">
              <UsersIcon className="h-5 w-5 text-green-600" />
              <span className="font-semibold">Group Expenses</span>
            </div>
            <ChevronDownIcon
              className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                showsub_g ? "rotate-180" : ""
              } ${showarrow_g ? "opacity-100" : "opacity-40"}`}
            />
          </div>
          {showsub_g && (
            <div className="ml-8 flex flex-col gap-1 animate-fadeIn">
              <Link
                to="/creategroup"
                className="py-1 px-2 rounded hover:bg-green-50 dark:hover:bg-green-900 cursor-pointer text-sm transition"
              >
                Create/Join Group
              </Link>
              <Link
                to="/mygroups"
                className="py-1 px-2 rounded hover:bg-green-50 dark:hover:bg-green-900 cursor-pointer text-sm transition"
              >
                My Groups
              </Link>
            </div>
          )}

          {/* Budget */}
          <div
            className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition flex items-center justify-between"
            onMouseOver={() => setShowarrow_b(true)}
            onMouseOut={() => setShowarrow_b(false)}
            onClick={() => setShowsub_b((b) => !b)}
          >
            <div className="flex items-center gap-3">
              <ChartBarIcon className="h-5 w-5 text-purple-600" />
              <span className="font-semibold">Budget</span>
            </div>
            <ChevronDownIcon
              className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                showsub_b ? "rotate-180" : ""
              } ${showarrow_b ? "opacity-100" : "opacity-40"}`}
            />
          </div>
          {showsub_b && (
            <div className="ml-8 flex flex-col gap-1 animate-fadeIn">
              <Link
                to="/budget/personal"
                className="py-1 px-2 rounded hover:bg-purple-50 dark:hover:bg-purple-900 cursor-pointer text-sm transition"
              >
                Personal Budget
              </Link>
              <Link
                to="/budget/group"
                className="py-1 px-2 rounded hover:bg-purple-50 dark:hover:bg-purple-900 cursor-pointer text-sm transition"
              >
                Group Budget
              </Link>
            </div>
          )}

          {/* Feedback */}
          <Link
            to="/feedback"
            className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition flex gap-3 items-center"
          >
            <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 text-yellow-600" />
            <span className="font-semibold">Feedback</span>
          </Link>

          {/* Profile */}
          <Link
            to="/profile"
            className="px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition flex gap-3 items-center"
          >
            <UserCircleIcon className="h-5 w-5 text-gray-600" />
            <span className="font-semibold">Profile</span>
          </Link>
        </nav>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Link
          to="/login"
          className="px-3 py-2 rounded hover:bg-red-50 dark:hover:bg-red-900 cursor-pointer transition flex gap-3 items-center text-red-600 dark:text-red-400"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-semibold">Logout</span>
        </Link>
      </div>
    </div>
  );
}

export default NavSidebar;
