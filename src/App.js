import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import './App.css';
import { api } from "./api/api";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import './i18n';

const prihlasenyUzivatel = "Alice";

const ramecekStyl = {
  border: "1px solid ",
  borderRadius: "8px",
  padding: "15px",
  marginBottom: "15px"
};

const itemStyl = {
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "8px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

function App() {
  const [seznamy, setSeznamy] = useState([]);
  const [zobrazitArchiv, setZobrazitArchiv] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getLists()
      .then((data) => setSeznamy(data))
      .catch((err) => {
        console.error(err);
        setError(t("Error loading lists"));
      })
      .finally(() => setLoading(false));
  }, [t]);

  if (loading) return <p>{t("Loading...")}</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className={`app ${darkMode ? "dark-mode" : "light-mode"}`}>
      <Router>
        <Routes>
          <Route path="/" element={
            <HomePage
              seznamy={seznamy}
              setSeznamy={setSeznamy}
              zobrazitArchiv={zobrazitArchiv}
              setZobrazitArchiv={setZobrazitArchiv}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              t={t}
              i18n={i18n}
            />
          } />
          <Route path="/seznam/:id" element={<DetailPage seznamy={seznamy} setSeznamy={setSeznamy} t={t} />} />
          <Route path="/members/:id" element={<ManageMembers seznamy={seznamy} setSeznamy={setSeznamy} t={t} />} />
        </Routes>
      </Router>
    </div>
  );
}

// ---------------------- HOME PAGE ----------------------
function HomePage({ seznamy, setSeznamy, zobrazitArchiv, setZobrazitArchiv, darkMode, setDarkMode, t, i18n }) {
  const [showModal, setShowModal] = useState(false);
  const [errorAction, setErrorAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const dostupneSeznamy = seznamy.filter(
    (s) =>
      (s.vlastnik === prihlasenyUzivatel || s.clenove.includes(prihlasenyUzivatel)) &&
      s.archivovany === zobrazitArchiv
  );

  const smazatSeznam = (id) => {
    if (!window.confirm(t("Confirm delete list"))) return;
    setErrorAction(null);
    setActionLoading(true);
    api.deleteList(id)
      .then(() => setSeznamy(seznamy.filter((s) => s.id !== id)))
      .catch((err) => { console.error(err); setErrorAction(t("Error deleting list")); })
      .finally(() => setActionLoading(false));
  };

  const archivovatSeznam = (id) => {
    setErrorAction(null);
    setActionLoading(true);
    api.updateList(id, { archivovany: true })
      .then((upd) => setSeznamy(seznamy.map((s) => (s.id === id ? upd : s))))
      .catch((err) => { console.error(err); setErrorAction(t("Error archiving list")); })
      .finally(() => setActionLoading(false));
  };

  const chartData = dostupneSeznamy.map(s => ({ name: s.nazev, items: s.polozky.length }));

  return (
    <div className="container">
      <div className="top-bar">
        <div className="user-box">{prihlasenyUzivatel}</div>
        <button className="button" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? t("Light Mode") : t("Dark Mode")}
        </button>
        <button className="button" onClick={() => i18n.changeLanguage("cs")}>CZ</button>
        <button className="button" onClick={() => i18n.changeLanguage("en")}>EN</button>
        <button className="button">{t("Log out")}</button>
      </div>

      <h1>{t("My shopping lists")}</h1>
      {errorAction && <p style={{ color: "red" }}>{errorAction}</p>}

      <div className="controls">
        {!zobrazitArchiv && <button className="button" onClick={() => setShowModal(true)} disabled={actionLoading}>{t("Create new list")}</button>}
        <button className="button" onClick={() => setZobrazitArchiv(!zobrazitArchiv)}>
          {zobrazitArchiv ? t("Show active lists") : t("Show archived lists")}
        </button>
      </div>

      <div className="list-grid">
        {dostupneSeznamy.map((s) => (
          <div key={s.id} style={ramecekStyl} className="card">
            <div className="list-header">
              <strong className="list-name">{s.nazev}</strong>
            </div>
            <p><strong>{t("Owner")}:</strong> {s.vlastnik}</p>
            <div className="list-buttons">
              <Link to={`/seznam/${s.id}`}><button className="button">{t("Open")}</button></Link>
              {!zobrazitArchiv && s.vlastnik === prihlasenyUzivatel &&
                <button className="button" onClick={() => archivovatSeznam(s.id)} disabled={actionLoading}>{t("Archive")}</button>}
              {s.vlastnik === prihlasenyUzivatel &&
                <button className="button" onClick={() => smazatSeznam(s.id)} disabled={actionLoading}>{t("Delete")}</button>}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "30px" }}>
        <h2>{t("Lists overview")}</h2>
       <ResponsiveContainer width="100%" height={300}>
  <BarChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="items" fill="#82ca9d" />
  </BarChart>
</ResponsiveContainer>

      </div>

      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={(nazev) => {
          if (!nazev) return;
          setErrorAction(null);
          setActionLoading(true);
          api.createList({
            nazev,
            vlastnik: prihlasenyUzivatel,
            clenove: [prihlasenyUzivatel],
            polozky: [],
            archivovany: false,
          })
            .then(() => api.getLists())
            .then((data) => { setSeznamy(data); setShowModal(false); })
            .catch((err) => { console.error(err); setErrorAction(t("Error creating list")); })
            .finally(() => setActionLoading(false));
        }}
      />
    </div>
  );
}

// ---------------------- DETAIL PAGE ----------------------
function DetailPage({ seznamy, setSeznamy, t }) {
  const { id } = useParams();
  const seznam = seznamy.find((s) => s.id === parseInt(id));
  const [errorAction, setErrorAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterNevyriesene, setFilterNevyriesene] = useState(true);
  const navigate = useNavigate();

  if (!seznam) return <p>{t("List not found")}</p>;

  const updateSeznam = (upd) => {
    setErrorAction(null);
    setActionLoading(true);
    api.updateList(seznam.id, upd)
      .then((updated) => setSeznamy(seznamy.map((s) => (s.id === seznam.id ? updated : s))))
      .catch((err) => { console.error(err); setErrorAction(t("Error updating list")); })
      .finally(() => setActionLoading(false));
  };

  const pridatPolozku = () => {
    const nazev = prompt(t("Enter new item name"));
    if (!nazev) return;
    const novaPolozka = { id: seznam.polozky.length + 1, nazev, vyrieseno: false };
    updateSeznam({ polozky: [...seznam.polozky, novaPolozka] });
  };

  const smazatPolozku = (polozkaId) => {
    updateSeznam({ polozky: seznam.polozky.filter((p) => p.id !== polozkaId) });
  };

  const toggleVyrieseno = (polozkaId) => {
    updateSeznam({
      polozky: seznam.polozky.map((p) =>
        p.id === polozkaId ? { ...p, vyrieseno: !p.vyrieseno } : p
      )
    });
  };

  const completePolozku = (polozkaId) => {
    updateSeznam({
      polozky: seznam.polozky.map((p) =>
        p.id === polozkaId ? { ...p, vyrieseno: true } : p
      )
    });
  };

  const zmenNazev = (novyNazev) => {
    updateSeznam({ nazev: novyNazev });
  };

  const completed = seznam.polozky.filter(p => p.vyrieseno).length;
  const notCompleted = seznam.polozky.length - completed;
  const data = [
    { name: t("Completed"), value: completed },
    { name: t("Not completed"), value: notCompleted }
  ];
  const COLORS = ['#0088FE', '#FF8042'];

  return (
    <div className="container">
      <button className="button back-btn" onClick={() => navigate("/")}>← {t("Back to lists")}</button>

      {errorAction && <p style={{ color: "red" }}>{errorAction}</p>}

      <div style={{ ...ramecekStyl, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ margin: 0, fontSize: "1.8em" }}>{seznam.nazev}</h1>
        {seznam.vlastnik === prihlasenyUzivatel && (
          <button className="button" onClick={() => {
            const novyNazev = prompt(t("Enter new list name"), seznam.nazev);
            if (novyNazev) zmenNazev(novyNazev);
          }}>{t("Rename")}</button>
        )}
      </div>

      {/* Members */}
      <div style={{ ...ramecekStyl, marginBottom: "20px" }} className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>{t("Members")}</h2>
          {seznam.vlastnik === prihlasenyUzivatel && (
            <Link to={`/members/${seznam.id}`}><button className="button">{t("Manage")}</button></Link>
          )}
        </div>
        <ul>
          {seznam.clenove.map((c) => (
            <li key={c}>{c} {c === seznam.vlastnik && `(${t("Owner")})`}</li>
          ))}
        </ul>
        {seznam.clenove.includes(prihlasenyUzivatel) && seznam.vlastnik !== prihlasenyUzivatel && (
          <button className="button" onClick={() => {
            if (window.confirm(t("Confirm leave list"))) {
              updateSeznam({ clenove: seznam.clenove.filter((cl) => cl !== prihlasenyUzivatel) });
              navigate("/");
            }
          }}>{t("Leave the shopping list")}</button>
        )}
      </div>

      {/* Items */}
      <div style={ramecekStyl} className="card">
        <label className="checkbox-label">
          <input type="checkbox" checked={!filterNevyriesene} onChange={() => setFilterNevyriesene(!filterNevyriesene)} /> {t("Show completed items")}
        </label>
        <ul className="items-list">
          {seznam.polozky.filter((p) => !filterNevyriesene || !p.vyrieseno).map((p) => (
            <li key={p.id} style={itemStyl} className="card">
              <span>
                <input type="checkbox" checked={p.vyrieseno} onChange={() => toggleVyrieseno(p.id)} /> {p.nazev}
              </span>
              <div>
                <button className="button" onClick={() => completePolozku(p.id)} disabled={actionLoading}>{t("Complete")}</button>
                <button className="button" onClick={() => smazatPolozku(p.id)} disabled={actionLoading}>{t("Delete")}</button>
              </div>
            </li>
          ))}
        </ul>
        <button className="button" onClick={pridatPolozku} disabled={actionLoading}>+ {t("Add item")}</button>
      </div>

      {/* Pie chart */}
      <div style={{ marginTop: "30px" }}>
        <h2>{t("Items status")}</h2>
        <div style={{ width: "100%", height: 300 }}>
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
        {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
</div>

      </div>
    </div>
  );
}

// ---------------------- MANAGE MEMBERS ----------------------
function ManageMembers({ seznamy, setSeznamy, t }) {
  const { id } = useParams();
  const seznam = seznamy.find((s) => s.id === parseInt(id));
  const [errorAction, setErrorAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const navigate = useNavigate();

  if (!seznam) return <p>{t("List not found")}</p>;

  const updateSeznam = (upd) => {
    setErrorAction(null);
    setActionLoading(true);
    api.updateList(seznam.id, upd)
      .then((updated) => setSeznamy(seznamy.map((s) => (s.id === seznam.id ? updated : s))))
      .catch((err) => { console.error(err); setErrorAction(t("Error updating members")); })
      .finally(() => setActionLoading(false));
  };

  const pridatClena = () => {
    const jmeno = prompt(t("Enter new member name"));
    if (!jmeno) return;
    if (!seznam.clenove.includes(jmeno)) updateSeznam({ clenove: [...seznam.clenove, jmeno] });
    else alert(t("User already a member"));
  };

  const odebratClena = (c) => { updateSeznam({ clenove: seznam.clenove.filter((cl) => cl !== c) }); };

  return (
    <div className="container">
      <button className="button back-btn" onClick={() => navigate(-1)}>← {t("Back")}</button>
      {errorAction && <p style={{ color: "red" }}>{errorAction}</p>}
      <h1>{t("Members of the shopping list")}</h1>
      <div className="list-grid">
        {seznam.clenove.map((c) => (
          <div key={c} style={ramecekStyl} className="card">
            <p><strong>{t("Name")}:</strong> {c}</p>
            <p><strong>{t("Role")}:</strong> {c === seznam.vlastnik ? <u>{t("Owner")}</u> : t("Member")}</p>
            {c !== seznam.vlastnik && <button className="button" onClick={() => odebratClena(c)} disabled={actionLoading}>{t("Remove")}</button>}
          </div>
        ))}
      </div>
      <button className="button" onClick={pridatClena} disabled={actionLoading}>+ {t("Add member")}</button>
    </div>
  );
}

// ---------------------- MODAL ----------------------
function Modal({ visible, onClose, onSubmit }) {
  if (!visible) return null;
  return (
    <div style={modalOverlay}>
      <div style={modalContent}>
        <h2>Create new list</h2>
        <input id="modalInput" type="text" placeholder="Name of the list" style={modalInput} />
        <div style={{ textAlign: "right", marginTop: "20px" }}>
          <button className="button" onClick={onClose}>Cancel</button>
          <button className="button" onClick={() => {
            const val = document.getElementById("modalInput").value;
            onSubmit(val);
          }}>Create</button>
        </div>
      </div>
    </div>
  );
}

const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center" };
const modalContent = { padding: "20px", borderRadius: "10px", width: "300px" };
const modalInput = { width: "100%", padding: "8px", marginTop: "10px", borderRadius: "5px", border: "1px solid #ddd" };

export default App;

