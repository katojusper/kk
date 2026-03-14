import { useState, useMemo } from "react";
import { useI18n } from "../i18n/useI18n.jsx";
import {
  FaBook,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaExternalLinkAlt,
  FaShieldAlt,
  FaBalanceScale,
  FaHandshake,
  FaGraduationCap,
  FaHeartbeat,
  FaHome,
  FaVoteYea,
  FaGavel,
  FaUsers,
  FaBriefcase,
  FaChild,
  FaFemale,
  FaPray,
  FaLock,
  FaEye,
} from "react-icons/fa";

const RIGHTS = [
  {
    id: 1,
    article: "Article 22",
    chapter: "Chapter 4",
    title: "Right to Life",
    icon: FaShieldAlt,
    color: "#ef4444",
    summary:
      "Every person has the right to life. No person shall be deprived of life intentionally except in execution of a sentence passed in a fair trial.",
    details: `The Constitution of Uganda guarantees the right to life as a fundamental human right. This means:
• No person shall be arbitrarily killed by the state or any individual.
• Capital punishment may only be carried out after a fair trial and proper legal process.
• The state has a duty to protect the lives of all persons within Uganda.
• Unborn children also have protection under this article.
• Any deprivation of life must be justified by law and proportionate necessity.`,
  },
  {
    id: 2,
    article: "Article 23",
    chapter: "Chapter 4",
    title: "Personal Liberty",
    icon: FaLock,
    color: "#f59e0b",
    summary:
      "Every person has the right to personal liberty and shall not be deprived of it except in accordance with the law.",
    details: `Personal liberty is protected under the Constitution:
• No person shall be arrested, detained, imprisoned, or restricted without lawful cause.
• A person arrested must be informed of the reasons for arrest promptly.
• A person arrested must be brought before a court within 48 hours (or 72 hours if on a public holiday or weekend).
• Every arrested person has the right to remain silent and to consult a lawyer.
• Unlawful detention is unconstitutional and can be challenged in court via habeas corpus.
• Bail is available to most accused persons unless the offence is serious (e.g. murder, rape, treason).`,
  },
  {
    id: 3,
    article: "Article 21",
    chapter: "Chapter 4",
    title: "Equality & Freedom from Discrimination",
    icon: FaBalanceScale,
    color: "#8b5cf6",
    summary:
      "All persons are equal before and under the law. No person shall be discriminated against on grounds of sex, race, colour, ethnic origin, tribe, religion, or political opinion.",
    details: `The right to equality is a cornerstone of the Ugandan Constitution:
• All persons are equal in dignity and rights.
• The state shall not discriminate on grounds of sex, race, colour, ethnic origin, tribe, birth, creed, religion, social or economic standing, political opinion, or disability.
• Women shall be accorded full and equal dignity with men.
• Affirmative action programmes are permitted to redress historical imbalances.
• Every person has the right to equal treatment and benefit of the law without discrimination.`,
  },
  {
    id: 4,
    article: "Article 29",
    chapter: "Chapter 4",
    title: "Freedom of Expression",
    icon: FaEye,
    color: "#06b6d4",
    summary:
      "Every person shall have the right to freedom of speech and expression, freedom of the press and access to information.",
    details: `Freedom of expression is protected as follows:
• Every person has the right to freedom of speech and expression.
• Freedom of the press and other media is guaranteed.
• Citizens have the right to access information held by the state.
• Freedom of thought, conscience, and belief is protected.
• These freedoms may be limited only by law and only to the extent reasonable and justifiable in a democratic society — for example to protect national security or public order.
• Journalists have the right to report without censorship within the law.`,
  },
  {
    id: 5,
    article: "Article 30",
    chapter: "Chapter 4",
    title: "Right to Education",
    icon: FaGraduationCap,
    color: "#10b981",
    summary:
      "All persons have the right to education. The state shall take appropriate measures to afford every citizen equal opportunity for education.",
    details: `Education rights in Uganda include:
• Every citizen has the right to basic education.
• The government provides Universal Primary Education (UPE) — free primary schooling for all children.
• Universal Secondary Education (USE) is also provided.
• The state must ensure equal educational opportunities for all citizens regardless of gender, disability, or economic status.
• Parents have the right to choose schools for their children.
• Children with disabilities are entitled to inclusive or special education.`,
  },
  {
    id: 6,
    article: "Article 33",
    chapter: "Chapter 4",
    title: "Rights of Women",
    icon: FaFemale,
    color: "#ec4899",
    summary:
      "Women shall be accorded full and equal dignity of the person with men. The state shall provide the facilities and opportunities necessary to enhance the welfare of women.",
    details: `Uganda's Constitution strongly protects women's rights:
• Women are entitled to equal rights with men in political, economic, social, and cultural life.
• The state shall take affirmative action in favour of women to overcome historical inequalities.
• Women are entitled to maternity leave and protection during and after pregnancy.
• Laws, cultures, customs, or traditions that undermine the dignity, welfare, or interest of women are prohibited.
• Women have the right to own property and inherit independently.
• Domestic violence is prohibited and criminal.`,
  },
  {
    id: 7,
    article: "Article 34",
    chapter: "Chapter 4",
    title: "Rights of Children",
    icon: FaChild,
    color: "#f97316",
    summary:
      "Every child has the right to know and be cared for by his or her parents or those entitled to bring up that child.",
    details: `Children's rights are specifically protected:
• Every child has the right to life, dignity, and education.
• Children must not be employed in work that puts their health or development at risk.
• Children must not be separated from their families against their will unless a court orders it.
• Children have a right to be protected from physical and psychological abuse.
• Orphans and vulnerable children are entitled to state protection and assistance.
• Children born outside marriage have the same rights as those born within marriage.
• The "best interests of the child" principle guides all decisions affecting children.`,
  },
  {
    id: 8,
    article: "Article 24",
    chapter: "Chapter 4",
    title: "Respect for Human Dignity & Protection from Torture",
    icon: FaHandshake,
    color: "#667eea",
    summary:
      "No person shall be subjected to any form of torture, cruel, inhuman or degrading treatment or punishment.",
    details: `Protection from torture and degrading treatment includes:
• Torture — physical or psychological — is absolutely prohibited and no exception is permitted.
• Cruel, inhuman, or degrading treatment by any authority is unconstitutional.
• Confessions obtained through torture are inadmissible in court.
• Every person retains their dignity even when in custody or prison.
• Victims of torture have the right to seek redress and compensation from the state.
• State officials who torture or abuse detainees are personally liable.`,
  },
  {
    id: 9,
    article: "Article 28",
    chapter: "Chapter 4",
    title: "Right to a Fair Trial",
    icon: FaGavel,
    color: "#dc2626",
    summary:
      "Every person charged with a criminal offence shall be presumed innocent until proven guilty. All persons are entitled to a fair, speedy, and public hearing.",
    details: `Fair trial rights are comprehensive:
• Presumption of innocence — you are innocent until proven guilty beyond reasonable doubt.
• Every accused person has the right to be informed promptly, in detail, and in a language they understand of the nature of the offence.
• Every person has the right to adequate time and facilities to prepare a defence.
• Every person has the right to be represented by a lawyer (legal aid is available for serious cases).
• The right to examine witnesses called against you.
• The right not to be compelled to testify against yourself.
• Double jeopardy protection — you cannot be tried twice for the same offence.
• Children must be tried separately from adults.`,
  },
  {
    id: 10,
    article: "Article 29(c)",
    chapter: "Chapter 4",
    title: "Freedom of Religion & Conscience",
    icon: FaPray,
    color: "#7c3aed",
    summary:
      "Every person shall have the right to practise any religion and manifest such practice, to change his or her religion or belief.",
    details: `Freedom of religion includes:
• Every person has the right to freely practice and profess any religion.
• The right to change religion without state interference.
• The right to manifest religious beliefs through worship, teaching, and practice.
• No person shall be compelled to take an oath contrary to their religion or belief.
• Religious groups have the right to establish and maintain schools and hospitals.
• The state shall not impose a state religion.`,
  },
  {
    id: 11,
    article: "Article 40",
    chapter: "Chapter 4",
    title: "Economic Rights & Right to Work",
    icon: FaBriefcase,
    color: "#059669",
    summary:
      "Every Ugandan has a right to practise their profession and carry on any lawful occupation, trade, or business. Workers have the right to form and join trade unions.",
    details: `Economic and labour rights include:
• The right to work under safe and healthy conditions.
• The right to receive equal pay for equal work without discrimination.
• The right to form, join, and participate in the activities of trade unions.
• Workers are entitled to rest, reasonable working hours, paid leave, and fair remuneration.
• Workers have the right to strike, subject to the law.
• The state shall take all practical steps to promote full employment and public assistance to the needy.`,
  },
  {
    id: 12,
    article: "Article 26",
    chapter: "Chapter 4",
    title: "Right to Property",
    icon: FaHome,
    color: "#0891b2",
    summary:
      "Every person has the right to own property either individually or in association with others. No person shall be compulsorily deprived of property without fair and adequate compensation.",
    details: `Property rights are protected as follows:
• Every person has the right to acquire, own, and deal with property.
• Property may only be compulsorily acquired by the government for public use and only with prompt, fair, and adequate compensation.
• Land in Uganda belongs to the citizens and shall vest in citizens.
• Women have equal rights to own and inherit property.
• Any law permitting compulsory acquisition must specify the grounds, procedure, and compensation.`,
  },
  {
    id: 13,
    article: "Article 38",
    chapter: "Chapter 4",
    title: "Civic Rights & Right to Vote",
    icon: FaVoteYea,
    color: "#16a34a",
    summary:
      "Every citizen of Uganda who is 18 years of age or above has the right to vote in a general election or referendum.",
    details: `Civic and political rights include:
• Every Ugandan 18 years or older has the right to vote.
• The right to vote is equal — one person, one vote.
• Elections must be free, fair, and conducted by secret ballot.
• Every citizen has the right to stand for election to any office.
• Citizens have a right to participate in peaceful activities to influence government policy.
• Political parties shall have the right to operate freely and to organise.`,
  },
  {
    id: 14,
    article: "Article 41",
    chapter: "Chapter 4",
    title: "Right to Information",
    icon: FaBook,
    color: "#4338ca",
    summary:
      "Every citizen has a right of access to information in the possession of the state or any other organ or agency of the state except where the release of the information is likely to prejudice the security or sovereignty of the state.",
    details: `The right to information includes:
• Citizens may access government documents, records, and information.
• The Access to Information Act gives the legal framework for this right.
• Information may only be withheld if it threatens national security, privacy of individuals, or other protected interests.
• Government agencies must respond to information requests within prescribed timelines.
• Citizens can appeal to court if denied access to information unlawfully.`,
  },
  {
    id: 15,
    article: "Article 43",
    chapter: "Chapter 4",
    title: "General Limitation on Rights",
    icon: FaUsers,
    color: "#6b7280",
    summary:
      "In the enjoyment of rights and freedoms, no person shall prejudice the fundamental or other human rights and freedoms of others or the public interest.",
    details: `Rights come with responsibilities:
• Every right may be subject to lawful limitations to protect national security, public order, public health, or the rights of others.
• Limitations on rights must be prescribed by law and must be proportionate.
• No limitation shall derogate from the essential core of any right.
• The right to petition the Constitutional Court exists for any person whose rights are violated.
• Uganda also recognises international human rights instruments including the African Charter on Human and Peoples' Rights.`,
  },
  {
    id: 16,
    article: "Article 45",
    chapter: "Chapter 4",
    title: "Rights Not Exclusive",
    icon: FaHeartbeat,
    color: "#be185d",
    summary:
      "The rights, duties, declarations, and guarantees relating to fundamental and other human rights and freedoms specifically mentioned in the Constitution shall not be regarded as excluding others not specifically mentioned.",
    details: `Additional rights are recognised:
• Uganda recognises rights not explicitly listed in the Constitution including under international human rights law.
• The right to a clean and healthy environment is guaranteed.
• The right to food, water, and shelter as social-economic rights are progressive obligations of the state.
• Persons with disabilities have the right to participate fully in public life.
• The rights of minorities, indigenous communities, and marginalised groups are protected.
• Citizens have the right to petition Parliament and other institutions of government.`,
  },
];

function RightCard({ right, isExpanded, onToggle }) {
  const Icon = right.icon;

  return (
    <article
      className="rc-card"
      style={{
        marginBottom: 10,
        cursor: "pointer",
        borderLeft: `4px solid ${right.color}`,
        transition: "all 0.25s ease",
      }}
      onClick={onToggle}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
            flex: 1,
          }}
        >
          {/* Icon */}
          <div
            style={{
              flexShrink: 0,
              width: "2.25rem",
              height: "2.25rem",
              borderRadius: "50%",
              background: `${right.color}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "0.1rem",
            }}
          >
            <Icon style={{ color: right.color, fontSize: "0.95rem" }} />
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                flexWrap: "wrap",
                marginBottom: "0.3rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  padding: "0.15rem 0.5rem",
                  borderRadius: "999px",
                  background: `${right.color}18`,
                  color: right.color,
                  whiteSpace: "nowrap",
                }}
              >
                {right.article}
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "#9ca3af",
                  whiteSpace: "nowrap",
                }}
              >
                {right.chapter}
              </span>
            </div>
            <div
              className="rc-card-title"
              style={{ margin: 0, fontSize: "1rem" }}
            >
              {right.title}
            </div>
            <p
              className="rc-card-description"
              style={{
                marginTop: "0.35rem",
                fontSize: "0.875rem",
                lineHeight: 1.5,
              }}
            >
              {right.summary}
            </p>
          </div>
        </div>

        {/* Expand toggle */}
        <div
          style={{
            flexShrink: 0,
            width: "1.75rem",
            height: "1.75rem",
            borderRadius: "50%",
            background: isExpanded ? `${right.color}15` : "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            marginTop: "0.1rem",
          }}
        >
          {isExpanded ? (
            <FaChevronUp style={{ fontSize: "0.7rem", color: right.color }} />
          ) : (
            <FaChevronDown style={{ fontSize: "0.7rem", color: "#6b7280" }} />
          )}
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div
          style={{
            marginTop: "1rem",
            paddingTop: "1rem",
            borderTop: `1px solid ${right.color}30`,
            fontSize: "0.875rem",
            lineHeight: 1.7,
            color: "#374151",
            whiteSpace: "pre-line",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {right.details}
        </div>
      )}
    </article>
  );
}

export function LawsAndRightsPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [expandAll, setExpandAll] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return RIGHTS;
    return RIGHTS.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q) ||
        r.article.toLowerCase().includes(q) ||
        r.chapter.toLowerCase().includes(q) ||
        r.details.toLowerCase().includes(q),
    );
  }, [search]);

  const toggleRight = (id) => {
    if (expandAll) return;
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const isExpanded = (id) => expandAll || expandedId === id;

  return (
    <div className="rc-page-container">
      {/* Page Header */}
      <h2 className="rc-page-title">
        <FaBalanceScale style={{ marginRight: "0.5rem", display: "inline" }} />
        {t("lawsAndRights.title")}
      </h2>
      <p className="rc-page-subtitle">{t("lawsAndRights.subtitle")}</p>

      {/* Stats bar */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: "1rem",
          padding: "0.75rem 1rem",
          background: "rgba(102,126,234,0.08)",
          borderRadius: "0.75rem",
          border: "1px solid rgba(102,126,234,0.15)",
        }}
      >
        <span style={{ fontSize: "0.85rem", color: "#4b5563" }}>
          <strong style={{ color: "#667eea" }}>{RIGHTS.length}</strong>{" "}
          constitutional rights documented
        </span>
        <span style={{ fontSize: "0.85rem", color: "#4b5563" }}>
          Constitution of Uganda, <strong>1995</strong>
        </span>
        {search && (
          <span style={{ fontSize: "0.85rem", color: "#059669" }}>
            <strong>{filtered.length}</strong> matching your search
          </span>
        )}
      </div>

      {/* Search + controls row */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: "1.25rem",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <FaSearch
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
              pointerEvents: "none",
            }}
          />
          <input
            className="rc-input"
            placeholder={t("lawsAndRights.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "2.5rem", width: "100%" }}
          />
        </div>

        {/* Expand/Collapse All */}
        <button
          type="button"
          onClick={() => {
            setExpandAll((v) => !v);
            setExpandedId(null);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.55rem 1rem",
            borderRadius: "999px",
            border: "1px solid #d1d5db",
            background: expandAll
              ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              : "#f9fafb",
            color: expandAll ? "#fff" : "#374151",
            cursor: "pointer",
            fontSize: "0.85rem",
            fontWeight: 500,
            whiteSpace: "nowrap",
            transition: "all 0.2s",
          }}
        >
          {expandAll ? (
            <>
              <FaChevronUp style={{ fontSize: "0.7rem" }} />
              {t("lawsAndRights.collapse")}
            </>
          ) : (
            <>
              <FaChevronDown style={{ fontSize: "0.7rem" }} />
              {t("lawsAndRights.readMore")}
            </>
          )}
        </button>
      </div>

      {/* Rights list */}
      {filtered.length === 0 ? (
        <p className="rc-hint">
          No rights match your search. Try different keywords.
        </p>
      ) : (
        filtered.map((right) => (
          <RightCard
            key={right.id}
            right={right}
            isExpanded={isExpanded(right.id)}
            onToggle={() => toggleRight(right.id)}
          />
        ))
      )}

      {/* Footer CTA */}
      <div
        style={{
          marginTop: "1.5rem",
          padding: "1.25rem",
          borderRadius: "0.75rem",
          background:
            "linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.08) 100%)",
          border: "1px solid rgba(102,126,234,0.2)",
          textAlign: "center",
        }}
      >
        <FaBalanceScale
          style={{
            fontSize: "1.75rem",
            color: "#667eea",
            marginBottom: "0.5rem",
          }}
        />
        <p
          style={{
            fontSize: "0.9rem",
            color: "#4b5563",
            marginBottom: "0.75rem",
          }}
        >
          Read the full text of the Constitution of Uganda (1995) and stay
          informed about your rights.
        </p>
        <button
          type="button"
          className="rc-primary-button"
          style={{ display: "inline-flex", width: "auto" }}
          onClick={() =>
            window.open(
              "https://www.constituteproject.org/constitution/Uganda_2017",
              "_blank",
              "noopener,noreferrer",
            )
          }
        >
          <FaExternalLinkAlt style={{ marginRight: "0.5rem" }} />
          {t("lawsAndRights.learnMore")}
        </button>
      </div>
    </div>
  );
}
