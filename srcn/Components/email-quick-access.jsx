const PROVIDERS = [
  { match: ["gmail.com"], name: "Gmail", url: "https://mail.google.com" },
  { match: ["outlook.com", "hotmail.com", "live.com"], name: "Outlook", url: "https://outlook.live.com/mail" },
  { match: ["yahoo.com"], name: "Yahoo Mail", url: "https://mail.yahoo.com" },
  { match: ["icloud.com", "me.com"], name: "iCloud Mail", url: "https://www.icloud.com/mail" },
];

export default function EmailQuickAccess({ email }) {
  const domain = email.split("@")[1]?.toLowerCase().trim();
  const matched = domain ? PROVIDERS.find((p) => p.match.includes(domain)) : null;
  const toShow = matched ? [matched] : PROVIDERS;

  return (
    <div className="ss-email-quick-access">
      <span className="ss-email-quick-access__label">
        {matched ? "Check your inbox:" : "Quick access to your inbox:"}
      </span>
      <div className="ss-email-quick-access__links">
        {toShow.map((p) => (
          <a key={p.name} href={p.url} target="_blank" rel="noreferrer">
            {p.name}
          </a>
        ))}
      </div>
    </div>
  );
}
