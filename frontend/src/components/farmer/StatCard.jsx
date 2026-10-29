function StatCard({
  icon,
  title,
  value,
  description,
  iconClass = "green-icon",
}) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${iconClass}`}>
        {icon}
      </div>

      <p>{title}</p>
      <h2>{value}</h2>
      <span>{description}</span>
    </article>
  );
}

export default StatCard;
