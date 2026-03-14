import { useState, useRef, useEffect, useCallback } from "react";
import {
  FaWhatsapp,
  FaSms,
  FaPhone,
  FaEnvelope,
  FaRobot,
  FaBookOpen,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaPaperPlane,
  FaTimes,
  FaUser,
  FaMicrophone,
  FaRegSmile,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaExclamationTriangle,
  FaGavel,
  FaUserFriends,
  FaSearch,
  FaInfoCircle,
  FaHandsHelping,
} from "react-icons/fa";

/* ─────────────────────────────────────────────────────────────────────────────
   KNOWLEDGE BASE  –  Uganda-specific crime / safety / legal information
   ───────────────────────────────────────────────────────────────────────────── */
const KB = {
  emergency: {
    patterns: [
      "emergency",
      "urgent",
      "help me",
      "danger",
      "attacked",
      "danger",
      "sos",
      "life threatening",
      "threat",
      "killing",
      "murder",
      "assault now",
      "quick",
      "hurry",
      "immediate",
      "999",
      "112",
    ],
    response: `🚨 **EMERGENCY RESPONSE**\n\nCall these numbers **right now**:\n\n• 📞 **999** – Uganda Police Force (free, 24/7)\n• 📞 **112** – General Emergency (all networks)\n• 📞 **0800-199-699** – UPF Toll-free hotline\n• 📞 **0414-343-088** – Kampala CPS\n\nIf you are in immediate danger:\n1. Get to a safe location first\n2. Call 999 immediately\n3. Stay on the line with the operator\n4. Do **not** confront the attacker\n\nAmbulance: **0414-505-000** | Fire: **0312-263-999**`,
  },

  report_crime: {
    patterns: [
      "report crime",
      "how to report",
      "submit report",
      "file report",
      "report incident",
      "report theft",
      "report assault",
      "report robbery",
      "make report",
      "report a case",
      "report complaint",
      "lodge report",
    ],
    response: `📋 **How to Report a Crime in Uganda**\n\n**Using this app:**\n1. Tap "Report Crime" on the home screen\n2. Select Crime or Complaint type\n3. Fill in location, date and description\n4. Attach evidence (photo/video) if available\n5. Submit – your report goes to UPF\n\n**In person:**\n- Visit any Police Station (search stations on this app)\n- Ask for the OC (Officer in Charge)\n- Request a Police Form 23 (crime report form)\n- Get a Case Reference Number (CRN)\n\n**Important:** Report within 24–72 hours for best results. Keep your CRN safe for follow-up.`,
  },

  theft: {
    patterns: [
      "theft",
      "stolen",
      "robbery",
      "burglar",
      "pickpocket",
      "snatch",
      "my phone stolen",
      "someone stole",
      "mugging",
      "break in",
      "house broken",
      "car stolen",
      "wallet stolen",
    ],
    response: `🔒 **Theft / Robbery – What To Do**\n\n**Immediate steps:**\n1. Ensure your personal safety first\n2. Call **999** if the robber is still nearby\n3. Do NOT pursue the thief – it's dangerous\n\n**Reporting theft:**\n- Go to nearest police station\n- Bring any evidence (CCTV, witnesses)\n- Request a Police Abstract (needed for insurance)\n\n**Phone stolen?** Provide IMEI number to police. Call your network to block the SIM: MTN **0800-300-300**, Airtel **0800-100-100**\n\n**Common theft hotspots in Kampala:** Owino Market, Taxi Parks, Kikuubo. Stay alert in crowded areas.`,
  },

  missing_person: {
    patterns: [
      "missing person",
      "missing child",
      "someone missing",
      "lost person",
      "disappeared",
      "can't find",
      "gone missing",
      "find person",
      "report missing",
      "missing relative",
      "missing friend",
    ],
    response: `👤 **Missing Person – What To Do**\n\n**Immediate steps:**\n1. Call **999** immediately – UPF takes missing persons seriously\n2. Report in this app under "Report Missing Person"\n3. Visit the nearest police station\n\n**Information to have ready:**\n- Full name, age, sex\n- Last known location and time\n- Physical description & clothing worn\n- Recent photo\n- Known associates or places they frequent\n\n**UPF Missing Persons Unit:** 0414-233-295\n**Child Helpline:** 116 (free, 24/7)\n\n⚠️ Do NOT wait 24 hours – report immediately, especially for children.`,
  },

  rights: {
    patterns: [
      "rights",
      "my rights",
      "legal rights",
      "constitutional",
      "constitution",
      "laws",
      "arrested rights",
      "right to lawyer",
      "legal help",
      "human rights",
      "what are my rights",
      "ugandan law",
    ],
    response: `⚖️ **Your Rights Under the Constitution of Uganda**\n\n**If Arrested:**\n• Right to be told the reason for arrest (Art. 23)\n• Right to remain silent – anything you say can be used against you\n• Right to a lawyer before questioning\n• Must be charged or released within **48 hours**\n• Right to bail (most offences)\n• Right to humane treatment – no torture\n\n**General Rights (Chapter 4 – Bill of Rights):**\n• Right to life, dignity and personal liberty\n• Freedom of speech, movement and assembly\n• Right to fair trial by independent court\n• Right to legal representation\n\n**If Rights Violated:** Contact Uganda Human Rights Commission: 0414-348-007`,
  },

  domestic_violence: {
    patterns: [
      "domestic violence",
      "abuse",
      "beating",
      "husband beating",
      "wife beating",
      "partner violence",
      "gbv",
      "gender violence",
      "sexual assault",
      "rape",
      "harassment",
      "intimate partner",
    ],
    response: `💜 **Domestic Violence & GBV Support**\n\n**Emergency – call now:**\n• **999** – Police\n• **0800-100-066** – MGLSD GBV Hotline (free, 24/7)\n• **116** – Child Helpline\n\n**Organisations that can help:**\n• FIDA Uganda: 0414-530-848 (legal aid)\n• MIFUMI: 0392-949-494 (shelter & counselling)\n• Uganda Women's Network: 0312-812-100\n• Sanyu Babies Home: 0414-271-027\n\n**Important:** You have the right to safety. Domestic Violence Act 2010 criminalises physical, sexual, emotional and economic abuse. You CAN press charges.\n\nSafety tip: Keep important documents (ID, birth certificates) in a safe location away from home.`,
  },

  fraud_cybercrime: {
    patterns: [
      "fraud",
      "scam",
      "cybercrime",
      "online fraud",
      "mobile money fraud",
      "hacked",
      "phishing",
      "fake",
      "deception",
      "swindle",
      "419",
      "money transfer scam",
      "momo fraud",
      "airtime fraud",
    ],
    response: `💻 **Fraud & Cybercrime – What To Do**\n\n**Report cybercrime:**\n• UPF Computer Crime Unit: **0414-346-623**\n• Financial Intelligence Authority: **0414-302-700**\n• Bank of Uganda (bank fraud): **0800-222-640** (free)\n\n**Mobile Money Fraud?**\n• MTN: 0800-300-300 or #165#\n• Airtel: 0800-100-100 or *185#\n• Block your account immediately\n• Note the fraudulent transaction ID\n\n**Online Fraud steps:**\n1. Do NOT transfer more money\n2. Screenshot all conversations as evidence\n3. Report to the platform (Facebook, WhatsApp etc.)\n4. File police report with screenshots\n\n⚠️ Never share your PIN, OTP or password with anyone.`,
  },

  evidence: {
    patterns: [
      "evidence",
      "preserve evidence",
      "crime scene",
      "document crime",
      "take photos",
      "witness",
      "proof",
      "cctv",
      "footage",
    ],
    response: `📸 **How to Preserve Evidence**\n\n**At a crime scene:**\n1. Do NOT touch or move anything\n2. Take photos/videos from multiple angles\n3. Note the exact time and location\n4. Identify and note witnesses' names & contacts\n5. Call police before anything is disturbed\n\n**Digital evidence:**\n• Screenshot conversations, emails, transactions\n• Save/export chat logs (WhatsApp: Settings → Chats → Export)\n• Note dates, times and sender details\n\n**Physical evidence:**\n• Keep items in sealed bags\n• Do not wash clothing from assault scenes\n• Do not clean up blood or fingerprints\n\n**Chain of custody:** Once you hand evidence to police, get a signed receipt.`,
  },

  witness_protection: {
    patterns: [
      "witness",
      "witness protection",
      "afraid to report",
      "scared report",
      "anonymous report",
      "confidential",
      "identity protected",
      "retaliation",
      "threatening witness",
    ],
    response: `🛡️ **Witness Protection in Uganda**\n\n**Your options:**\n• Report anonymously at any police station\n• Use this app – your identity is protected\n• Witness Protection Act 2021 provides legal protection\n\n**UPF Witness Protection Unit:** 0414-346-700\n\n**If you're being threatened:**\n1. Call 999 immediately\n2. Document all threats (screenshots, record)\n3. Inform the OC at your nearest police station\n4. Request a police bond / protection order\n\n**NGOs that assist witnesses:**\n• HURINET-U: 0414-530-575\n• Foundation for Human Rights: 0312-283-300\n\nRemember: Reporting a crime is a civic duty. The law protects you.`,
  },

  police_stations: {
    patterns: [
      "police station",
      "nearest station",
      "find station",
      "where is station",
      "police post",
      "police",
      "cop",
      "officer",
      "upf",
      "kampala police",
      "go to police",
    ],
    response: `🗺️ **Finding Police Stations**\n\n**Use this app:**\nTap "Search Station" from the home screen to find all Uganda Police Force stations near you with:\n• Phone numbers & directions\n• Station type (Regional HQ, Division, Post)\n• Distance from your current location\n\n**Key Kampala stations:**\n• Central PS: 0414-233-295 (Kampala Rd)\n• Kira Road: 0414-343-088\n• Nakawa: 0414-220-100\n• Kawempe: 0414-532-655\n• Makindye: 0414-510-311\n• Rubaga: 0414-272-491\n\n**UPF National Headquarters:** Plot 7-9, Naguru Hill, Kampala\nTel: 0414-231-795 | Website: upf.go.ug`,
  },

  bail_bond: {
    patterns: [
      "bail",
      "bond",
      "detained",
      "prison",
      "remand",
      "arrested",
      "custody",
      "locked up",
      "release from",
      "police cell",
    ],
    response: `🔓 **Bail & Bond Information**\n\n**Police Bond (before charge):**\n• Available for bailable offences\n• Request from the OC CID at the station\n• Usually granted within 24–48 hours\n• A surety (guarantor with ID) may be required\n\n**Court Bail (after charging):**\n• Apply to the Magistrate/High Court\n• You need a lawyer for best results\n• Denied for murder, treason, rape (High Court only)\n\n**Legal Aid (free legal help):**\n• Legal Aid Service Providers Network: 0414-540-929\n• Uganda Law Society: 0414-258-699\n• FIDA Uganda: 0414-530-848 (women)\n• Law Development Centre: 0414-341-199\n\n**Remember:** You must be charged within **48 hours** or released.`,
  },

  drugs: {
    patterns: [
      "drugs",
      "narcotic",
      "marijuana",
      "cannabis",
      "cocaine",
      "khat",
      "drug dealer",
      "drug trafficking",
      "substance",
    ],
    response: `💊 **Drug Crime Reporting**\n\n**Report drug dealing/trafficking:**\n• UPF Anti-Narcotics Unit: 0414-344-000\n• Anonymous tip: 0800-199-699 (free)\n\n**Penalties in Uganda (Narcotic Drugs Act):**\n• Possession: up to 10 years imprisonment\n• Trafficking: up to 25 years\n• Funding trafficking: life imprisonment\n\n**Seeking help for addiction:**\n• Butabika National Referral Hospital: 0414-222-219\n• Serenity Centre: 0772-000-776\n• ACODEV (community support): 0414-530-190\n\nReport tips confidentially. You will not be prosecuted for reporting.`,
  },

  land_dispute: {
    patterns: [
      "land",
      "property dispute",
      "eviction",
      "land grabbing",
      "title deed",
      "kibanja",
      "land lord",
      "squatter",
      "demolition",
    ],
    response: `🏠 **Land Disputes & Property Rights**\n\n**Report land grabbing / illegal eviction:**\n• Uganda Land Commission: 0414-234-400\n• Ministry of Lands: 0414-373-100\n• UPF Land Crime Unit: 0414-231-795\n\n**Know your rights:**\n• Customary land ownership is legally recognised\n• Eviction requires a valid court order\n• A landlord cannot forcefully remove tenants without notice\n• Kibanja holders have legal protection under the Land Act\n\n**Free legal help:**\n• Uganda Land Alliance: 0414-531-095\n• LASPNET: 0414-540-929\n• Makerere Legal Aid Clinic: 0414-533-676\n\n**Important:** Get ALL agreements in writing. Keep copies of all land documents.`,
  },

  corruption: {
    patterns: [
      "corruption",
      "bribe",
      "bribery",
      "extortion",
      "police bribe",
      "officer asking money",
      "corrupt official",
      "kickback",
    ],
    response: `🚫 **Reporting Corruption & Bribery**\n\n**Never give a bribe.** It is illegal for both parties.\n\n**Report to:**\n• Inspectorate of Government (IG): 0800-100-066 (free, 24/7)\n• State House Anti-Corruption Unit: 0414-343-833\n• UPF Professional Standards Unit: 0414-346-700\n• Directorate of Ethics & Integrity: 0414-341-444\n\n**If a police officer asks for a bribe:**\n1. Politely refuse\n2. Note their name, badge number, station\n3. Note date, time and location\n4. Report to the UPF Professional Standards Unit\n\n**Online reporting:** inspectorate.go.ug\n\nAll reports are treated confidentially.`,
  },

  traffic: {
    patterns: [
      "accident",
      "traffic",
      "road accident",
      "crash",
      "hit and run",
      "vehicle accident",
      "traffic police",
      "driving",
      "road carnage",
    ],
    response: `🚗 **Road Accidents – What To Do**\n\n**Immediately:**\n1. Call **999** and **112**\n2. Ambulance: **0414-505-000**\n3. Do not move injured persons unless in immediate danger\n4. Secure the scene – turn on hazard lights\n\n**Traffic Police Headquarters:** 0414-346-055\n**UNRA Emergency:** 0800-100-099 (free)\n\n**After an accident:**\n• Do NOT flee – hit and run is a serious offence\n• Exchange insurance and ID details\n• Take photos of all vehicles and scene\n• Get a police report within 24 hours\n• Report to your insurer within 48 hours\n\n**Insurance claims:** You need a police abstract (obtainable from the nearest police station).`,
  },

  app_help: {
    patterns: [
      "how to use",
      "app help",
      "help using",
      "navigate",
      "features",
      "what can you do",
      "what is this app",
      "about app",
    ],
    response: `📱 **ReportCrime App – Features Guide**\n\n**Main Features:**\n🔴 **Report Crime** – Submit crime/complaint reports with auto-location\n🟢 **Get Help** – Contact support + AI assistant (that's me!)\n🟡 **Lost & Found** – Report or search for lost items\n🔵 **Missing Persons** – View & report missing people\n🟣 **Search Stations** – Find police stations on interactive map\n🩵 **Laws & Rights** – Browse Ugandan laws\n🩷 **Report Missing Person** – Detailed missing person report\n🟠 **Report Missing Property** – Missing property reports\n\n**Tips:**\n• Sign in to save your reports and receive updates\n• Use the map view in Search Stations for visual navigation\n• Emergency: tap 📞 in the top bar anytime`,
  },

  greeting: {
    patterns: [
      "hello",
      "hi",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
      "howdy",
      "greetings",
      "start",
      "begin",
      "help",
    ],
    response: `👋 **Hello! I'm SafeBot**, your Uganda Safety AI Assistant.\n\nI can help you with:\n\n🚨 Emergency contacts & procedures\n📋 How to report crimes\n⚖️ Your legal rights\n👤 Missing persons guidance\n🗺️ Finding police stations\n💜 GBV & domestic violence support\n💻 Fraud & cybercrime reporting\n🔒 Theft & robbery advice\n🏠 Land disputes\n🚫 Corruption reporting\n\nJust type your question or choose a quick topic below. For life-threatening emergencies, **call 999 immediately**.`,
  },

  thank_you: {
    patterns: [
      "thank you",
      "thanks",
      "thank",
      "appreciate",
      "helpful",
      "great",
      "awesome",
      "perfect",
      "good job",
    ],
    response: `😊 You're welcome! Stay safe out there.\n\nRemember:\n• Emergency: **999** or **112**\n• UPF Hotline: **0800-199-699** (free)\n\nIs there anything else I can help you with?`,
  },

  goodbye: {
    patterns: [
      "bye",
      "goodbye",
      "see you",
      "later",
      "done",
      "exit",
      "close chat",
    ],
    response: `👋 Stay safe! Remember, in any emergency call **999** immediately.\n\nThe ReportCrime app is always here when you need it. Take care! 🛡️`,
  },
};

/* Quick-suggestion chips shown at the start and after each reply */
const QUICK_CHIPS = [
  { label: "🚨 Emergency", key: "emergency" },
  { label: "📋 Report Crime", key: "report_crime" },
  { label: "⚖️ My Rights", key: "rights" },
  { label: "👤 Missing Person", key: "missing_person" },
  { label: "🗺️ Police Stations", key: "police_stations" },
  { label: "💜 GBV Help", key: "domestic_violence" },
  { label: "💻 Fraud/Scam", key: "fraud_cybercrime" },
  { label: "🔒 Theft", key: "theft" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   NLP ENGINE  –  keyword / intent matching
   ───────────────────────────────────────────────────────────────────────────── */
function classifyIntent(text) {
  const lower = text.toLowerCase().trim();
  if (!lower) return null;

  let best = null;
  let bestScore = 0;

  for (const [intentKey, data] of Object.entries(KB)) {
    for (const pattern of data.patterns) {
      if (lower.includes(pattern)) {
        const score = pattern.length; // longer patterns = more specific = higher score
        if (score > bestScore) {
          bestScore = score;
          best = intentKey;
        }
      }
    }
  }

  return best;
}

function getResponse(text, intentOverride) {
  const intent = intentOverride || classifyIntent(text);
  if (intent && KB[intent]) {
    return KB[intent].response;
  }

  // Fallback – unknown intent
  return `🤔 I'm not sure about that specific query.\n\nTry asking about:\n• Emergency contacts\n• How to report a crime\n• Your legal rights\n• Missing persons\n• Domestic violence / GBV\n• Fraud or cybercrime\n• Finding police stations\n\nOr call the UPF Hotline: **0800-199-699** (free, 24/7)`;
}

/* Render markdown-style bold (**text**) in a message */
function renderMessage(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
   AI CHAT COMPONENT
   ───────────────────────────────────────────────────────────────────────────── */
function AIChatPanel({ onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "bot",
      text: KB.greeting.response,
      ts: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = useCallback(
    (text, intentOverride) => {
      const userText = (text || input).trim();
      if (!userText) return;
      setInput("");

      const userMsg = {
        id: Date.now(),
        role: "user",
        text: userText,
        ts: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setTyping(true);

      // Simulate typing delay (400–900ms)
      const delay = 400 + Math.random() * 500;
      setTimeout(() => {
        const botText = getResponse(userText, intentOverride);
        const botMsg = {
          id: Date.now() + 1,
          role: "bot",
          text: botText,
          ts: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setTyping(false);
      }, delay);
    },
    [input],
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleChip = (chip) => {
    sendMessage(chip.label.replace(/^[^\s]+\s/, ""), chip.key);
    inputRef.current?.focus();
  };

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: 520,
        borderRadius: "1.25rem",
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(102,126,234,0.18)",
        border: "1.5px solid rgba(102,126,234,0.2)",
        background: "rgba(255,255,255,0.98)",
      }}
    >
      {/* Chat header */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: "0.85rem 1.1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <FaRobot style={{ color: "#fff", fontSize: "1.1rem" }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem" }}>
            SafeBot AI
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "0.72rem",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#4ade80",
                display: "inline-block",
                animation: "pulse 2s infinite",
              }}
            />
            Online • Uganda Safety Assistant
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "none",
            color: "#fff",
            borderRadius: "50%",
            width: 30,
            height: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "0.85rem",
          }}
        >
          <FaTimes />
        </button>
      </div>

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          background: "linear-gradient(180deg, #f8f9ff 0%, #fff 100%)",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
              alignItems: "flex-end",
              gap: "0.5rem",
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background:
                  msg.role === "user"
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {msg.role === "user" ? (
                <FaUser style={{ color: "#fff", fontSize: "0.7rem" }} />
              ) : (
                <FaRobot style={{ color: "#fff", fontSize: "0.7rem" }} />
              )}
            </div>

            {/* Bubble */}
            <div
              style={{
                maxWidth: "78%",
                padding: "0.65rem 0.9rem",
                borderRadius:
                  msg.role === "user"
                    ? "1rem 1rem 0.2rem 1rem"
                    : "1rem 1rem 1rem 0.2rem",
                background:
                  msg.role === "user"
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "#fff",
                color: msg.role === "user" ? "#fff" : "#1f2937",
                fontSize: "0.85rem",
                lineHeight: 1.55,
                boxShadow:
                  msg.role === "user"
                    ? "0 2px 8px rgba(102,126,234,0.35)"
                    : "0 2px 8px rgba(0,0,0,0.08)",
                border: msg.role === "bot" ? "1px solid #e5e7eb" : "none",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {msg.role === "bot" ? renderMessage(msg.text) : msg.text}
              <div
                style={{
                  fontSize: "0.65rem",
                  opacity: 0.6,
                  marginTop: "0.3rem",
                  textAlign: "right",
                }}
              >
                {formatTime(msg.ts)}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {typing && (
          <div
            style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FaRobot style={{ color: "#fff", fontSize: "0.7rem" }} />
            </div>
            <div
              style={{
                padding: "0.65rem 0.9rem",
                borderRadius: "1rem 1rem 1rem 0.2rem",
                background: "#fff",
                border: "1px solid #e5e7eb",
                display: "flex",
                gap: "0.3rem",
                alignItems: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#667eea",
                    animation: `bounce 1.2s infinite ${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick chips */}
      <div
        style={{
          padding: "0.5rem 0.75rem",
          display: "flex",
          gap: "0.4rem",
          flexWrap: "wrap",
          borderTop: "1px solid #f3f4f6",
          background: "#fafbff",
          flexShrink: 0,
        }}
      >
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => handleChip(chip)}
            disabled={typing}
            style={{
              padding: "0.28rem 0.7rem",
              borderRadius: "999px",
              border: "1.5px solid #e5e7eb",
              background: "#fff",
              color: "#374151",
              fontSize: "0.72rem",
              cursor: typing ? "not-allowed" : "pointer",
              fontWeight: 500,
              transition: "all 0.15s",
              opacity: typing ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!typing) {
                e.currentTarget.style.background =
                  "linear-gradient(135deg,#667eea,#764ba2)";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "#667eea";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.color = "#374151";
              e.currentTarget.style.borderColor = "#e5e7eb";
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          gap: "0.5rem",
          padding: "0.75rem 1rem",
          borderTop: "1px solid #e5e7eb",
          background: "#fff",
          flexShrink: 0,
          alignItems: "center",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about safety in Uganda…"
          disabled={typing}
          style={{
            flex: 1,
            padding: "0.6rem 0.9rem",
            borderRadius: "999px",
            border: "1.5px solid #e5e7eb",
            fontSize: "0.85rem",
            outline: "none",
            background: "#f8f9ff",
            transition: "border 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#667eea")}
          onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
        />
        <button
          type="submit"
          disabled={typing || !input.trim()}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            border: "none",
            background:
              typing || !input.trim()
                ? "#e5e7eb"
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: typing || !input.trim() ? "#9ca3af" : "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: typing || !input.trim() ? "not-allowed" : "pointer",
            flexShrink: 0,
            transition: "all 0.2s",
          }}
        >
          <FaPaperPlane style={{ fontSize: "0.85rem" }} />
        </button>
      </form>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────────────────────────────────────── */
export function GetHelpPage() {
  const [showAI, setShowAI] = useState(false);

  const handleContact = (action, value, label) => {
    try {
      const navigateTo = (url) => {
        window.location.href = url;
      };

      switch (action) {
        case "whatsapp": {
          // WhatsApp Web and mobile support
          const waUrl = `https://wa.me/${value.replace(/\D/g, "")}?text=Hello%20Support`;
          window.open(waUrl, "_blank", "noopener,noreferrer");
          break;
        }
        case "sms": {
          // SMS support for all devices
          const cleanPhone = value.replace(/\D/g, "");
          const smsUrl = `sms:${cleanPhone}?body=Hello%20Support`;
          // Try native SMS first
          if (
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
              navigator.userAgent,
            )
          ) {
            navigateTo(smsUrl);
          } else {
            window.open(smsUrl, "_self");
          }
          break;
        }
        case "call": {
          // Phone call support
          const cleanPhone = value.replace(/\D/g, "");
          navigateTo(`tel:${cleanPhone}`);
          break;
        }
        case "email": {
          // Email support with fallback
          const subject = "Report%20Crime%20Support%20Request";
          const body =
            "I%20need%20assistance%20with%20my%20report.%0D%0A%0D%0APlease%20help%20me.";
          const mailtoUrl = `mailto:${value}?subject=${subject}&body=${body}`;

          // Check if we're on a mobile device
          const isMobile =
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
              navigator.userAgent,
            );

          if (isMobile) {
            // Try native email app first
            navigateTo(mailtoUrl);
          } else {
            // Desktop fallback
            window.open(mailtoUrl, "_blank");
          }
          break;
        }
        default:
          console.warn(`Unknown contact action: ${action}`);
      }
    } catch (error) {
      console.error(`Error handling contact action ${action}:`, error);
      // Fallback: show alert with contact info
      alert(`${label}: ${value}\n\nPlease contact us using your default app.`);
    }
  };

  const contactItems = [
    {
      label: "WhatsApp",
      color: "#16a34a",
      gradient: "linear-gradient(135deg,#16a34a,#15803d)",
      icon: FaWhatsapp,
      action: "whatsapp",
      value: "256770830791",
      desc: "Chat on WhatsApp",
    },
    {
      label: "SMS",
      color: "#0ea5e9",
      gradient: "linear-gradient(135deg,#0ea5e9,#0284c7)",
      icon: FaSms,
      action: "sms",
      value: "256770830791",
      desc: "Send a text message",
    },
    {
      label: "Call",
      color: "#22c55e",
      gradient: "linear-gradient(135deg,#22c55e,#16a34a)",
      icon: FaPhone,
      action: "call",
      value: "256770830791",
      desc: "Call support line",
    },
    {
      label: "Email",
      color: "#ef4444",
      gradient: "linear-gradient(135deg,#ef4444,#dc2626)",
      icon: FaEnvelope,
      action: "email",
      value: "support@reportcrime.ug",
      desc: "Send us an email",
    },
  ];

  const quickEmergency = [
    { label: "Police 999", number: "999", color: "#667eea" },
    { label: "Emergency 112", number: "112", color: "#ef4444" },
    { label: "UPF Hotline", number: "0800199699", color: "#10b981" },
    { label: "Child Helpline", number: "116", color: "#f59e0b" },
  ];

  return (
    <div className="rc-page-container">
      <h2 className="rc-page-title">
        <FaHandsHelping style={{ marginRight: "0.5rem", display: "inline" }} />
        Get Help
      </h2>
      <p className="rc-page-subtitle">
        Reach emergency services, contact support, or ask our AI safety
        assistant.
      </p>

      {/* Emergency quick-dial strip */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          marginBottom: "1.25rem",
          padding: "0.85rem 1rem",
          borderRadius: "1rem",
          background:
            "linear-gradient(135deg,rgba(239,68,68,0.08),rgba(239,68,68,0.03))",
          border: "1px solid rgba(239,68,68,0.18)",
        }}
      >
        <span
          style={{
            fontSize: "0.78rem",
            fontWeight: 700,
            color: "#dc2626",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            marginRight: "0.25rem",
          }}
        >
          <FaExclamationTriangle /> Emergency:
        </span>
        {quickEmergency.map((e) => (
          <a
            key={e.label}
            href={`tel:${e.number}`}
            style={{
              padding: "0.3rem 0.85rem",
              borderRadius: "999px",
              background: e.color,
              color: "#fff",
              fontSize: "0.78rem",
              fontWeight: 700,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(el) => (el.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(el) => (el.currentTarget.style.opacity = "1")}
          >
            <FaPhone style={{ fontSize: "0.65rem" }} />
            {e.label}
          </a>
        ))}
      </div>

      {/* AI Chat Panel */}
      {showAI ? (
        <div style={{ marginBottom: "1.5rem" }}>
          <AIChatPanel onClose={() => setShowAI(false)} />
        </div>
      ) : (
        /* AI Promo card */
        <button
          type="button"
          onClick={() => setShowAI(true)}
          style={{
            width: "100%",
            padding: "1.1rem 1.4rem",
            borderRadius: "1.1rem",
            border: "1.5px solid rgba(102,126,234,0.3)",
            background:
              "linear-gradient(135deg,rgba(102,126,234,0.08) 0%,rgba(118,75,162,0.05) 100%)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1.5rem",
            transition: "all 0.2s",
            textAlign: "left",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg,rgba(102,126,234,0.14),rgba(118,75,162,0.1))";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 6px 24px rgba(102,126,234,0.18)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg,rgba(102,126,234,0.08),rgba(118,75,162,0.05))";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "1rem",
              background: "linear-gradient(135deg,#667eea,#764ba2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <FaRobot style={{ color: "#fff", fontSize: "1.4rem" }} />
          </div>
          <div>
            <div
              style={{ fontWeight: 700, fontSize: "1rem", color: "#1f2937" }}
            >
              SafeBot AI Assistant
              <span
                style={{
                  marginLeft: "0.5rem",
                  fontSize: "0.65rem",
                  background: "linear-gradient(135deg,#667eea,#764ba2)",
                  color: "#fff",
                  padding: "0.1rem 0.4rem",
                  borderRadius: "999px",
                  fontWeight: 700,
                  verticalAlign: "middle",
                }}
              >
                LIVE
              </span>
            </div>
            <div
              style={{
                fontSize: "0.82rem",
                color: "#6b7280",
                marginTop: "0.2rem",
              }}
            >
              Ask about crime reporting, your rights, police stations, GBV
              support & more. Tap to open chat →
            </div>
          </div>
        </button>
      )}

      {/* Contact cards */}
      <h3
        style={{
          fontSize: "1rem",
          fontWeight: 700,
          marginBottom: "0.75rem",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        <FaPhone style={{ color: "#667eea", fontSize: "0.85rem" }} />
        Contact Support
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12,
          marginBottom: "1.5rem",
        }}
      >
        {contactItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              type="button"
              key={item.label}
              className="rc-card"
              style={{
                background: item.gradient,
                color: "#fff",
                boxShadow: `0 8px 20px ${item.color}40`,
                textAlign: "center",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = `0 12px 28px ${item.color}60`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 8px 20px ${item.color}40`;
              }}
              onClick={() => handleContact(item.action, item.value, item.label)}
            >
              <Icon
                style={{
                  fontSize: "1.6rem",
                  marginBottom: "0.5rem",
                  display: "block",
                  margin: "0 auto 0.4rem",
                }}
              />
              <div
                className="rc-card-title"
                style={{ color: "#fff", fontSize: "0.9rem" }}
              >
                {item.label}
              </div>
              <p
                className="rc-card-description"
                style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.75rem" }}
              >
                {item.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Useful resources */}
      <h3
        style={{
          fontSize: "1rem",
          fontWeight: 700,
          marginBottom: "0.75rem",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        <FaInfoCircle style={{ color: "#667eea", fontSize: "0.85rem" }} />
        Quick Resources
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "0.65rem",
          marginBottom: "1.5rem",
        }}
      >
        {[
          {
            icon: FaShieldAlt,
            title: "Uganda Police Force",
            sub: "upf.go.ug",
            color: "#667eea",
            url: "https://upf.go.ug",
          },
          {
            icon: FaGavel,
            title: "Uganda Legal Information",
            sub: "ulii.org",
            color: "#10b981",
            url: "https://ulii.org",
          },
          {
            icon: FaUserFriends,
            title: "Human Rights Commission",
            sub: "uhrc.go.ug",
            color: "#f59e0b",
            url: "https://uhrc.go.ug",
          },
          {
            icon: FaSearch,
            title: "Inspectorate of Govt (IG)",
            sub: "inspectorate.go.ug",
            color: "#ef4444",
            url: "https://inspectorate.go.ug",
          },
        ].map((r) => {
          const Icon = r.icon;
          return (
            <a
              key={r.title}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                borderRadius: "0.85rem",
                background: "rgba(255,255,255,0.95)",
                border: "1px solid #e5e7eb",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateX(3px)";
                e.currentTarget.style.borderColor = r.color;
                e.currentTarget.style.boxShadow = `0 4px 16px ${r.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateX(0)";
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "0.65rem",
                  background: `${r.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon style={{ color: r.color, fontSize: "1rem" }} />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    color: "#1f2937",
                  }}
                >
                  {r.title}
                </div>
                <div style={{ fontSize: "0.72rem", color: "#667eea" }}>
                  {r.sub}
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Social media */}
      <div style={{ textAlign: "center", marginTop: 8 }}>
        <p
          style={{
            fontSize: "0.82rem",
            color: "#6b7280",
            marginBottom: "0.75rem",
          }}
        >
          Follow Uganda Police Force
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
          {[
            {
              name: "Facebook",
              icon: FaFacebook,
              url: "https://facebook.com/UgandaPoliceForce",
            },
            {
              name: "Twitter",
              icon: FaTwitter,
              url: "https://twitter.com/UgandaPolice",
            },
            {
              name: "Instagram",
              icon: FaInstagram,
              url: "https://instagram.com",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                type="button"
                className="rc-icon-button"
                style={{ width: 42, height: 42, borderRadius: 999 }}
                onClick={() => window.open(item.url, "_blank")}
                title={item.name}
              >
                <Icon />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
