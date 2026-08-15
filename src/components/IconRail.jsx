import rfLogo from "../assets/icons/rf-logo.svg";
import navOrgIcon from "../assets/images/nav-org-icon.png";
import "./IconRail.scss";

function IconRail() {
  return (
    <aside className="icon-rail">
      <div className="icon-rail__logo">
        <img src={rfLogo} alt="RainFocus" />
      </div>
      <div className="icon-rail__event">
        <img src={navOrgIcon} alt="RainFocus Summit" />
      </div>
      <div className="icon-rail__avatar">
        <button className="icon-rail__avatar_button">FL</button>
      </div>
    </aside>
  );
}

export default IconRail;
