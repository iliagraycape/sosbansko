"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Ambulance,
  Camera,
  CarFront,
  CheckCircle2,
  ChevronRight,
  Flame,
  HeartPulse,
  LocateFixed,
  MapPin,
  MessageCircle,
  Mountain,
  Navigation,
  PackageCheck,
  Phone,
  Radio,
  Route,
  Send,
  ShieldCheck,
  Siren,
  User,
  UserRoundSearch,
  Users,
  Waves,
} from "lucide-react";
import { rankResponders, type IncidentProfile, type Responder } from "../lib/matching";

type Mode = "report" | "responder" | "room" | "admin";
type ResponderAction = "pending" | "accepted" | "declined" | "arrived";

type Incident = IncidentProfile & {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  safety: string;
};

type ChatMessage = {
  id: number;
  author: "reporter" | "responder" | "system";
  text: string;
};

const incidents: Incident[] = [
  { id: "self-danger", title: "Аз съм в опасност", subtitle: "Изгубен, ранен или блокиран", icon: <HeartPulse />, safety: "Остани на безопасно място, ако можеш. Обади се на 112 и пази батерията на телефона.", severity: "critical", requiredSkills: ["first-aid", "mountain"], usefulEquipment: ["medical-kit", "4x4", "rope"] },
  { id: "missing-child", title: "Изгубено дете", subtitle: "Дете е изчезнало или не може да бъде намерено", icon: <UserRoundSearch />, safety: "Запази последната известна позиция, час, дрехи и посока. Не организирай хаотично търсене.", severity: "critical", requiredSkills: ["search", "mountain"], usefulEquipment: ["drone", "thermal", "4x4", "radio"] },
  { id: "medical", title: "Човек в опасност", subtitle: "Ранен, неадекватен или в безсъзнание", icon: <Ambulance />, safety: "Не мести тежко пострадал човек, освен ако мястото не е непосредствено опасно.", severity: "critical", requiredSkills: ["medical", "first-aid"], usefulEquipment: ["aed", "medical-kit"] },
  { id: "mountain", title: "Изгубен / дезориентиран", subtitle: "Планина или безлюдно място", icon: <Mountain />, safety: "Не навлизай сам в опасен терен. Предай точната GPS позиция на 112/ПСС.", severity: "critical", requiredSkills: ["mountain", "search"], usefulEquipment: ["4x4", "rope", "drone", "thermal"] },
  { id: "crash", title: "Тежка катастрофа", subtitle: "Пострадали или блокирани хора", icon: <CarFront />, safety: "Обезопаси себе си първо. Не стой на пътното платно и не мести пострадали без нужда.", severity: "critical", requiredSkills: ["medical", "first-aid", "technical"], usefulEquipment: ["medical-kit", "aed", "extinguisher"] },
  { id: "fire", title: "Пожар / силен дим", subtitle: "Автомобил, къща, сграда или гора", icon: <Flame />, safety: "Не влизай в горяща сграда и не приближавай автомобил с риск от взрив. Изчакай пожарната на безопасно разстояние.", severity: "critical", requiredSkills: ["fire", "first-aid"], usefulEquipment: ["extinguisher", "medical-kit", "4x4"] },
  { id: "water", title: "Опасност във вода", subtitle: "Река, езеро или риск от удавяне", icon: <Waves />, safety: "Не влизай във вода без подготовка. Подай плаващ предмет или въже от безопасно място.", severity: "critical", requiredSkills: ["water-rescue", "medical"], usefulEquipment: ["rope", "medical-kit"] },
  { id: "vehicle", title: "Закъсал автомобил", subtitle: "Помощ на труднодостъпно място", icon: <Navigation />, safety: "Ако има риск за живота, студ, травма или пожар, използвай критичен SOS и се обади на 112.", severity: "assistance", requiredSkills: ["4x4"], usefulEquipment: ["4x4", "tow", "tools"] },
];

const responders: Responder[] = [
  { id: "r1", name: "Иван П.", role: "Планински спасител", latitude: 41.8403, longitude: 23.4869, availability: "available", verified: true, skills: ["mountain", "search", "rope", "first-aid"], equipment: ["rope", "radio", "medical-kit", "4x4"], lastSeenAt: Date.now() - 60000 },
  { id: "r2", name: "Мария К.", role: "Медицинско лице", latitude: 41.8359, longitude: 23.4918, availability: "available", verified: true, skills: ["medical", "first-aid"], equipment: ["aed", "medical-kit"], lastSeenAt: Date.now() - 90000 },
  { id: "r3", name: "Георги Т.", role: "Доброволец 4x4", latitude: 41.847, longitude: 23.4932, availability: "available", verified: true, skills: ["4x4", "search", "technical"], equipment: ["4x4", "tow", "tools", "extinguisher"], lastSeenAt: Date.now() - 180000 },
  { id: "r4", name: "Николай С.", role: "Пожарна подготовка", latitude: 41.8298, longitude: 23.482, availability: "limited", verified: true, skills: ["fire", "first-aid"], equipment: ["extinguisher", "medical-kit"], lastSeenAt: Date.now() - 240000 },
];

const fallback = { latitude: 41.8384, longitude: 23.4886 };
const quickQuestions = ["Къде точно си в момента?", "Има ли ранени хора?", "Има ли огън, вода, газ или друга опасност?", "Остани спокоен. Тръгнал съм към теб."];

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
  const [error, setError] = useState("");
  const [responderAction, setResponderAction] = useState<ResponderAction>("pending");
  const [chatOpen, setChatOpen] = useState(false);
  const [phoneUnlocked, setPhoneUnlocked] = useState(false);
  const [chatDraft, setChatDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, author: "system", text: "Чатът е достъпен само за подателя и приелия responder по активния случай." },
    { id: 2, author: "reporter", text: "Виждам пътеката, но не съм сигурен къде точно се намирам." },
  ]);

  const selected = useMemo(() => incidents.find(item => item.id === selectedId) ?? incidents[0], [selectedId]);
  const point = coordinates ?? fallback;
  const matches = useMemo(() => rankResponders(responders, selected, point.latitude, point.longitude), [selected, point.latitude, point.longitude]);
  const identityReady = reporterName.trim().length >= 3 && reporterPhone.replace(/\D/g, "").length >= 8;
  const locationReady = Boolean(coordinates) || manualLocation.trim().length >= 5;

  function captureLocation() {
    if (!navigator.geolocation) {
      setLocationState("denied");
      return;
    }
    setLocationState("loading");
    navigator.geolocation.getCurrentPosition(
      position => {
        setCoordinates({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy });
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
      setError("Въведи име и телефон за обратна връзка. Това помага срещу фалшиви сигнали и позволява бързо уточнение.");
      return;
    }
    if (!locationReady) {
      setError("Добави GPS локация или опиши мястото ръчно.");
      return;
    }
    setError("");
    setSubmitted(true);
  }

  function sendMessage(text?: string) {
    const value = (text ?? chatDraft).trim();
    if (!value || responderAction === "pending" || responderAction === "declined") return;
    setMessages(current => [...current, { id: Date.now(), author: "responder", text: value }]);
    setChatDraft("");
  }

  function acceptIncident() {
    setResponderAction("accepted");
    setMessages(current => [...current, { id: Date.now(), author: "system", text: "Responder прие сигнала и е тръгнал към мястото." }]);
  }

  const locationText = coordinates
    ? `${coordinates.latitude.toFixed(5)}, ${coordinates.longitude.toFixed(5)}${coordinates.accuracy ? ` · ±${Math.round(coordinates.accuracy)} м` : ""}`
    : manualLocation || "Демо локация около Банско";
  const phoneValue = reporterPhone || "+359 88 123 4567";

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
            <span><HeartPulse size={30} /></span><div><strong>АЗ СЪМ В ОПАСНОСТ</strong><small>Ако самият ти си изгубен, ранен или блокиран</small></div><ChevronRight />
          </button>

          <div className="rx-panel rx-main">
            <div className="rx-title"><div><span>1 · СИТУАЦИЯ</span><h1>Какво се случва?</h1><p>Избери най-близкия сценарий. При животозастрашаващ случай не губи време в дълъг текст.</p></div><b>цел: &lt;30 сек.</b></div>
            <div className="rx-incidents">{incidents.filter(item => item.id !== "self-danger").map(item => <button key={item.id} className={selectedId === item.id ? "active" : ""} onClick={() => setSelectedId(item.id)}><span>{item.icon}</span><div><strong>{item.title}</strong><small>{item.subtitle}</small></div><CheckCircle2 size={18} /></button>)}</div>
            <div className="rx-safety"><AlertTriangle size={20} /><div><strong>Безопасност за този сценарий</strong><span>{selected.safety}</span></div></div>

            <div className="rx-step">
              <div className="rx-step-head"><b>2</b><div><strong>Точна локация</strong><span>GPS е основният сигнал за намиране на най-близката подходяща помощ.</span></div></div>
              <button className={`rx-location ${locationState}`} onClick={captureLocation}><LocateFixed size={22} /><div><strong>{locationState === "loading" ? "Прихващаме GPS…" : coordinates ? "GPS локацията е прихваната" : "Използвай текущата ми локация"}</strong><span>{coordinates ? locationText : locationState === "denied" ? "GPS не е достъпен — опиши мястото ръчно." : "Ще поискаме разрешение от телефона."}</span></div><ChevronRight /></button>
              <input className="rx-input" value={manualLocation} onChange={event => setManualLocation(event.target.value)} placeholder="Или опиши мястото: пътека, местност, път, ориентир…" />
            </div>

            <div className="rx-step">
              <div className="rx-step-head"><b>3</b><div><strong>Кой подава сигнала?</strong><span>Данните не са публични. Нужни са за обратна връзка и защита от злоупотреби.</span></div></div>
              <div className="rx-identity-note"><ShieldCheck size={19} /><span>Без платен SMS. Bansko.be профилът ще носи най-високо доверие, а гост сигналът ще се оценява по GPS, медия, история, съвпадащи репорти и обратна връзка.</span></div>
              <div className="rx-form-grid"><label><span><User size={16} /> Име и фамилия</span><input value={reporterName} onChange={event => setReporterName(event.target.value)} autoComplete="name" placeholder="Иван Петров" /></label><label><span><Phone size={16} /> Телефон</span><input value={reporterPhone} onChange={event => setReporterPhone(event.target.value)} inputMode="tel" autoComplete="tel" placeholder="+359 88 123 4567" /></label></div>
            </div>

            <div className="rx-media-row"><label className="rx-media"><Camera size={24} /><strong>Снимка / видео</strong><span>{mediaName || "По желание, но силно помага за оценката"}</span><input type="file" accept="image/*,video/*" capture="environment" onChange={event => setMediaName(event.target.files?.[0]?.name ?? "")} /></label><label className="rx-details"><strong>Кратки детайли</strong><textarea value={details} onChange={event => setDetails(event.target.value)} placeholder="Колко души? Какво виждаш? Има ли допълнителен риск?" /></label></div>
            {error && <div className="rx-error"><AlertTriangle size={18} />{error}</div>}
            {submitted && <div className="rx-success"><CheckCircle2 size={20} /><div><strong>Демо сигналът е приет.</strong><span>В реалната версия тук стартира intelligent dispatch. Публичното демо не изпраща реални сигнали.</span><button onClick={() => setMode("room")}>Отвори Incident Room <ChevronRight size={16} /></button></div></div>}
            <div className={`rx-submit ${identityReady && locationReady ? "ready" : ""}`}><div><span>{selected.severity === "critical" ? "КРИТИЧЕН СИГНАЛ" : "СИГНАЛ"}</span><strong>{selected.title}</strong><small>Responders се подреждат по умения, оборудване, наличност и разстояние.</small></div><button onClick={submitDemo}><Siren size={23} /> ИЗПРАТИ SOS</button></div>
          </div>
        </section>
      )}

      {mode === "responder" && (
        <section className="rx-grid-two">
          <div className="rx-panel rx-priority">
            <div className="rx-live"><span /> ПРИОРИТЕТЕН СИГНАЛ · ДЕМО</div>
            <div className="rx-priority-head"><div><Siren size={30} /></div><section><span>ТИ СИ СРЕД НАЙ-ПОДХОДЯЩИТЕ</span><h1>{selected.title}</h1><p><MapPin size={15} /> {locationText}</p></section></div>
            <div className="rx-safety"><AlertTriangle size={20} /><div><strong>Преди да тръгнеш</strong><span>{selected.safety}</span></div></div>
            <div className="rx-contact"><User size={18} /><div><strong>{reporterName || "Иван Петров"}</strong><span>{responderAction === "accepted" || responderAction === "arrived" ? "Приел си сигнала — можеш да поискаш контакт или да отвориш чат." : "Телефонът и чатът се отключват само след приемане на сигнала."}</span></div></div>

            {responderAction === "pending" && <div className="rx-actions"><button className="go" onClick={acceptIncident}><CheckCircle2 /> Да, тръгвам</button><button className="no" onClick={() => setResponderAction("declined")}><AlertTriangle /> Не мога</button></div>}

            {(responderAction === "accepted" || responderAction === "arrived") && <>
              <div className="rx-accepted"><Route size={22} /><div><strong>{responderAction === "arrived" ? "На място" : "Прието · пътуваш към мястото"}</strong><span>Incident Room вижда статуса ти.</span></div>{responderAction === "accepted" ? <button onClick={() => setResponderAction("arrived")}>ПРИСТИГНАХ</button> : <button onClick={() => setMode("room")}>Incident Room</button>}</div>
              <div className="rx-communication-actions">
                <button onClick={() => setChatOpen(current => !current)}><MessageCircle size={18} /> {chatOpen ? "Затвори чата" : "Отвори чат"}</button>
                <button onClick={() => setPhoneUnlocked(true)}><Phone size={18} /> {phoneUnlocked ? "Телефонът е достъпен" : "Поискай телефон"}</button>
              </div>
              {phoneUnlocked && <div className="rx-phone-reveal"><ShieldCheck size={18} /><div><strong>Телефон на подателя</strong><span>{phoneValue}</span><small>Достъпен само за приелия responder по активния случай.</small></div><a href={`tel:${phoneValue}`}><Phone size={17} /> Обади се</a></div>}
              {chatOpen && <div className="rx-chat">
                <div className="rx-chat-head"><MessageCircle size={18} /><div><strong>Чат с подателя</strong><span>За уточняване и успокояване до пристигането</span></div></div>
                <div className="rx-chat-messages">{messages.map(message => <div key={message.id} className={`rx-chat-message ${message.author}`}><b>{message.author === "reporter" ? reporterName || "Подател" : message.author === "responder" ? "Спасител" : "Система"}</b><span>{message.text}</span></div>)}</div>
                <div className="rx-quick-questions">{quickQuestions.map(question => <button key={question} onClick={() => sendMessage(question)}>{question}</button>)}</div>
                <div className="rx-chat-compose"><input value={chatDraft} onChange={event => setChatDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter") sendMessage(); }} placeholder="Напиши кратък въпрос или инструкция…" /><button onClick={() => sendMessage()} aria-label="Изпрати"><Send size={18} /></button></div>
              </div>}
            </>}

            {responderAction === "declined" && <div className="rx-declined"><strong>Приоритетът е предаден към следващия responder.</strong><span>Сигналът остава видим като общ shout, но контактът остава заключен.</span></div>}
          </div>

          <div className="rx-panel rx-match-panel"><div className="rx-title compact"><div><span>INTELLIGENT MATCHING</span><h2>Най-подходящи наблизо</h2></div></div><div className="rx-matches">{matches.map((match, index) => <div key={match.id} className="rx-match"><b>{index + 1}</b><div><strong>{match.name}</strong><span>{match.role}</span><small>{[...match.skillMatches, ...match.equipmentMatches].slice(0, 3).join(" · ") || "обща помощ"}</small></div><aside><strong>{match.distanceKm.toFixed(1)} км</strong><span>score {match.score}</span></aside></div>)}</div></div>
        </section>
      )}

      {mode === "room" && (
        <section className="rx-room">
          <div className="rx-panel rx-room-main">
            <div className="rx-room-header"><div><span>INCIDENT ROOM · ДЕМО</span><h1>{selected.title}</h1><p><MapPin size={16} /> {locationText}</p></div><div className="rx-room-status">АКТИВЕН</div></div>
            <div className="rx-room-metrics"><div><strong>{matches.filter(item => item.availability === "available").length}</strong><span>готови responders</span></div><div><strong>{matches[0]?.distanceKm.toFixed(1) ?? "—"} км</strong><span>най-близък подходящ</span></div><div><strong>{responderAction === "arrived" ? "1" : "0"}</strong><span>на място</span></div></div>
            <div className="rx-room-map"><div className="rx-map-center"><Siren /></div>{matches.slice(0, 3).map((match, index) => <div key={match.id} className={`rx-map-responder p${index + 1}`}>{index + 1}</div>)}<span>Live responder positions · demo visualization</span></div>
            <div className="rx-timeline"><div><b /><section><strong>Сигналът е създаден</strong><span>GPS + контакт + тип инцидент са налични</span></section><time>00:00</time></div><div><b /><section><strong>Intelligent matching завърши</strong><span>{matches.length} responders са подредени по приоритет</span></section><time>00:02</time></div><div className={responderAction !== "pending" ? "done" : ""}><b /><section><strong>Responder потвърждение</strong><span>{responderAction === "accepted" || responderAction === "arrived" ? "Responder е тръгнал към мястото" : responderAction === "declined" ? "Първият отказа — ескалация" : "Очаква се потвърждение"}</span></section><time>00:20</time></div><div className={responderAction === "arrived" ? "done" : ""}><b /><section><strong>Пристигане</strong><span>{responderAction === "arrived" ? "Първият responder е на място" : "Все още няма потвърдено пристигане"}</span></section><time>ETA</time></div></div>
          </div>
          <aside className="rx-panel rx-room-side"><h2>Ресурси по случая</h2>{matches.slice(0, 3).map((match, index) => <div className="rx-resource" key={match.id}><span>{index + 1}</span><div><strong>{match.name}</strong><small>{match.role}</small><p><PackageCheck size={14} /> {match.equipment.slice(0, 3).join(", ")}</p></div><b>{index === 0 && responderAction === "arrived" ? "НА МЯСТО" : index === 0 && responderAction === "accepted" ? "ПЪТУВА" : "ГОТОВ"}</b></div>)}<div className="rx-room-note"><Phone size={18} /><div><strong>112 остава водещата спешна линия</strong><span>Incident Room подпомага локалната координация; не заменя официалните служби.</span></div></div></aside>
        </section>
      )}

      {mode === "admin" && (
        <section className="rx-admin"><div className="rx-panel rx-admin-hero"><div><span>ГЛАВЕН ЦЕНТЪР</span><h1>Готовност на спасителската мрежа</h1><p>Главният акаунт създава responders, задава категории, умения и оборудване и одобрява кой има право да получава критични сигнали.</p></div><button><Users size={18} /> Създай responder</button></div><div className="rx-admin-stats"><div><strong>24</strong><span>одобрени</span></div><div><strong>18</strong><span>налични сега</span></div><div><strong>7</strong><span>категории</span></div><div><strong>12</strong><span>ресурсни типа</span></div></div><div className="rx-grid-two"><div className="rx-panel rx-admin-card"><h2>Оперативен статус</h2><div className="rx-status-list"><span><i className="green" /> На разположение</span><span><i className="amber" /> Ограничено</span><span><i /> Недостъпен</span></div><p>Статусът и последната GPS позиция определят дали responder да бъде включен в приоритетния dispatch.</p></div><div className="rx-panel rx-admin-card"><h2>Умения и оборудване</h2><div className="rx-tags"><span>ПСС</span><span>Медик</span><span>Първа помощ</span><span>4x4</span><span>Водно спасяване</span><span>Пожари</span><span>AED</span><span>Дрон</span><span>Термокамера</span><span>Въжета</span></div></div></div></section>
      )}

      <footer className="rx-footer"><span>SOS Bansko · public concept demo</span><span>Първо 112 · доброволците подпомагат, не заменят професионалните служби</span></footer>
    </main>
  );
}
