import { useNavigate } from "react-router-dom";
import {
  FaGavel,
  FaHandsHelping,
  FaSearch,
  FaUserFriends,
  FaMapMarkerAlt,
  FaBook,
  FaUserPlus,
  FaBox,
} from "react-icons/fa";
import { useI18n } from "../i18n/useI18n.jsx";

const CARD_DEFS = [
  {
    key: "report-crime",
    i18nLabel: "cards.reportCrime.label",
    i18nDesc: "cards.reportCrime.description",
    route: "/report-crime",
    icon: FaGavel,
    color: "#ef4444",
  },
  {
    key: "get-help",
    i18nLabel: "cards.getHelp.label",
    i18nDesc: "cards.getHelp.description",
    route: "/get-help",
    icon: FaHandsHelping,
    color: "#22c55e",
  },
  {
    key: "lost-and-found",
    i18nLabel: "cards.lostAndFound.label",
    i18nDesc: "cards.lostAndFound.description",
    route: "/lost-and-found",
    icon: FaSearch,
    color: "#f59e0b",
  },
  {
    key: "missing-persons",
    i18nLabel: "cards.missingPersons.label",
    i18nDesc: "cards.missingPersons.description",
    route: "/missing-persons",
    icon: FaUserFriends,
    color: "#3b82f6",
  },
  {
    key: "search-stations",
    i18nLabel: "cards.searchStations.label",
    i18nDesc: "cards.searchStations.description",
    route: "/search-stations",
    icon: FaMapMarkerAlt,
    color: "#8b5cf6",
  },
  {
    key: "laws",
    i18nLabel: "cards.laws.label",
    i18nDesc: "cards.laws.description",
    route: "/laws-and-rights",
    icon: FaBook,
    color: "#06b6d4",
  },
  {
    key: "report-missing-person",
    i18nLabel: "cards.reportMissingPerson.label",
    i18nDesc: "cards.reportMissingPerson.description",
    route: "/report-missing-person",
    icon: FaUserPlus,
    color: "#ec4899",
  },
  {
    key: "report-missing-property",
    i18nLabel: "cards.reportMissingProperty.label",
    i18nDesc: "cards.reportMissingProperty.description",
    route: "/report-missing-property",
    icon: FaBox,
    color: "#f97316",
  },
];

export function MainCardGrid({ search = "" }) {
  const navigate = useNavigate();
  const { t } = useI18n();

  const q = search.trim().toLowerCase();
  const filtered = q
    ? CARD_DEFS.filter((c) => {
        const label = t(c.i18nLabel).toLowerCase();
        const desc = t(c.i18nDesc).toLowerCase();
        return label.includes(q) || desc.includes(q);
      })
    : CARD_DEFS;

  if (filtered.length === 0) {
    return (
      <p
        style={{
          textAlign: "center",
          color: "#6b7280",
          fontSize: "0.9rem",
          marginTop: "1.5rem",
        }}
      >
        {t("dashboard.noResults", { q: search }) ||
          `No features match "${search}".`}
      </p>
    );
  }

  return (
    <section className="rc-card-grid">
      {filtered.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.key}
            type="button"
            className="rc-card rc-card-with-icon"
            onClick={() => navigate(card.route)}
            style={{ "--card-color": card.color }}
          >
            <div className="rc-card-icon-wrapper">
              <Icon className="rc-card-icon" />
            </div>
            <div className="rc-card-title">{t(card.i18nLabel)}</div>
            <p className="rc-card-description">{t(card.i18nDesc)}</p>
          </button>
        );
      })}
    </section>
  );
}
