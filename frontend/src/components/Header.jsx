import React from "react";
import "./GlobalHeader.css";

export default function GlobalHeader({ title, icon: Icon }) {
  return (
    <div className="global-header">
      <div className="global-header-content">
        {Icon && <Icon size={28} className="header-icon" />}
        <h1 className="header-title">{title}</h1>
      </div>
      
    </div>
  );
}
