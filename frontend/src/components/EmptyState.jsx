export default function EmptyState({ icon, title, text, children }) {
  return (
    <div className="empty">
      <div className="empty__icon" aria-hidden="true">
        {icon}
      </div>
      {title && <h2 className="empty__title">{title}</h2>}
      {text && <p className="empty__text">{text}</p>}
      {children}
    </div>
  )
}
