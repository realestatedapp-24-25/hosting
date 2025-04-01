import React, { useContext } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Toaster } from "react-hot-toast";
import {
  FiPackage,
  FiGift,
  FiUser,
  FiLogOut,
  FiSettings,
  FiClipboard,
  FiHeart,
  FiMapPin,
  FiTrendingUp,
  FiClock,
} from "react-icons/fi";

const DashLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white shadow-md overflow-y-auto">
        <div className="p-4">
          <h2 className="text-xl font-semibold">Dashboard</h2>
        </div>
        <nav className="mt-4 pb-6 md:pb-0">
          <div className="px-4 space-y-2">
            {/* Common Links */}
            <NavLink
              to="/profile"
              end
              className={({ isActive }) =>
                `flex items-center space-x-3 p-2 md:p-3 rounded-lg transition-colors text-sm md:text-base ${
                  isActive
                    ? "bg-green-500/20 border border-green-500/30"
                    : "hover:bg-green-500/20"
                }`
              }
            >
              <FiUser className="w-5 h-5" />
              <span>Profile</span>
            </NavLink>

            {/* Impact Dashboard - Available for all users */}
            <NavLink
              to="/profile/impact"
              className={({ isActive }) =>
                `flex items-center space-x-3 p-2 md:p-3 rounded-lg transition-colors text-sm md:text-base ${
                  isActive
                    ? "bg-green-500/20 border border-green-500/30"
                    : "hover:bg-green-500/20"
                }`
              }
            >
              <FiTrendingUp className="w-5 h-5" />
              <span>Impact Dashboard</span>
            </NavLink>

            {/* Institute Links */}
            {user?.role === "institute" && (
              <>
                <NavLink
                  to="/profile/requests"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-2 md:p-3 rounded-lg transition-colors text-sm md:text-base ${
                      isActive
                        ? "bg-green-500/20 border border-green-500/30"
                        : "hover:bg-green-500/20"
                    }`
                  }
                >
                  <FiClipboard className="w-5 h-5" />
                  <span>My Requests</span>
                </NavLink>
                <NavLink
                  to="/profile/send-request"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-2 md:p-3 rounded-lg transition-colors text-sm md:text-base ${
                      isActive
                        ? "bg-green-500/20 border border-green-500/30"
                        : "hover:bg-green-500/20"
                    }`
                  }
                >
                  <FiPackage className="w-5 h-5" />
                  <span>Send Request</span>
                </NavLink>
              </>
            )}

            {/* Donor Links */}
            {user?.role === "donor" && (
              <>
                <NavLink
                  to="/profile/my-donations"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-2 md:p-3 rounded-lg transition-colors text-sm md:text-base ${
                      isActive
                        ? "bg-green-500/20 border border-green-500/30"
                        : "hover:bg-green-500/20"
                    }`
                  }
                >
                  <FiHeart className="w-5 h-5" />
                  <span>My Donations</span>
                </NavLink>
                <NavLink
                  to="/profile/donation-history"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-2 md:p-3 rounded-lg transition-colors text-sm md:text-base ${
                      isActive
                        ? "bg-green-500/20 border border-green-500/30"
                        : "hover:bg-green-500/20"
                    }`
                  }
                >
                  <FiClock className="w-5 h-5" />
                  <span>Donation History</span>
                </NavLink>
              </>
            )}

            {/* Settings Link */}
            {/* <NavLink
              to="/profile/settings"
              className={({ isActive }) =>
                `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-green-500/20 border border-green-500/30"
                    : "hover:bg-green-500/20"
                }`
              }
            >
              <FiSettings className="w-5 h-5" />
              <span>Settings</span>
            </NavLink> */}

            {/* Logout Button */}
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 p-2 md:p-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors text-sm md:text-base"
            >
              <FiLogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <Outlet />
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default DashLayout;