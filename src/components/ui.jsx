import React from "react";

export function Metric({ icon, name, value, suffix, color, hint }) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span className={`metric-icon ${color}`}>{icon}</span>
        <button className="dots">···</button>
      </div>
      <small>{name}</small>
      <div className="metric-value">
        {value}
        <em>{suffix}</em>
      </div>
      <div className="metric-hint">{hint}</div>
    </div>
  );
}
export function EmotionRow({ name, value, positive }) {
  return (
    <div className="emotion-row">
      <span>{name}</span>
      <div className="track">
        <div
          style={{
            width: `${value}%`,
            background: positive ? "#63b99a" : "#ee929e",
          }}
        />
      </div>
      <b>{value}%</b>
    </div>
  );
}

export function Subnav({ active, onSelect, items }) {
  return (
    <nav className="pro-subnav" role="tablist">
      {items.map(([id, label]) => (
        <button
          type="button"
          key={id}
          role="tab"
          aria-selected={active === id}
          className={active === id ? "active" : ""}
          onClick={() => onSelect(id)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
