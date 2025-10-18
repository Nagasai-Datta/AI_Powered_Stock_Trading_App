import React from "react";
import "./ProfileCard.css";

const ProfileCard = ({ username = "USERID", avatar = "ZU", onSignOut }) => {
  return (
    <div className="profile-card">
      <div className="avatar">{avatar}</div>
      <p className="username">{username}</p>
      <button className="signout-btn" onClick={onSignOut}>
        Sign Out
      </button>
    </div>
  );
};

export default ProfileCard;
