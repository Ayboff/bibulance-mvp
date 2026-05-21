import { BrowserRouter, Routes, Route, useLocation, Link } from "react-router-dom";
import {
  HelpCircle,
  Ambulance,
  CalendarCheck,
  UserRound,
} from "lucide-react";

import Commander from "./pages/Commander";
import Aide from "./pages/Aide";
import MesTransports from "./pages/MesTransports";
import Compte from "./pages/Compte";
import TransportsIteratifs from "./pages/TransportsIteratifs";
import RecapIteratif from "./pages/RecapIteratif";
import MissionSuccess from "./pages/MissionSuccess";

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}

function MainLayout() {
  const location = useLocation();

  // Pages où la navbar doit disparaître
  const hideNavbar = ["/mission-success"].includes(location.pathname);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",

        // 🎨 Fond pastel premium Bibulance
        background: "linear-gradient(135deg, #F9FCFE 0%, #F4F8FB 100%)",
      }}
    >
      {/* Contenu principal */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          paddingBottom: hideNavbar ? 0 : 90, // espace pour la navbar pleine largeur
          transition: "padding-bottom 0.25s ease",
        }}
      >
        <Routes>
          <Route path="/" element={<Commander />} />
          <Route path="/commander" element={<Commander />} />
          <Route path="/aide" element={<Aide />} />
          <Route path="/mes-transports" element={<MesTransports />} />
          <Route path="/compte" element={<Compte />} />

          <Route path="/iteratif" element={<TransportsIteratifs />} />
          <Route path="/iteratif/recap" element={<RecapIteratif />} />

          <Route path="/mission-success" element={<MissionSuccess />} />
        </Routes>
      </div>

      {/* 🔥 NAVBAR PREMIUM PLEINE LARGEUR */}
      {!hideNavbar && <Navbar />}
    </div>
  );
}

/* ---------------------------------------------------------
   🎨 NAVBAR PREMIUM INTÉGRÉE DIRECTEMENT DANS APP.JS
--------------------------------------------------------- */

function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navItem = (path, Icon, label) => (
    <Link
      to={path}
      style={{
        flex: 1,
        textAlign: "center",
        textDecoration: "none",

        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",

        gap: 2,
        paddingTop: 4,

        transition: "all 0.25s ease",
      }}
    >
      <Icon
        size={20} // 🔥 Icône plus petite
        style={{
          color: isActive(path) ? "#00C2CB" : "#1f2937",
          transition: "all 0.25s ease",
        }}
      />

      <span
        style={{
          fontSize: 11, // 🔥 Texte plus petit
          fontWeight: isActive(path) ? 600 : 500,
          color: isActive(path) ? "#00C2CB" : "#1f2937",
          transition: "all 0.25s ease",
        }}
      >
        {label}
      </span>
    </Link>
  );

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: 70, // 🔥 Barre plus fine

        // 🎨 100% glassmorphism
        background:
          "linear-gradient(135deg, rgba(236,254,255,0.65) 0%, rgba(243,232,255,0.65) 100%)",

        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",

        borderTop: "1px solid rgba(255,255,255,0.45)",
        boxShadow: "0 -4px 18px rgba(0,0,0,0.10)",

        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",

        zIndex: 999,
      }}
    >
      {navItem("/aide", HelpCircle, "Aide")}
      {navItem("/commander", Ambulance, "Commander")}
      {navItem("/mes-transports", CalendarCheck, "Mes transports")}
      {navItem("/compte", UserRound, "Compte")}
    </div>
  );
}

