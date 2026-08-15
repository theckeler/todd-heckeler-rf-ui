import searchIcon from '../assets/icons/search.svg'
import './Sidebar.scss'

const navItems = [
  { label: 'Guide' },
  {
    label: 'Attendees',
    active: true,
    children: ['Attendees', 'Attendee types', 'Packages', 'Reg codes', 'Discounts'],
  },
  { label: 'Content' },
  { label: 'Exhibitors' },
]

function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar__header">
        <h1 className="sidebar__title">RainFocus Summit</h1>
      </div>

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
            <div className={`sidebar__nav-item ${item.active ? 'is-active' : ''}`}>
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
    </nav>
  )
}

export default Sidebar
