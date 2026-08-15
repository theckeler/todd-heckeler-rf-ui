import "./Card.scss";

export function Card({
  icon,
  iconSize = "default",
  iconAlt = "",
  title,
  description,
  centered = false,
}) {
  return (
    <div className={`card ${centered ? "card--centered" : ""}`}>
      <div className="card__heading">
        <img
          src={icon}
          alt={iconAlt}
          className={`card__icon${iconSize === "small" ? " card__icon--small" : ""}`}
        />
        {title && <h3 className="card__title">{title}</h3>}
      </div>
      {description && <p className="card__description">{description}</p>}
    </div>
  );
}

export function BlankCard() {
  return <div className="card card--blank" aria-hidden="true" />;
}
