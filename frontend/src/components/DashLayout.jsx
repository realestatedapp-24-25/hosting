// // import React, { useContext } from "react";
// // import { NavLink, Outlet } from "react-router-dom";
// // import { AuthContext } from "../context/AuthContext";
// // import { Toaster } from "react-hot-toast";
// // import { 
// //   FiPackage, 
// //   FiGift, 
// //   FiUser, 
// //   FiLogOut, 
// //   FiSettings, 
// //   FiClipboard,
// //   FiHeart 
// // } from "react-icons/fi";

// // const DashLayout = ({ children }) => {
// //   const { user, logout } = useContext(AuthContext);

// //   return (
// //     <div className="flex min-h-screen bg-gray-100">
// //       {/* Sidebar */}
// //       <div className="w-64 bg-white shadow-md">
// //         <div className="p-4">
// //           <h2 className="text-xl font-semibold">Dashboard</h2>
// //         </div>
// //         <nav className="mt-4">
// //           <div className="px-4 space-y-2">
// //             {/* Common Links */}
// //             <NavLink
// //               to="/profile"
// //               end
// //               className={({ isActive }) =>
// //                 `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
// //                   isActive
// //                     ? "bg-green-500/20 border border-green-500/30"
// //                     : "hover:bg-green-500/20"
// //                 }`
// //               }
// //             >
// //               <FiUser className="w-5 h-5" />
// //               <span>Profile</span>
// //             </NavLink>

// //             {/* Institute Links */}
// //             {user?.role === "institute" && (
// //               <>
// //                 <NavLink
// //                   to="/profile/requests"
// //                   className={({ isActive }) =>
// //                     `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
// //                       isActive
// //                         ? "bg-green-500/20 border border-green-500/30"
// //                         : "hover:bg-green-500/20"
// //                     }`
// //                   }
// //                 >
// //                   <FiClipboard className="w-5 h-5" />
// //                   <span>My Requests</span>
// //                 </NavLink>
// //                 <NavLink
// //                   to="/profile/send-request"
// //                   className={({ isActive }) =>
// //                     `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
// //                       isActive
// //                         ? "bg-green-500/20 border border-green-500/30"
// //                         : "hover:bg-green-500/20"
// //                     }`
// //                   }
// //                 >
// //                   <FiPackage className="w-5 h-5" />
// //                   <span>Send Request</span>
// //                 </NavLink>
// //                 <NavLink
// //                   to="/institute-reviews"
// //                   className="block p-2 text-gray-700 hover:bg-gray-200 rounded"
// //                 >
// //                   Submit Reviews
// //                 </NavLink>
// //               </>
// //             )}

// //             {/* Shop Links */}
// //             {/* {user?.role === "shopkeeper" && (
// //               <NavLink
// //                 to="/profile/donations"
// //                 className={({ isActive }) =>
// //                   `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
// //                     isActive
// //                       ? "bg-green-500/20 border border-green-500/30"
// //                       : "hover:bg-green-500/20"
// //                   }`
// //                 }
// //               >
// //                 <FiGift className="w-5 h-5" />
// //                 <span>My Donations</span>
// //               </NavLink>
// //             )} */}

// //             {/* Donor Links */}
// //             {user?.role === "donor" && (
// //               <NavLink
// //                 to="/profile/my-donations"
// //                 className={({ isActive }) =>
// //                   `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
// //                     isActive
// //                       ? "bg-green-500/20 border border-green-500/30"
// //                       : "hover:bg-green-500/20"
// //                   }`
// //                 }
// //               >
// //                 <FiHeart className="w-5 h-5" />
// //                 <span>My Donations</span>
// //               </NavLink>
// //             )}


// //             {/* Settings Link */}
// //             <NavLink
// //               to="/profile/settings"
// //               className={({ isActive }) =>
// //                 `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
// //                   isActive
// //                     ? "bg-green-500/20 border border-green-500/30"
// //                     : "hover:bg-green-500/20"
// //                 }`
// //               }
// //             >
// //               <FiSettings className="w-5 h-5" />
// //               <span>Settings</span>
// //             </NavLink>

// //             {/* Logout Button */}
// //             <button
// //               onClick={logout}
// //               className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
// //             >
// //               <FiLogOut className="w-5 h-5" />
// //               <span>Logout</span>
// //             </button>
// //           </div>
// //         </nav>
// //       </div>

// //       {/* Main Content */}
// //       <div className="flex-1 p-8">
// //         <Outlet />
// //       </div>
// //       <Toaster position="top-right" />
// //     </div>
// //   );
// // };

// // export default DashLayout;
// import React, { useContext } from "react";
// import { NavLink, Outlet } from "react-router-dom";
// import { AuthContext } from "../context/AuthContext";
// import { Toaster } from "react-hot-toast";
// import {
//   FiPackage,
//   FiGift,
//   FiUser,
//   FiLogOut,
//   FiSettings,
//   FiClipboard,
//   FiHeart,
//   FiMapPin,
// } from "react-icons/fi";

// const DashLayout = ({ children }) => {
//   const { user, logout } = useContext(AuthContext);

//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* Sidebar */}
//       <div className="w-64 bg-white shadow-md">
//         <div className="p-4">
//           <h2 className="text-xl font-semibold">Dashboard</h2>
//         </div>
//         <nav className="mt-4">
//           <div className="px-4 space-y-2">
//             {/* Common Links */}
//             <NavLink
//               to="/profile"
//               end
//               className={({ isActive }) =>
//                 `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
//                   isActive
//                     ? "bg-green-500/20 border border-green-500/30"
//                     : "hover:bg-green-500/20"
//                 }`
//               }
//             >
//               <FiUser className="w-5 h-5" />
//               <span>Profile</span>
//             </NavLink>

//             {/* Institute Links */}
//             {user?.role === "institute" && (
//               <>
//                 <NavLink
//                   to="/profile/requests"
//                   className={({ isActive }) =>
//                     `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
//                       isActive
//                         ? "bg-green-500/20 border border-green-500/30"
//                         : "hover:bg-green-500/20"
//                     }`
//                   }
//                 >
//                   <FiClipboard className="w-5 h-5" />
//                   <span>My Requests</span>
//                 </NavLink>
//                 <NavLink
//                   to="/profile/send-request"
//                   className={({ isActive }) =>
//                     `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
//                       isActive
//                         ? "bg-green-500/20 border border-green-500/30"
//                         : "hover:bg-green-500/20"
//                     }`
//                   }
//                 >
//                   <FiPackage className="w-5 h-5" />
//                   <span>Send Request</span>
//                 </NavLink>
//                 <NavLink
//                   to="/institute-reviews"
//                   className="block p-2 text-gray-700 hover:bg-gray-200 rounded"
//                 >
//                   Submit Reviews
//                 </NavLink>
//               </>
//             )}

//             {/* Shop Links */}
//             {/* {user?.role === "shopkeeper" && (
//               <NavLink
//                 to="/profile/donations"
//                 className={({ isActive }) =>
//                   `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
//                     isActive
//                       ? "bg-green-500/20 border border-green-500/30"
//                       : "hover:bg-green-500/20"
//                   }`
//                 }
//               >
//                 <FiGift className="w-5 h-5" />
//                 <span>My Donations</span>
//               </NavLink>
//             )} */}
//             {/* Shop Links */}
//             {user?.role === "shopkeeper" && (
//               <>
//                 <NavLink
//                   to="/profile/donations"
//                   className={({ isActive }) =>
//                     `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
//                       isActive
//                         ? "bg-green-500/20 border border-green-500/30"
//                         : "hover:bg-green-500/20"
//                     }`
//                   }
//                 >
//                   <FiGift className="w-5 h-5" />
//                   <span>My Orders</span>
//                 </NavLink>
//                 {/* Shopkeeper Location Button */}
//                 <NavLink
//                   to="/profile/shopkeeper-location"
//                   className={({ isActive }) =>
//                     `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
//                       isActive
//                         ? "bg-blue-500/20 border border-blue-500/30"
//                         : "hover:bg-blue-500/20"
//                     }`
//                   }
//                 >
//                   <FiMapPin className="w-5 h-5" />
//                   <span>Get My Location</span>
//                 </NavLink>
//               </>
//             )}

//             {/* Donor Links */}
//             {user?.role === "donor" && (
//               <NavLink
//                 to="/profile/my-donations"
//                 className={({ isActive }) =>
//                   `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
//                     isActive
//                       ? "bg-green-500/20 border border-green-500/30"
//                       : "hover:bg-green-500/20"
//                   }`
//                 }
//               >
//                 <FiHeart className="w-5 h-5" />
//                 <span>My Donations</span>
//               </NavLink>
//             )}

//             {/* Settings Link */}
//             <NavLink
//               to="/profile/settings"
//               className={({ isActive }) =>
//                 `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
//                   isActive
//                     ? "bg-green-500/20 border border-green-500/30"
//                     : "hover:bg-green-500/20"
//                 }`
//               }
//             >
//               <FiSettings className="w-5 h-5" />
//               <span>Settings</span>
//             </NavLink>

//             {/* Logout Button */}
//             <button
//               onClick={logout}
//               className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
//             >
//               <FiLogOut className="w-5 h-5" />
//               <span>Logout</span>
//             </button>
//           </div>
//         </nav>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 p-8">
//         <Outlet />
//       </div>
//       <Toaster position="top-right" />
//     </div>
//   );
// };

// export default DashLayout;
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
  FiStar,
} from "react-icons/fi";

const DashLayout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-xl font-semibold">Dashboard</h2>
        </div>
        <nav className="mt-4">
          <div className="px-4 space-y-2">
            {/* Common Links */}
            <NavLink
              to="/profile"
              end
              className={({ isActive }) =>
                `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-green-500/20 border border-green-500/30"
                    : "hover:bg-green-500/20"
                }`
              }
            >
              <FiUser className="w-5 h-5" />
              <span>Profile</span>
            </NavLink>

            {/* Institute Links */}
            {user?.role === "institute" && (
              <>
                <NavLink
                  to="/profile/requests"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
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
                    `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-green-500/20 border border-green-500/30"
                        : "hover:bg-green-500/20"
                    }`
                  }
                >
                  <FiPackage className="w-5 h-5" />
                  <span>Send Request</span>
                </NavLink>
                <NavLink
                  to="/institute-reviews"
                  className="block p-2 text-gray-700 hover:bg-gray-200 rounded"
                >
                  Submit Reviews
                </NavLink>
              </>
            )}

            {/* Shop Links */}
            {/* {user?.role === "shopkeeper" && (
              <NavLink
                to="/profile/donations"
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-green-500/20 border border-green-500/30"
                      : "hover:bg-green-500/20"
                  }`
                }
              >
                <FiGift className="w-5 h-5" />
                <span>My Donations</span>
              </NavLink>
            )} */}
            {/* Shop Links */}
            {user?.role === "shopkeeper" && (
              <>
                <NavLink
                  to="/profile/donations"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-green-500/20 border border-green-500/30"
                        : "hover:bg-green-500/20"
                    }`
                  }
                >
                  <FiGift className="w-5 h-5" />
                  <span>My Orders</span>
                </NavLink>
                {/* Shopkeeper Location Button */}
                <NavLink
                  to="/profile/shopkeeper-location"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-500/20 border border-blue-500/30"
                        : "hover:bg-blue-500/20"
                    }`
                  }
                >
                  <FiMapPin className="w-5 h-5" />
                  <span>Get My Location</span>
                </NavLink>
                {/* Shopkeeper Reviews Button */}
                <NavLink
                  to="/profile/shopkeeper-reviews"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-green-500/20 border border-green-500/30"
                        : "hover:bg-green-500/20"
                    }`
                  }
                >
                  <FiStar className="w-5 h-5" />
                  <span>My Reviews</span>
                </NavLink>
              </>
            )}

            {/* Donor Links */}
            {user?.role === "donor" && (
              <NavLink
                to="/profile/my-donations"
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-green-500/20 border border-green-500/30"
                      : "hover:bg-green-500/20"
                  }`
                }
              >
                <FiHeart className="w-5 h-5" />
                <span>My Donations</span>
              </NavLink>
            )}

            {/* Settings Link */}
            <NavLink
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
            </NavLink>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            >
              <FiLogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <Outlet />
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default DashLayout;