import React, { useState } from "react";
import { Link } from "react-router-dom";
import ProfileCard from "./ProfileCard";
const Menu = () => {
  const [selectedMenu, setSelectedMenu] = useState(0); //lets assume thet we r indexing through dashboard here 0->Dashboard, 1-> Orders etc.
  const [isProfileDropDownOpen, setIsProfileDropDownOpen] = useState(false); //for the profile button
  const handleProfileClick = () => {
    setIsProfileDropDownOpen(!isProfileDropDownOpen);
  };
  const handleMenuClick = (index) => {
    setSelectedMenu(index);
  };
  const handleSignOut = () => {
    localStorage.removeItem("authToken");

    // Redirect to the frontend project homepage
    window.location.href = "http://localhost:3001"; // replace with frontend URL
  };
  const menuClass = "menu";
  const activeMenuClass = "menu selected";
  return (
    <div className="menu-container">
      <div className="menus">
        <ul>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/"
              onClick={() => handleMenuClick(0)}
            >
              <p className={selectedMenu === 0 ? activeMenuClass : menuClass}>
                Dashboard
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/orders"
              onClick={() => handleMenuClick(1)}
            >
              <p className={selectedMenu === 1 ? activeMenuClass : menuClass}>
                Orders
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/holdings"
              onClick={() => handleMenuClick(2)}
            >
              <p className={selectedMenu === 2 ? activeMenuClass : menuClass}>
                Holdings
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/positions"
              onClick={() => handleMenuClick(3)}
            >
              <p className={selectedMenu === 3 ? activeMenuClass : menuClass}>
                Positions
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/funds"
              onClick={() => handleMenuClick(4)}
            >
              <p className={selectedMenu === 4 ? activeMenuClass : menuClass}>
                Funds
              </p>
            </Link>
          </li>
          <li>
            <Link
              style={{ textDecoration: "none" }}
              to="/apps"
              onClick={() => handleMenuClick(6)}
            >
              <p className={selectedMenu === 6 ? activeMenuClass : menuClass}>
                Apps
              </p>
            </Link>
          </li>
        </ul>
        <hr />
        {/* Profile section */}
        <div
          className="profile"
          onClick={handleProfileClick}
          style={{ position: "relative" }}
        >
          <div className="avatar">ZU</div>
          <p className="username">USERID</p>

          {/* Show card below avatar when toggle is true */}
          {isProfileDropDownOpen && (
            <div
              style={{ position: "absolute", top: "100%", left: 0, zIndex: 10 }}
            >
              <ProfileCard
                username="USERID"
                avatar="ZU"
                onSignOut={handleSignOut} //pass a callback here for signout routing
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;
