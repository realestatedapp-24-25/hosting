import React, { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  FiPackage,
  FiUser,
  FiLogOut,
  FiClipboard,
  FiHeart,
  FiTrendingUp,
  FiClock,
  FiMenu,
  FiX
} from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const NavItem = ({ to, icon: Icon, children }) => (
    <NavLink
      to={to}
      end={to === '/profile'}
      onClick={() => setIsMobileMenuOpen(false)}
      className={({ isActive }) =>
        `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-mycol-celadon/20 border border-mycol-celadon/30 text-mycol-brunswick_green'
            : 'hover:bg-mycol-celadon/20 text-gray-600 hover:text-mycol-brunswick_green'
        }`
      }
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{children}</span>
    </NavLink>
  );

  const menuContent = (
    <div className="px-4 space-y-2">
      <NavItem to="/profile" icon={FiUser}>Profile</NavItem>
      <NavItem to="/profile/impact" icon={FiTrendingUp}>Impact Dashboard</NavItem>

      {user?.role === 'institute' && (
        <>
          <NavItem to="/profile/requests" icon={FiClipboard}>My Requests</NavItem>
          <NavItem to="/profile/send-request" icon={FiPackage}>Send Request</NavItem>
        </>
      )}

      {user?.role === 'donor' && (
        <>
          <NavItem to="/profile/my-donations" icon={FiHeart}>My Donations</NavItem>
          <NavItem to="/profile/donation-history" icon={FiClock}>Donation History</NavItem>
        </>
      )}

      <button
        onClick={logout}
        className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
      >
        <FiLogOut className="w-5 h-5" />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="sm:hidden p-4 border-b border-gray-200">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isMobileMenuOpen ? (
            <FiX className="w-6 h-6 text-gray-600" />
          ) : (
            <FiMenu className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <nav className="py-4">
          {menuContent}
        </nav>
      </div>

      {/* Desktop Menu */}
      <div className="hidden sm:block">
        <div className="p-4">
          <h2 className="text-xl font-semibold text-mycol-brunswick_green">Dashboard</h2>
        </div>
        <nav className="mt-4">
          {menuContent}
        </nav>
      </div>
    </>
  );
};

export default Sidebar; 