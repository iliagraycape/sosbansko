"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Ambulance,
  Camera,
  CarFront,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flame,
  Footprints,
  HeartPulse,
  LocateFixed,
  MapPin,
  Mountain,
  Navigation,
  PackageCheck,
  Phone,
  Radio,
  Route,
  ShieldCheck,
  Siren,
  User,
  UserRoundSearch,
  Users,
  Waves,
  Wind,
} from "lucide-react";
import { rankResponders, type IncidentProfile, type Responder } from "../lib/matching";

type Mode = "report" | "responder" | "room" | "admin";
type Tone = "critical" | "urgent" | "assistance";

type IncidentDefinition = IncidentProfile & {
  title: string;
  subtitle: string;
  tone: Tone;
  icon: React.ReactNode;
  safety: string;
};

const incidents: IncidentDefinition[] = [
  {
    id: "self-danger",
    title: "Аз съм в опасност",
    subtitle: "Изгубен съм, ранен съм или не мога да се придвижа безопасно",
    tone: "critical",
    icon: <HeartPulse />,
    safety: "Остани на безопасно място, ако можеш. Обади се на 112 и пази батерията на телефона.",
    severity: "critical",
    requiredSkills: ["first-aid", "mountain"],
    usefulEquipment: ["medical-kit", "4x4", "rope"],
  },
  {
    id: "missing-child",
    title: "Изгубено дете",
    subtitle: "Дете е изчезнало или не може да бъде намерено",
    tone: "critical",
    icon: <UserRoundSearch />,
    safety: "Не организирай хаотично търсене. Запази последната известна позиция, час, дрехи и посока.",
    severity: "critical",
    requiredSkills: ["search", "mountain"],
    usefulEquipment: ["drone", "thermal", "4x4", "radio"],
  },
  {
    id: "medical",
    title: "Човек в опасност",
    subtitle: "Неадекватен, ранен, в безсъзнание или с нужда от първа помощ",
    tone: "critical",
    icon: <Ambulance />,
    safety: "Не мести тежко пострадал човек, освен ако мястото не е непосредствено опасно.",
    severity: "critical",
    requiredSkills: ["medical", "first-aid"],
    usefulEquipment: ["aed", "medical-kit"],
  },
  {
    id: "mountain",
    title: "Изгубен / дезориентиран",
    subtitle: "Човек се лута в планината или на безлюдно място",
    tone: "critical",
    icon: <Mountain />,
    safety: "Избягвай самостоятелно навлизане в опасен терен. Предай точната GPS позиция на 112/ПСС.",
    severity: "critical",
    requiredSkills: ["mountain", "search"],
    usefulEquipment: ["4x4", "rope", "drone", "thermal"],
  },
  {
    id: "crash",
    title: "Тежка катастрофа",
    subtitle: "Пострадали или блокирани хора",
    tone: "critical",
    icon: <CarFront />,
    safety: "Обезопаси себе си първо. Не стой на пътното платно и не мести пострадали без нужда.",
    severity: "critical",
    requiredSkills: ["medical", "first-aid", "technical"],
    usefulEquipment: ["medical-kit", "aed", "extinguisher"],
  },
  {
    id: "fire",
    title: "Пожар / силен дим",
    subtitle: "Автомобил, къща, сграда, гора или поле гори",
    tone: "critical",
    icon: <Flame />,
    safety: "Не влизай в горяща сграда и не приближавай автомобил с риск от взрив. Изчакай пожарната на безопасно разстояние.",
    severity: "critical",
    requiredSkills: ["fire", "first-aid"],
    usefulEquipment: ["extinguisher", "medical-kit", "4x4"],
  },
  {
    id: "water",
    title: "Опасност във вода",
    subtitle: "Река, езеро, падане във вода или риск от удавяне",
    tone: "critical",
    icon: <Waves />,
    safety: "Не влизай във вода без подготовка. Подай плаващ предмет или въже от безопасно място и се обади на 112.",
    severity: "critical",
    requiredSkills: ["water-rescue", "medical"],
    usefulEquipment: ["rope", "medical-kit"],
  },
  {
    id: "fall",
    title: "Падане / труден терен",
    subtitle: "Скала, дере, стръмен склон или недостъпно място",
    tone: "critical",
    icon: <Footprints />,
    safety: "Не слизай след пострадалия без осигуровка и обучение. Запази визуален контакт и GPS позицията.",
    severity: "critical",
    requiredSkills: ["mountain", "rope", "medical"],
    usefulEquipment: ["rope", "medical-kit"],
  },
  {
    id: "gas",
    title: "Газ / опасно изтичане",
    subtitle: "Миризма на газ, теч или съмнение за опасна среда",
    tone: "urgent",
    icon: <Wind />,
    safety: "Не включвай електрически уреди и не използвай открит пламък. Отдалечи се и се обади на 112.",
    severity: "urgent",
    requiredSkills: ["fire", "technical"],
    usefulEquipment: ["gas-detector", "breathing-protection"],
  },
  {
    id: "vehicle",
    title: "Закъсал автомобил",
    subtitle: "Нужда от помощ на труднодостъпно място без непосредствена опасност",
    tone: "assistance",
    icon: <Navigation />,
    safety: "Ако има риск за живота, студ, травма или пожар, използвай критичен SOS сценарий и се обади на 112.",
    severity: "assistance",
    requiredSkills: ["4x4"],
    usefulEquipment: ["4x4", "tow", "tools"],
  },
];

const now = Date.now();
const demoResponders: Responder[] = [
  {
    id: "r1",
    name: "Иван П.",
    role: "Планински спасител",
    latitude: 41.8403,
    longitude: 23.4869,
    availability: "available",
    verified: true,
    skills: ["mountain", "search", "rope", "first-aid"],
    equipment: ["rope", "radio", "medical-kit", "4x4"],
    lastSeenAt: now - 60_000,
  },
  {
    id: "r2",
    name: "Мария К.",
    role: "Медицинско лице",
    latitude: 41.8359,
    longitude: 23.4918,
    availability: "available",
    verified: true,
    skills: ["medical", "first-aid"],
    equipment: ["aed", "medical-kit"],
    lastSeenAt: now - 90_000,
  },
  {
    id: "r3",
    name: "Георги Т.",
    role: "Доброволец 4x4",
    latitude: 41.847,
    longitude: 23.4932,
    availability: "available",
    verified: true,
    skills: ["4x4", "search", "technical"],
    equipment: ["4x4", "tow", "tools", "extinguisher"],
    lastSeenAt: now - 180_000,
  },
  {
    id: "r4",
    name: "Николай С.",
    role: "Пожарна подготовка",
    latitude: 41.8298,
    longitude: 23.482,
    availability: "limited",
    verified: true,
    skills: ["fire", "first-aid"],
    equipment: ["extinguisher", "medical-kit"],
    lastSeenAt: now - 240_000,
  },
];

const defaultCoordinates = { latitude: 41.8384, longitude: 23.4886 };

export default function SosBanskoApp() {
  const [mode, setMode] = useState<Mode>("report");
  const [selectedId, setSelectedId] = useState("missing-child");
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(null);
  const [locationState, setLocationState] = useState<"idle" | "loading" | "ready" | "denied">("idle");
  const [manualLocation, setManualLocation] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [mediaName, setMediaName] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [responderAction, setResponderAction] = useState<"pending" | "accepted" | "declined" | "arrived">("pending");

  const selected = useMemo(() => incidents.find((item) => item.id === selectedId) ?? incidents[0], [selectedId]);
  const incidentCoordinates = coordinates ?? defaultCoordinates;
  const matches = useMemo(
    () => rankResponders(demoResponders, selected, incidentCoordinates.latitude, incidentCoordinates.longitude),
    [selected, incidentCoordinates.latitude, incidentCoordinates.longitude]
  );

  const identityReady = reporterName.trim().length >= 3 && reporterPhone.replace(/\D/g, "").length >= 8;
  const locationReady = Boolean(coordinates) || manualLocation.trim().length >= 5;
  const canSubmit = identityReady && locationReady;

  function captureLocation() {
    if (!navigator.geolocation) {
      setLocationState("denied");
      return;
    }
    setLocationState("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLocationState("ready");
      },
      () => setLocationState("denied"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  }

  function activateSelfDanger() {
    setSelectedId("self-danger");
    setDetails("Подателят е самият човек в опасност.");
    captureLocation();
  }

  function submitDemo() {
    if (!identityReady) {
      setFormError("Въведи име и телефон за обратна връзка. Това помага срещу фалшиви сигнали и позволява бързо уточнение.");
      return;
    }
    if (!locationReady) {
      setFormError("Добави GPS локация или опиши мястото ръчно.");
      return;
    }
    setFormError("");
    setSubmitted(true);
  }

  const locationText = coordinates
    ? `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}${coordinates.accuracy ? ` · ±${Math.round(coordinates.accuracy)} м` : ""}`
    : manualLocation || "Демо локация около Банско";

  return (
    <main className="rx-shell">
      <header className="rx-header">
        <div className="rx-brand"><span><Siren size={24} /></span><div><strong>SOS BANSKO</strong><small>Мрежа за реакция в първите критични минути</small></div></div>
        <div className="rx-demo">ПУБЛИЧНО ДЕМО</div>
      </header>

      <section className="rx-112">
        <AlertTriangle size={26} />
        <div><strong>ПЪРВО СЕ ОБАДЕТЕ НА 112!</strong><span>SOS Bansko подпомага 112 и професионалните служби. Не ги заменя. Целта е проверен човек наблизо да може да помогне до пристигането им.</span></div>
        <a href="tel:112">ОБАДИ СЕ НА 112</a>
      </section>

      <nav className="rx-nav" aria-label="Основна навигация">
        <button className={mode === "report" ? "active" : ""} onClick={() => setMode("report")}><Radio size={19} /><span>SOS</span></button>
        <button className={mode === "responder" ? "active" : ""} onClick={() => setMode("responder")}><ShieldCheck size={19} /><span>Спасител</span></button>
        <button className={mode === "room" ? "active" : ""} onClick={() => setMode("room")}><Route size={19} /><span>Случай</span></button>
        <button className={mode === "admin" ? "active" : ""} onClick={() => setMode("admin")}><Users size={19} /><span>Център</span></button>
      </nav>

      {mode === "report" && (
        <section className="rx-report">
          <button className="rx-self-danger" onClick={activateSelfDanger}>
            <span><HeartPulse size={30} /></span>
            <div><strong>АЗ СЪМ В ОПАСНОСТ</strong><small>Един бърз режим, ако самият ти си изгубен, ранен или блокиран</small></div>
            <ChevronRight />
          </button>

          <div className="rx-panel">
            <div className="rx-title"><div><span>1 · СИТУАЦИЯ</span><h1>Какво се случва?</h1><p>Избери най-близкия сценарий. При животозастрашаващ случай не губи време в дълъг текст.</p></div><b>цел: &lt;30 сек.</b></div>
            <div className="rx-incidents">
              {incidents.filter((item) => item.id !== "self-danger").map((item) => (
                <button key={item.id} className={`${selectedId === item.id ? "active" : ""} ${item.tone}`} onClick={() => setSelectedId(item.id)}>
                  <span>{item.icon}</span><div><strong>{item.title}</strong><small>{item.subtitle}</small></div><CheckCircle2 size={18} />
                </button>
              ))}
            </div>

            <div className="rx-safety"><AlertTriangle size={20} /><div><strong>Безопасност за този сценарий</strong><span>{selected.safety}</span></div></div>

            <div className="rx-step">
              <div className="rx-step-head"><b>2</b><div><strong>Точна локация</strong><span>GPS е основният сигнал за намиране на най-близката подходяща помощ.</span></div></div>
              <button className={`rx-location ${locationState}`} onClick={captureLocation}><LocateFixed size={22} /><div><strong>{locationState === "loading" ? "Прихващаме GPS…" : coordinates ? "GPS локацията е прихваната" : "Използвай текущата ми локация"}</strong><span>{coordinates ? locationText : locationState === "denied" ? "GPS не е достъпен — опиши мястото ръчно." : "Ще поискаме разрешение от телефона."}</span></div><ChevronRight /></button>
              <input className="rx-input" value={manualLocation} onChange={(event) => setManualLocation(event.target.value)} placeholder="Или опиши мястото: пътека, местност, път, ориентир…" />
            </div>

            <div className="rx-step">
              <div className="rx-step-head"><b>3</b><div><strong>Кой подава сигнала?</strong><span>Данните не са публични. Нужни са за обратна връзка и защита от злоупотреби.</span></div></div>
              <div className="rx-identity-note"><ShieldCheck size={19} /><span>Без платен SMS. Bansko.be профилът ще носи най-високо доверие, а гост сигналът ще се оценява по GPS, медия, история, съвпадащи репорти и обратна връзка.</span></div>
              <div className="rx-form-grid">
                <label><span><User size={16} /> Име и фамилия</span><input value={reporterName} onChange={(event) => setReporterName(event.target.value)} autoComplete="name" placeholder="Иван Петров" /></label>
                <label><span><Phone size={16} /> Телефон</span><input value={reporterPhone} onChange={(event) => setReporterPhone(event.target.value)} inputMode="tel" autoComplete="tel" placeholder="+359 88 123 4567" /></label>
              </div>
            </div>

            <div className="rx-media-row">
              <label className="rx-media"><Camera size={24} /><strong>Снимка / видео</strong><span>{mediaName || "По желание, но силно помага за оценката"}</span><input type="file" accept="image/*,video/*" capture="environment" onChange={(event) => setMediaName(event.target.files?.[0]?.name ?? "")} /></label>
              <label className="rx-details"><strong>Кратки детайли</strong><textarea value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Колко души? Какво виждаш? Има ли допълнителен риск?" /></label>
            </div>

            {formError && <div className="rx-error"><AlertTriangle size={18} />{formError}</div>}
            {submitted && <div className="rx-success"><CheckCircle2 size={20} /><div><strong>Демо сигналът е приет.</strong><span>В реалната версия тук стартира intelligent dispatch. Това публично демо не изпраща реални сигнали.</span><button onClick={() => setMode("room")}>Отвори Incident Room <ChevronRight size={16} /></button></div></div>}

            <div className={`rx-submit ${canSubmit ? "ready" : ""}`}>
              <div><span>{selected.severity === "critical" ? "КРИТИЧЕН СИГНАЛ" : "СИГНАЛ"}</span><strong>{selected.title}</strong><small>След изпращане подходящите responders се подреждат по умения, оборудване, наличност и разстояние.</small></div>
              <button onClick={submitDemo}><Siren size={23} /> ИЗПРАТИ SOS</button>
            </div>
          </div>
        </section>
      )}

      {mode === "responder" && (
        <section className="rx-grid-two">
          <div className="rx-panel rx-priority">
            <div className="rx-live"><span /> ПРИОРИТЕТЕН СИГНАЛ · ДЕМО</div>
            <div className="rx-priority-head"><div><Siren size={30} /></div><section><span>ТИ СИ СРЕД НАЙ-ПОДХОДЯЩИТЕ</span><h1>{selected.title}</h1><p><MapPin size={15} /> {locationText}</p></section></div>
            <div className="rx-safety"><AlertTriangle size={20} /><div><strong>Преди да тръгнеш</strong><span>{selected.safety}</span></div></div>
            <div className="rx-contact"><User size={18} /><div><strong>{reporterName || "Иван Петров"}</strong><span>Контактът се вижда само при активен случай.</span></div><a href={`tel:${reporterPhone || "+359881234567"}`}><Phone size={17} /> Обади се</a></div>
            {responderAction === "pending" && <div className="rx-actions"><button className="go" onClick={() => setResponderAction("accepted")}><CheckCircle2 /> Да, тръгвам</button><button className="no" onClick={() => setResponderAction("declined")}><AlertTriangle /> Не мога</button></div>}
            {responderAction === "accepted" && <div className="rx-accepted"><Route size={22} /><div><strong>Прието · пътуваш към мястото</strong><span>Incident Room вижда статуса ти. При пристигане маркирай веднага.</span></div><button onClick={() => setResponderAction("arrived")}>ПРИСТИГНАХ</button></div>}
            {responderAction === "arrived" && <div className="rx-accepted arrived"><CheckCircle2 size={22} /><div><strong>На място</strong><span>Координаторът вижда, че си пристигнал.</span></div><button onClick={() => setMode("room")}>Incident Room</button></div>}
            {responderAction === "declined" && <div className="rx-declined"><strong>Приоритетът е предаден към следващия responder.</strong><span>Сигналът остава видим като общ shout.</span></div>}
          </div>

          <div className="rx-panel">
            <div className="rx-title compact"><div><span>INTELLIGENT MATCHING</span><h2>Най-подходящи наблизо</h2></div></div>
            <div className="rx-matches">{matches.map((match, index) => <div key={match.id} className="rx-match"><b>{index + 1}</b><div><strong>{match.name}</strong><span>{match.role}</span><small>{[...match.skillMatches, ...match.equipmentMatches].slice(0, 3).join(" · ") || "обща помощ"}</small></div><aside><strong>{match.distanceKm.toFixed(1)} км</strong><span>score {match.score}</span></aside></div>)}</div>
          </div>
        </section>
      )}

      {mode === "room" && (
        <section className="rx-room">
          <div className="rx-panel rx-room-main">
            <div className="rx-room-header"><div><span>INCIDENT ROOM · ДЕМО</span><h1>{selected.title}</h1><p><MapPin size={16} /> {locationText}</p></div><div className="rx-room-status">АКТИВЕН</div></div>
            <div className="rx-room-metrics"><div><strong>{matches.filter((item) => item.availability === "available").length}</strong><span>готови responders</span></div><div><strong>{matches[0]?.distanceKm.toFixed(1) ?? "—"} км</strong><span>най-близък подходящ</span></div><div><strong>{responderAction === "arrived" ? "1" : "0"}</strong><span>на място</span></div></div>
            <div className="rx-room-map"><div className="rx-map-center"><Siren /></div>{matches.slice(0, 3).map((match, index) => <div key={match.id} className={`rx-map-responder p${index + 1}`}>{index + 1}</div>)}<span>Live responder positions · demo visualization</span></div>
            <div className="rx-timeline">
              <div><b /><section><strong>Сигналът е създаден</strong><span>GPS + контакт + тип инцидент са налични</span></section><time>00:00</time></div>
              <div><b /><section><strong>Intelligent matching завърши</strong><span>{matches.length} подходящи responders са подредени по приоритет</span></section><time>00:02</time></div>
              <div className={responderAction !== "pending" ? "done" : ""}><b /><section><strong>{responderAction === "declined" ? "Първият responder отказа — ескалация" : "Responder потвърждение"}</strong><span>{responderAction === "accepted" || responderAction === "arrived" ? "Responder е тръгнал към мястото" : "Очаква се потвърждение"}</span></section><time>00:20</time></div>
              <div className={responderAction === "arrived" ? "done" : ""}><b /><section><strong>Пристигане на място</strong><span>{responderAction === "arrived" ? "Първият responder е на място" : "Все още няма потвърдено пристигане"}</span></section><time>ETA</time></div>
            </div>
          </div>

          <aside className="rx-panel rx-room-side">
            <h2>Ресурси по случая</h2>
            {matches.slice(0, 3).map((match, index) => <div className="rx-resource" key={match.id}><span>{index + 1}</span><div><strong>{match.name}</strong><small>{match.role}</small><p><PackageCheck size={14} /> {match.equipment.slice(0, 3).join(", ")}</p></div><b>{index === 0 && responderAction === "arrived" ? "НА МЯСТО" : index === 0 && responderAction === "accepted" ? "ПЪТУВА" : "ГОТОВ"}</b></div>)}
            <div className="rx-room-note"><Phone size={18} /><div><strong>112 остава водещата спешна линия</strong><span>Incident Room подпомага локалната координация; не командва и не заменя официалните служби.</span></div></div>
          </aside>
        </section>
      )}

      {mode === "admin" && (
        <section className="rx-admin">
          <div className="rx-panel rx-admin-hero"><div><span>ГЛАВЕН ЦЕНТЪР</span><h1>Готовност на спасителската мрежа</h1><p>Главният акаунт създава responders, задава категории, умения и оборудване и одобрява кой има право да получава критични сигнали.</p></div><button><Users size={18} /> Създай responder</button></div>
          <div className="rx-admin-stats"><div><strong>24</strong><span>одобрени</span></div><div><strong>18</strong><span>налични сега</span></div><div><strong>7</strong><span>категории</span></div><div><strong>12</strong><span>ресурсни типа</span></div></div>
          <div className="rx-grid-two">
            <div className="rx-panel rx-admin-card"><h2>Оперативен статус</h2><div className="rx-status-list"><span><i className="green" /> На разположение</span><span><i className="amber" /> Ограничено</span><span><i /> Недостъпен</span></div><p>Responder статусът и последната му GPS позиция определят дали да бъде включен в приоритетния dispatch.</p></div>
            <div className="rx-panel rx-admin-card"><h2>Умения и оборудване</h2><div className="rx-tags"><span>ПСС</span><span>Медик</span><span>Първа помощ</span><span>4x4</span><span>Водно спасяване</span><span>Пожари</span><span>AED</span><span>Дрон</span><span>Термокамера</span><span>Въжета</span></div></div>
          </div>
        </section>
      )}

      <footer className="rx-footer"><span>SOS Bansko · public concept demo</span><span>Първо 112 · доброволците подпомагат, не заменят професионалните служби</span></footer>
    </main>
  );
}
