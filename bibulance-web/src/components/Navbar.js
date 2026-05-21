import { NavLink } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/aide">Aide</NavLink>
      <NavLink to="/commander">Commander</NavLink>
      <NavLink to="/mes-transports">Mes transports</NavLink>
      <NavLink to="/compte">Compte</NavLink>
    </nav>
  );
}
