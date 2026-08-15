import { useEffect, useState } from "react";
import searchIcon from "../assets/icons/search.svg";
import "./Sidebar.scss";

const navItems = [
  { label: "Guide" },
  {
    label: "Attendees",
    active: true,
    children: [
      "Attendees",
      "Attendee types",
      "Packages",
      "Reg codes",
      "Discounts",
    ],
  },
  { label: "Content" },
  { label: "Exhibitors" },
];

function Sidebar() {
  const [expanded, setExpanded] = useState(false);

  // Keep in sync with $bp-lg in styles/_breakpoints.scss. Resets the
  // manually-toggled-open state whenever the viewport crosses back up
  // into desktop, so a later resize back down starts collapsed again
  // instead of remembering a stale open state.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const handleChange = (event) => {
      if (event.matches) setExpanded(false);
    };
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return (
    <div className="sidebar__container">
      <nav className={`sidebar ${expanded ? "is-expanded" : ""}`}>
        <div className="sidebar__header">
          <button
            type="button"
            className="sidebar__toggle"
            aria-label={expanded ? "Close navigation" : "Open navigation"}
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? (
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
          <h1 className="sidebar__title">RainFocus Summit</h1>
        </div>

        <div className="sidebar__content">
          <p className="sidebar__details">
            Lehi, UT <span className="sidebar__dot">&bull;</span> December 15th
          </p>

          <label className="sidebar__search">
            <img src={searchIcon} alt="" className="sidebar__search-icon" />
            <input type="text" placeholder="Search" />
          </label>

          <ul className="sidebar__nav">
            {navItems.map((item) => (
              <li key={item.label}>
                <div
                  className={`sidebar__nav-item ${item.active ? "is-active" : ""}`}
                >
                  <span className="sidebar__nav-dot" />
                  {item.label}
                </div>
                {item.children && (
                  <ul className="sidebar__subnav">
                    {item.children.map((child) => (
                      <li key={child}>{child}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
      {expanded && (
        <div className="sidebar__backdrop" onClick={() => setExpanded(false)} />
      )}
    </div>
  );
}

export default Sidebar;
