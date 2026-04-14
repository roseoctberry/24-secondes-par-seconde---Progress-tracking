import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { subscribeToChecked, saveChecked } from "./firebase.js";

/* ════════════════════════════════════════════════
   DATA
   ════════════════════════════════════════════════ */
const PHASES = [
  {
    id: "fond",
    num: "00",
    title: "Fondations",
    subtitle: "Bibliographie · Données · Contacts · Corpus · Lectures Partie I",
    color: "#96794C",
    tasks: [
      {
        id: "t01",
        label: "Vérifier & compléter la bibliographie",
        tag: "parallèle",
        subs: [
          { id: "t01a", label: "Benhamou — confirmer l'édition et le co-auteur (Bacache-Beauvallet ?)" },
          { id: "t01b", label: "Attensité! — trouver la date de publication et l'éditeur exact" },
          { id: "t01c", label: "ILM / Epic Games — localiser la documentation technique StageCraft" },
          { id: "t01d", label: "Presse Mandalorian — identifier les articles exacts (Variety, THR, WSJ, Guardian)" },
        ],
      },
      {
        id: "t02",
        label: "Collecter les données sectorielles",
        tag: "parallèle",
        subs: [
          { id: "t02a", label: "Télécharger le Bilan CNC 2024" },
          { id: "t02b", label: "Télécharger Ofcom Media Nations" },
          { id: "t02c", label: "Télécharger EAO Key Trends" },
          { id: "t02d", label: "Télécharger Nielsen — The Gauge" },
        ],
      },
      {
        id: "t03",
        label: "Constituer le corpus Alice Guy",
        tag: "parallèle",
        subs: [
          { id: "t03a", label: "Cataloguer la filmographie Gaumont" },
          { id: "t03b", label: "Cataloguer la filmographie Solax Film Co" },
          { id: "t03c", label: "Sélectionner les œuvres contemporaines à mettre en regard" },
        ],
      },
      {
        id: "t04",
        label: "Identifier les contacts — Partie II",
        tag: "urgent",
        subs: [
          { id: "t04a", label: "Psychologues / neuroscientifiques cibles (→ II.4)" },
          { id: "t04b", label: "Producteurs de rapports sectoriels — CNC, Ofcom, EAO (→ II.3)" },
        ],
      },
      {
        id: "t05",
        label: "Identifier les contacts — Partie III",
        tag: "urgent",
        subs: [
          { id: "t05a", label: "Producteurs / distributeurs : mk2, A24, NEON, Le Pacte, Blumhouse, Warp Films, Elements Pictures" },
          { id: "t05b", label: "Plateformes / curateurs : MUBI, Criterion, Mk2 Curiosity" },
        ],
      },
      {
        id: "t06",
        label: "Rechercher les activités et travaux des contacts ciblés",
        tag: "séquentiel · après identification",
        subs: [
          { id: "t06a", label: "Psychologues / neuroscientifiques — publications, thèmes, positions" },
          { id: "t06b", label: "Producteurs de rapports — rôle exact, méthodologies, déclarations" },
          { id: "t06c", label: "Producteurs / distributeurs — filmographies récentes, prises de parole, lignes éditoriales" },
          { id: "t06d", label: "Plateformes / curateurs — politique de sélection, articles, interviews" },
        ],
      },
      {
        id: "t07",
        label: "Première prise de contact calibrée",
        tag: "séquentiel · après recherche",
        subs: [
          { id: "t07a", label: "Rédiger les messages personnalisés (montrer qu'on connaît leur travail)" },
          { id: "t07b", label: "Envoyer les prises de contact — Partie II" },
          { id: "t07c", label: "Envoyer les prises de contact — Partie III" },
        ],
      },
      {
        id: "t08",
        label: "Relances",
        tag: "séquentiel · après 7-10 jours",
        subs: [
          { id: "t08a", label: "Première relance — contacts Partie II sans réponse" },
          { id: "t08b", label: "Première relance — contacts Partie III sans réponse" },
          { id: "t08c", label: "Deuxième relance éventuelle ou canal alternatif" },
        ],
      },
      {
        id: "t09",
        label: "Rédiger les guides d'entretien",
        tag: "séquentiel · après confirmations",
        subs: [
          { id: "t09a", label: "Partie généraliste commune — contexte mémoire, problématique, cadrage éthique" },
          { id: "t09b", label: "Partie personnalisée — psychologues / neurosciences (adaptée à chaque interlocuteur confirmé)" },
          { id: "t09c", label: "Partie personnalisée — producteurs de rapports sectoriels" },
          { id: "t09d", label: "Partie personnalisée — producteurs / distributeurs" },
          { id: "t09e", label: "Partie personnalisée — curateurs / plateformes" },
        ],
      },
      {
        id: "rI",
        label: "📖  Lectures — Partie I",
        tag: "parallèle · avant rédaction Phase 01",
        subs: [
          { id: "rI1", label: "Lévi-Strauss (1962) — La pensée sauvage [I.1]" },
          { id: "rI2", label: "Gunning (1986) — The cinema of attractions [I.2]" },
          { id: "rI3", label: "Musser (1994) — The emergence of cinema [I.2]" },
          { id: "rI4", label: "Bordwell, Staiger & Thompson (1985) — The classical Hollywood cinema [I.2]" },
          { id: "rI5", label: "McMahan (2002) — Alice Guy Blaché: Lost visionary of the cinema [I.3]" },
          { id: "rI6", label: "Gaines & Simon (2009) — Alice Guy Blaché: Cinema pioneer [I.3]" },
        ],
      },
    ],
  },
  {
    id: "p1",
    num: "01",
    title: "Partie I + Analyses",
    subtitle: "Archéologie de la limite · Micro-analyses & lectures Partie II en parallèle",
    color: "#2D6A4F",
    tasks: [
      {
        id: "t10",
        label: "PISTE A — Rédaction Partie I",
        tag: "séquentiel",
        subs: [
          { id: "t10a", label: "1.1 — Anthropologie de la nécessité (Lévi-Strauss, bricolage)" },
          { id: "t10b", label: "1.2 — Le cinéma comme laboratoire de la rareté" },
          { id: "t10c", label: "1.3 — Alice Guy : généalogie du pari créatif ← dépend du corpus (t03)" },
          { id: "t10d", label: "Relecture & révision Partie I" },
        ],
      },
      {
        id: "t11",
        label: "PISTE B — Analyses anticipées (en parallèle de la Piste A)",
        tag: "parallèle",
        subs: [
          { id: "t11a", label: "Micro-analyse Stranger Things — hypothèse de standardisation" },
          { id: "t11b", label: "Micro-analyse Game of Thrones — contrepoint complexité / implicite" },
          { id: "t11c", label: "Ébauche du cadre théorique 2.1 (Zuboff, Citton, Crary, Simon)" },
        ],
      },
      {
        id: "rII",
        label: "📖  Lectures — Partie II (cadre théorique + micro-analyses)",
        tag: "parallèle · en avance de phase",
        subs: [
          { id: "rII1", label: "Simon (1971) — Designing organizations for an information-rich world [II.1]" },
          { id: "rII2", label: "Citton (2014) — L'économie de l'attention [II.1]" },
          { id: "rII3", label: "Zuboff (2019) — The age of surveillance capitalism [II.1]" },
          { id: "rII4", label: "Crary (2013) — 24/7: Late capitalism and the ends of sleep [II.1]" },
          { id: "rII5", label: "Benhamou (2014) — L'économie de la culture [II.1]" },
          { id: "rII6", label: "Attensité! — Manifeste Friends of Attention [II.1]" },
          { id: "rII7", label: "Glennon — Genre theory and Stranger Things [II.2]" },
          { id: "rII8", label: "Mittell (2006) — Narrative complexity in contemporary American television [II.2]" },
          { id: "rII9", label: "Sergeant (2021) — Across the narrow screen: GoT world-building [II.2]" },
          { id: "rII10", label: "Sepulchre et al. — Game of Thrones: Quality television [II.2]" },
          { id: "rII11", label: "Rosa (2018) — Résonance : une sociologie de la relation au monde [II.5]" },
        ],
      },
    ],
  },
  {
    id: "p2",
    num: "02",
    title: "Partie II",
    subtitle: "Diagnostic de l'anesthésie · Entretiens terrain",
    color: "#5B3A8C",
    tasks: [
      {
        id: "rIIb",
        label: "📖  Lectures — Partie II (coût humain)",
        tag: "parallèle · pendant rédaction",
        subs: [
          { id: "rIIb1", label: "Ophir, Nass & Wagner (2009) — Cognitive control in media multitaskers [II.4]" },
          { id: "rIIb2", label: "Ward et al. (2017) — Brain drain: smartphone & cognitive capacity [II.4]" },
        ],
      },
      {
        id: "t20",
        label: "2.1 — L'économie de la captation attentionnelle",
        tag: "reprend l'ébauche t11c",
        subs: [
          { id: "t20a", label: "Finaliser le cadre : Zuboff + Citton + Crary + Simon + Benhamou" },
          { id: "t20b", label: "Intégrer Attensité! comme document de terrain (mobilisé explicitement comme manifeste)" },
        ],
      },
      {
        id: "t21",
        label: "2.2 — La standardisation à l'épreuve des formes",
        tag: "reprend t11a + t11b",
        subs: [
          { id: "t21a", label: "Intégrer les micro-analyses dans l'argumentation" },
          { id: "t21b", label: "Rédiger la dialectique standardisation ↔ contrepoint" },
        ],
      },
      {
        id: "t22",
        label: "2.3 — Le chiffre comme incitation",
        tag: "dépend de t02 + entretiens t04b",
        subs: [
          { id: "t22a", label: "Analyser les rapports CNC / Ofcom / EAO / Nielsen comme objets" },
          { id: "t22b", label: "Conduire & retranscrire les entretiens avec les producteurs de rapports" },
          { id: "t22c", label: "Rédiger : le chiffre comme acteur du système d'incitations" },
        ],
      },
      {
        id: "t23",
        label: "2.4 — Le coût humain",
        tag: "dépend des entretiens t04a",
        subs: [
          { id: "t23a", label: "Conduire & retranscrire les entretiens psychologues / neurosciences" },
          { id: "t23b", label: "Rédiger : Ophir, Ward + terrain — attention, empathie, sens critique" },
        ],
      },
      {
        id: "t24",
        label: "2.5 — La démission managériale et l'érosion de la résonance",
        tag: "synthèse · dépend de 2.1–2.4",
        subs: [
          { id: "t24a", label: "Articuler Rosa (résonance) avec le diagnostic construit en 2.1–2.4" },
          { id: "t24b", label: "Rédiger la transition vers Partie III" },
        ],
      },
      {
        id: "t25",
        label: "Relecture & révision Partie II",
        tag: "séquentiel",
        subs: [
          { id: "t25a", label: "Cohérence argumentative interne" },
          { id: "t25b", label: "Vérifier que la transition I → II → III tient" },
        ],
      },
    ],
  },
  {
    id: "p3",
    num: "03",
    title: "Partie III",
    subtitle: "Management de la résonance · Terrain entretiens",
    color: "#B03A2E",
    tasks: [
      {
        id: "rIII",
        label: "📖  Lectures — Partie III (cadre + cas)",
        tag: "parallèle · pendant rédaction",
        subs: [
          { id: "rIII1", label: "Caves (2000) — Creative industries: Contracts between art and commerce [III.1]" },
          { id: "rIII2", label: "Hesmondhalgh (2019) — The cultural industries, 4e éd. [III.1]" },
          { id: "rIII3", label: "Mittell (2015) — Complex TV: Poetics of contemporary television [III.1]" },
          { id: "rIII4", label: "Shepherd (2025) — The billion-dollar underdog: A24 [III.1 · Moonlight]" },
          { id: "rIII5", label: "Simms (2024) — A24 and post-horror: A metamodern studio [III.1 · Moonlight]" },
          { id: "rIII6", label: "Bartak (2022) — A strategic audit of A24, honors thesis [III.1 · Moonlight]" },
          { id: "rIII7", label: "ScreenDaily (2016) — Production focus: Barry Jenkins's Moonlight [III.1]" },
          { id: "rIII8", label: "ScreenDaily (2016) — A24 lines up Moonlight international releases [III.1]" },
          { id: "rIII9", label: "Hans (2016) — Moonlight first-look review, Sight & Sound [III.1]" },
          { id: "rIII10", label: "Goodlad, Kaganovsky & Marsh (2012) — Mad Men, Mad World [III.1 · Mad Men]" },
          { id: "rIII11", label: "Beresford (2025) — 'Mad Men' passed by HBO, Deadline [III.1 · Mad Men]" },
          { id: "rIII12", label: "Barantini (2025) — Adolescence director on one-take filming, ScreenDaily [III.1]" },
          { id: "rIII13", label: "Associated Press (2025) — The one-take wonder of Adolescence [III.1]" },
          { id: "rIII14", label: "Pavich (2013) — Jodorowsky's Dune [documentaire] [III.1 · coda]" },
        ],
      },
      {
        id: "rIIIt",
        label: "📖  Lectures — Partie III (techno-création)",
        tag: "parallèle · avant rédaction 3.4",
        subs: [
          { id: "rIIIt1", label: "Netflix (2022) — Love, Death + Robots : making of Jibaro [III.4]" },
          { id: "rIIIt2", label: "Awards Daily (2022) — Alberto Mielgo on Jibaro [III.4]" },
          { id: "rIIIt3", label: "befores & afters (2022) — Behind the scenes Jibaro [III.4]" },
          { id: "rIIIt4", label: "ILM / Epic Games — StageCraft virtual production documentation [III.4]" },
          { id: "rIIIt5", label: "Handelsman & Pullen (2020) — How The Mandalorian used real-time technology [III.4]" },
          { id: "rIIIt6", label: "Sweney — The Mandalorian & Disney+ subscriber growth [III.4]" },
        ],
      },
      {
        id: "t30",
        label: "3.1 — Le pari créatif comme stratégie viable",
        tag: "partiellement autonome",
        subs: [
          { id: "t30a", label: "Cas Moonlight / A24 — pari distributeur devenu producteur" },
          { id: "t30b", label: "Cas Mad Men — temporalité longue, fabrique du désir" },
          { id: "t30c", label: "Cas Adolescence — plateforme grand public + objet atypique" },
          { id: "t30d", label: "Coda : Jodorowsky's Dune — le risque ne garantit pas la viabilité" },
        ],
      },
      {
        id: "t31",
        label: "3.2 — Qui fait ces paris ?",
        tag: "dépend des entretiens t05a",
        subs: [
          { id: "t31a", label: "Conduire & retranscrire les entretiens producteurs / distributeurs" },
          { id: "t31b", label: "Identifier les configurations organisationnelles récurrentes" },
          { id: "t31c", label: "Rédiger : culture décisionnelle, modèle économique, rapport au risque" },
        ],
      },
      {
        id: "t32",
        label: "3.3 — Réintroduire la barrière côté offre",
        tag: "dépend des entretiens t05b",
        subs: [
          { id: "t32a", label: "Conduire & retranscrire les entretiens curateurs / plateformes" },
          { id: "t32b", label: "Rédiger : curation, rareté volontaire, contre-modèle algorithmique" },
        ],
      },
      {
        id: "t33",
        label: "3.4 — Techno-création soutenable",
        tag: "partiellement autonome",
        subs: [
          { id: "t33a", label: "Analyse Mandalorian / StageCraft — logique franchise, cas ambigu" },
          { id: "t33b", label: "Analyse Jibaro — grammaire visuelle, convergence technique + intention" },
          { id: "t33c", label: "Rédiger : la variable discriminante n'est pas l'outil" },
        ],
      },
      {
        id: "t34",
        label: "3.5 — L'architecte de l'intention : synthèse",
        tag: "synthèse · dépend de 3.1–3.4",
        subs: [
          { id: "t34a", label: "Articuler la proposition de gouvernance" },
          { id: "t34b", label: "Relier au fil conducteur : contrainte → dissolution → réintroduction" },
        ],
      },
      {
        id: "t35",
        label: "Relecture & révision Partie III",
        tag: "séquentiel",
        subs: [{ id: "t35a", label: "Cohérence des stratégies et lien avec la problématique" }],
      },
    ],
  },
  {
    id: "fin",
    num: "04",
    title: "Finalisation",
    subtitle: "Introduction · Conclusion · Bibliographie · Remise V1",
    color: "#1A5276",
    tasks: [
      {
        id: "t40",
        label: "Rédiger l'introduction générale",
        tag: "à écrire en dernier",
        subs: [
          { id: "t40a", label: "Problématique, plan, enjeux, cadre méthodologique" },
          { id: "t40b", label: "Accrocher le lecteur — la promesse de Godard" },
        ],
      },
      {
        id: "t41",
        label: "Rédiger la conclusion générale",
        tag: "séquentiel",
        subs: [
          { id: "t41a", label: "Synthèse des trois parties" },
          { id: "t41b", label: "Limites et ouvertures" },
        ],
      },
      {
        id: "t42",
        label: "Bibliographie finale & vérification des sources",
        tag: "séquentiel",
        subs: [
          { id: "t42a", label: "Vérifier normes bibliographiques, cohérence des entrées" },
          { id: "t42b", label: "Vérifier tous les liens et accès aux sources" },
        ],
      },
      {
        id: "t43",
        label: "Relecture intégrale & mise en forme",
        tag: "séquentiel",
        subs: [
          { id: "t43a", label: "Typographie, pagination, table des matières" },
          { id: "t43b", label: "Cohérence stylistique, orthographe, transitions" },
        ],
      },
      {
        id: "t44",
        label: "Remise de la V1 finalisée au superviseur",
        tag: "",
        subs: [{ id: "t44a", label: "Envoi de la version 1 complète — pour retours et corrections" }],
      },
    ],
  },
];

const ALL_SUB_IDS = PHASES.flatMap((p) => p.tasks.flatMap((t) => t.subs.map((s) => s.id)));

const TAG_STYLES = {
  "parallèle": { bg: "#E8F5E9", color: "#2E7D32" },
  "urgent": { bg: "#FFF3E0", color: "#E65100" },
  "séquentiel": { bg: "#E3F2FD", color: "#1565C0" },
  "reprend": { bg: "#FFF8E1", color: "#F9A825" },
  "synthèse": { bg: "#FCE4EC", color: "#AD1457" },
  "partiellement": { bg: "#E0F2F1", color: "#00695C" },
  "à écrire": { bg: "#EFEBE9", color: "#4E342E" },
  "dépend": { bg: "#F3E5F5", color: "#6A1B9A" },
  "default": { bg: "#F5F5F5", color: "#616161" },
};

function getTagStyle(tag) {
  if (!tag) return null;
  const low = tag.toLowerCase();
  const key = Object.keys(TAG_STYLES).find((k) => low.startsWith(k));
  return TAG_STYLES[key] || TAG_STYLES.default;
}

/* ════════════════════════════════════════════════
   COMPONENT
   ════════════════════════════════════════════════ */
export default function App() {
  const [checked, setChecked] = useState({});
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState(null);
  const [synced, setSynced] = useState(false);
  const phaseRefs = useRef({});

  // ── Firebase real-time listener ──
  useEffect(() => {
    const unsubscribe = subscribeToChecked((data) => {
      setChecked(data);
      setLoading(false);
      setSynced(true);
      // briefly flash the sync indicator
      setTimeout(() => setSynced(false), 1200);
    });
    return () => unsubscribe();
  }, []);

  // ── Auto-expand first incomplete phase ──
  useEffect(() => {
    if (!loading && activePhase === null) {
      const first = PHASES.find((p) => !p.tasks.every((t) => t.subs.every((s) => checked[s.id])));
      setActivePhase(first?.id || PHASES[0].id);
    }
  }, [loading]);

  // ── Scroll active phase card into view ──
  useEffect(() => {
    if (activePhase && phaseRefs.current[activePhase]) {
      phaseRefs.current[activePhase].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activePhase]);

  // ── Toggle & save ──
  const toggle = useCallback((id) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      // Clean up false values to keep Firebase tidy
      if (!next[id]) delete next[id];
      saveChecked(next).catch(console.error);
      return next;
    });
  }, []);

  // ── Stats ──
  const totalDone = ALL_SUB_IDS.filter((id) => checked[id]).length;
  const totalCount = ALL_SUB_IDS.length;
  const globalRatio = totalCount > 0 ? totalDone / totalCount : 0;

  const phaseStats = useMemo(() => {
    const m = {};
    PHASES.forEach((p) => {
      const ids = p.tasks.flatMap((t) => t.subs.map((s) => s.id));
      const done = ids.filter((id) => checked[id]).length;
      m[p.id] = { done, total: ids.length, ratio: ids.length > 0 ? done / ids.length : 0 };
    });
    return m;
  }, [checked]);

  const currentPhaseData = PHASES.find((p) => p.id === activePhase);
  const activeIdx = PHASES.findIndex((p) => p.id === activePhase);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "'Outfit', sans-serif" }}>
        <p style={{ color: "#999", fontSize: 14 }}>Connexion à Firebase…</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif", maxWidth: 800, margin: "0 auto", padding: "28px 0 60px", color: "#1a1a1a" }}>
      <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        .phase-scroll::-webkit-scrollbar{display:none}
        .phase-scroll{-ms-overflow-style:none;scrollbar-width:none}
        .sub-row{transition:background 0.08s}
        .sub-row:hover{background:rgba(0,0,0,0.025)}
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .anim-in{animation:fadeUp 0.25s ease forwards}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        .sync-dot{animation:pulse 1.2s ease}
      `}</style>

      {/* HEADER */}
      <div style={{ padding: "0 20px", marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 24, fontWeight: 700, margin: 0, lineHeight: 1.2, color: "#111", letterSpacing: "-0.02em" }}>
              24 secondes par seconde
            </h1>
            <p style={{ fontSize: 12.5, color: "#888", margin: "4px 0 0", fontWeight: 300 }}>
              Feuille de route · L'audiovisuel à l'épreuve de l'économie de l'attention
            </p>
          </div>
          {/* Sync indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
            <div className={synced ? "sync-dot" : ""} style={{ width: 7, height: 7, borderRadius: "50%", background: synced ? "#4CAF50" : "#ccc", transition: "background 0.3s" }} />
            <span style={{ fontSize: 10, color: synced ? "#4CAF50" : "#bbb", fontWeight: 500, transition: "color 0.3s" }}>
              {synced ? "synced" : "live"}
            </span>
          </div>
        </div>
      </div>

      {/* GLOBAL PROGRESS */}
      <div style={{ padding: "0 20px", marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#999" }}>Progression globale</span>
          <span style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 28, fontWeight: 700, color: "#111" }}>{Math.round(globalRatio * 100)}%</span>
        </div>
        <div style={{ width: "100%", height: 8, borderRadius: 4, background: "#eee", overflow: "hidden" }}>
          <div style={{ width: `${globalRatio * 100}%`, height: "100%", borderRadius: 4, background: "linear-gradient(90deg, #444 0%, #888 100%)", transition: "width 0.6s cubic-bezier(.4,0,.2,1)" }} />
        </div>
        <span style={{ fontSize: 11, color: "#bbb", marginTop: 5, display: "block" }}>{totalDone} / {totalCount} sous-tâches</span>
      </div>

      {/* HORIZONTAL PHASE STRIP */}
      <div className="phase-scroll" style={{ display: "flex", gap: 10, overflowX: "auto", padding: "0 20px 18px", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}>
        {PHASES.map((phase, idx) => {
          const stats = phaseStats[phase.id];
          const isActive = activePhase === phase.id;
          const isComplete = stats.done === stats.total;
          const isPast = idx < activeIdx && isComplete;

          return (
            <div
              key={phase.id}
              ref={(el) => (phaseRefs.current[phase.id] = el)}
              onClick={() => setActivePhase(phase.id)}
              style={{
                scrollSnapAlign: "center", flexShrink: 0, width: 155,
                padding: "14px 16px 12px", borderRadius: 12, cursor: "pointer",
                border: isActive ? `2px solid ${phase.color}` : "2px solid transparent",
                background: isActive ? `${phase.color}0A` : "rgba(0,0,0,0.02)",
                opacity: isPast ? 0.35 : 1, transition: "all 0.25s ease",
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: phase.color, letterSpacing: "0.1em", marginBottom: 4 }}>PHASE {phase.num}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#222", lineHeight: 1.3, marginBottom: 10, minHeight: 34 }}>{phase.title}</div>
              <div style={{ width: "100%", height: 4, borderRadius: 2, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <div style={{ width: `${stats.ratio * 100}%`, height: "100%", borderRadius: 2, background: phase.color, transition: "width 0.5s ease" }} />
              </div>
              <div style={{ fontSize: 10, color: "#999", marginTop: 4, fontWeight: 500 }}>{stats.done}/{stats.total}{isComplete && " ✓"}</div>
            </div>
          );
        })}
      </div>

      {/* ACTIVE PHASE DETAIL */}
      {currentPhaseData && (
        <div className="anim-in" key={currentPhaseData.id} style={{ padding: "0 20px" }}>
          <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: `2px solid ${currentPhaseData.color}20` }}>
            <span style={{ fontFamily: "'Source Serif 4', serif", fontSize: 20, fontWeight: 700, color: currentPhaseData.color }}>{currentPhaseData.title}</span>
            <p style={{ fontSize: 12, color: "#888", margin: "3px 0 0", fontWeight: 300 }}>{currentPhaseData.subtitle}</p>
          </div>

          {currentPhaseData.tasks.map((task) => {
            const subsDone = task.subs.filter((s) => checked[s.id]).length;
            const allDone = subsDone === task.subs.length;
            const isReading = task.id.startsWith("r");

            return (
              <div key={task.id} style={{ marginBottom: 18, ...(isReading ? { borderLeft: `3px solid ${currentPhaseData.color}30`, paddingLeft: 12 } : {}) }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderRadius: 10, background: allDone ? "rgba(0,0,0,0.015)" : "transparent" }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6,
                    border: `2px solid ${allDone ? currentPhaseData.color : "rgba(0,0,0,0.15)"}`,
                    background: allDone ? currentPhaseData.color : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 1, transition: "all 0.2s",
                  }}>
                    {allDone && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: allDone ? "#aaa" : "#222", lineHeight: 1.4, textDecoration: allDone ? "line-through" : "none" }}>
                      {task.label}
                    </div>
                    {task.tag && (() => {
                      const ts = getTagStyle(task.tag);
                      return <span style={{ display: "inline-block", marginTop: 4, padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: ts.bg, color: ts.color }}>{task.tag}</span>;
                    })()}
                    <div style={{ fontSize: 11, color: "#bbb", marginTop: 3 }}>{subsDone}/{task.subs.length}</div>
                  </div>
                </div>

                <div style={{ marginLeft: 34, marginTop: 4 }}>
                  {task.subs.map((sub, idx) => {
                    const isDone = !!checked[sub.id];
                    return (
                      <div key={sub.id} className="sub-row" onClick={() => toggle(sub.id)} style={{
                        display: "flex", alignItems: "flex-start", gap: 9,
                        padding: "8px 10px", cursor: "pointer", borderRadius: 6,
                        borderBottom: idx < task.subs.length - 1 ? "1px solid rgba(0,0,0,0.04)" : "none",
                      }}>
                        <div style={{
                          width: 17, height: 17, borderRadius: 4,
                          border: `1.5px solid ${isDone ? currentPhaseData.color : "rgba(0,0,0,0.2)"}`,
                          background: isDone ? currentPhaseData.color : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0, marginTop: 1, transition: "all 0.15s",
                        }}>
                          {isDone && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2.5 6L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                        </div>
                        <span style={{ fontSize: 12.5, color: isDone ? "#bbb" : "#444", textDecoration: isDone ? "line-through" : "none", lineHeight: 1.45, fontWeight: 400 }}>
                          {sub.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FOOTER */}
      <div style={{ padding: "24px 20px 0", borderTop: "1px solid rgba(0,0,0,0.06)", marginTop: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#aaa", marginBottom: 8 }}>Légende</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { tag: "parallèle", desc: "simultané" },
            { tag: "urgent", desc: "immédiat" },
            { tag: "séquentiel", desc: "dépend d'une étape" },
          ].map(({ tag, desc }) => {
            const ts = getTagStyle(tag);
            return (
              <div key={tag} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ padding: "2px 7px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: ts.bg, color: ts.color }}>{tag}</span>
                <span style={{ fontSize: 10.5, color: "#999" }}>{desc}</span>
              </div>
            );
          })}
        </div>
        <p style={{ fontSize: 10.5, color: "#c0c0c0", marginTop: 14, lineHeight: 1.5 }}>
          Synchronisation temps réel via Firebase — votre superviseur voit votre progression en direct.
        </p>
      </div>
    </div>
  );
}
