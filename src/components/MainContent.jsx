import addCircle from "../assets/icons/add-circle.svg";
import computerIcon from "../assets/icons/computer.svg";
import logicArrow from "../assets/icons/logic-arrow.svg";
import personPortal1 from "../assets/icons/person-portal-1.svg";
import personPortal2 from "../assets/icons/person-portal-2.svg";
import personPortal3 from "../assets/icons/person-portal-3.svg";
import headerLogo from "../assets/images/header-logo.png";
import { Card } from "./Card";
import "./MainContent.scss";

const baseSettings = [
  {
    title: "General",
    description: "Define Attendee types & attributes",
  },
  {
    title: "Title",
    description:
      "Description that explains the value goes here. Description that explains the value goes here.",
  },
  {
    // Figma actually has this one title in Open Sans Bold while every other
    // card title is Inter Bold — normalized to Inter here rather than
    // reproducing it; see PROCESS.md, flagged as a question for the design
    // team rather than shipped as-is.
    title: "Title",
    description:
      "Description that explains the value goes here. Description that explains the value goes here.",
  },
];

const workflows = [
  {
    title: "Attendee Registration",
    description: "Start by creating a general registration workflow",
  },
  {
    title: "Attendee Registration",
    description: "Start by creating a general registration workflow",
  },
  {
    title: "Attendee Registration",
    description: "Start by creating a general registration workflow",
  },
];

function PersonPortalIcon() {
  return (
    <div className="person-portal">
      <img
        src={personPortal1}
        alt=""
        className="person-portal__layer person-portal__layer--1"
      />
      <img
        src={personPortal2}
        alt=""
        className="person-portal__layer person-portal__layer--2"
      />
      <img
        src={personPortal3}
        alt=""
        className="person-portal__layer person-portal__layer--3"
      />
    </div>
  );
}

function MainContent() {
  return (
    <main className="main-content">
      <header className="event-header">
        <div className="event-header__logo">
          <img src={headerLogo} alt="RainFocus Summit" />
        </div>
        <div className="event-header__info">
          <h1>RainFocus Summit</h1>
          <div className="event-header__details">
            <p>December 15th</p>
            <p>Lehi, Utah</p>
          </div>
        </div>
        <button type="button" className="event-header__edit">
          Edit event
        </button>
      </header>

      <section className="guide-intro">
        <h2>Event setup guide</h2>
        <p>
          See the available list of modules below. We suggest that you start
          with the attendee module.
        </p>
      </section>

      <hr className="divider" />

      <section className="module">
        <div className="module__heading">
          <PersonPortalIcon />
          <h2>Attendee</h2>
        </div>

        <div className="step">
          <p className="step__label">
            <strong>Step 1:</strong> Base settings.
          </p>
          <div className="attribute-box">
            {baseSettings.map((item, i) => (
              <div className="attribute-box__col" key={i}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="step">
          <p className="step__label">
            <strong>Step 2:</strong> Build registration workflows.
          </p>
          <div className="card-row">
            {workflows.map((item, i) => (
              <Card
                key={i}
                icon={logicArrow}
                title={item.title}
                description={item.description}
                iconSize="small"
              />
            ))}
            <Card
              icon={addCircle}
              description="Add Registration Workflow"
              centered
              asButton
            />
            {/* <BlankCard />
              <BlankCard /> */}
          </div>
        </div>

        <div className="step">
          <p className="step__label">
            <strong>Step 3:</strong> Design post-registration experiences.
          </p>
          <div className="card-row">
            <Card
              icon={computerIcon}
              title="Attendee Portal"
              description="Manage the portal that attendees will see after they've register for your event."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default MainContent;
