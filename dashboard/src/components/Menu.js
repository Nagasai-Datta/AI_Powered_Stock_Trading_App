import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProfileCard from "./ProfileCard";
import { getMe, logout } from "../api";

const Menu = () => {
  const [selectedMenu, setSelectedMenu] = useState(0);
  const [isProfileDropDownOpen, setIsProfileDropDownOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    let alive = true;
    getMe().then((d) => { if (alive) setUser(d.user); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const handleProfileClick = () => setIsProfileDropDownOpen((v) => !v);
  const handleMenuClick = (index) => setSelectedMenu(index);

  const handleSignOut = async () => {
    try { await logout(); } catch { /* ignore */ }
    window.location.href = process.env.REACT_APP_FRONTEND_URL || "http://localhost:3001";
  };

  const username = user?.username || "Guest";
  const initials = username.slice(0, 2).toUpperCase();
  const menuClass = "menu";
  const activeMenuClass = "menu selected";
  const items = [
    { to: "/", label: "Dashboard", i: 0 },
    { to: "/orders", label: "Orders", i: 1 },
    { to: "/holdings", label: "Holdings", i: 2 },
    { to: "/positions", label: "Positions", i: 3 },
    { to: "/funds", label: "Funds", i: 4 },
    { to: "/apps", label: "Apps", i: 6 },
  ];

  return (
    <div className="menu-container">
      <div className="menus">
        <ul>
          {items.map((it) => (
            <li key={it.i}>
              <Link style={{ textDecoration: "none" }} to={it.to} onClick={() => handleMenuClick(it.i)}>
                <p className={selectedMenu === it.i ? activeMenuClass : menuClass}>{it.label}</p>
              </Link>
            </li>
          ))}
        </ul>
        <hr />
        <div className="profile" onClick={handleProfileClick} style={{ position: "relative" }}>
          <div className="avatar">{initials}</div>
          <p className="username">{username}</p>
          {isProfileDropDownOpen && (
            <div style={{ position: "absolute", top: "100%", left: 0, zIndex: 10 }}>
              <ProfileCard username={username} avatar={initials} onSignOut={handleSignOut} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;
