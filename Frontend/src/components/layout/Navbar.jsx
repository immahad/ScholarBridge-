import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FiMenu, FiX, FiLogOut, FiUser, FiHome, FiSearch, FiInfo, FiDollarSign } from 'react-icons/fi';
import { useAuth } from '../../context/AuthUtils';
import '../../styles/navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setIsOpen(false);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/logo.png" alt="Scholarship Management System" className="logo-img" />
          <span className="logo-text">ScholarSync</span>
        </Link>

        <div className="mobile-toggle" onClick={toggleMenu}>
          {isOpen ? <FiX /> : <FiMenu />}
        </div>

        <ul className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <li className="navbar-item">
            <Link to="/" className="navbar-link" onClick={closeMenu}>
              <FiHome className="navbar-icon" /> Home
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/scholarships" className="navbar-link" onClick={closeMenu}>
              <FiSearch className="navbar-icon" /> Find Scholarships
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/about" className="navbar-link" onClick={closeMenu}>
              <FiInfo className="navbar-icon" /> About Us
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/support" className="navbar-link" onClick={closeMenu}>
              <FiDollarSign className="navbar-icon" /> Support
            </Link>
          </li>

          {isAuthenticated ? (
            <>
              <li className="navbar-item profile-dropdown">
                <button className="navbar-profile-btn">
                  <div className="avatar">
                    {user?.firstName?.charAt(0) || 'U'}
                  </div>
                  <span>{user?.firstName} {user?.lastName}</span>
                </button>
                <ul className="profile-dropdown-menu">
                  <li>
                    <Link to={`/${user?.role}/dashboard`} onClick={closeMenu}>
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to={`/${user?.role}/profile`} onClick={closeMenu}>
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <button onClick={handleLogout} className="logout-btn">
                      <FiLogOut className="navbar-icon" /> Logout
                    </button>
                  </li>
                </ul>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item auth-button">
                <Link to="/login" className="btn-outline" onClick={closeMenu}>
                  Log In
                </Link>
              </li>
              <li className="navbar-item auth-button">
                <Link to="/register" className="btn-primary" onClick={closeMenu}>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar; 