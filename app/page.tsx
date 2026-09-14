"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Ambulance,
  Baby,
  Camera,
  CarFront,
  CheckCircle2,
  ChevronRight,
  Flame,
  Footprints,
  LocateFixed,
  MapPin,
  Mountain,
  Navigation,
  Phone,
  Radio,
  ShieldCheck,
  Siren,
  User,
  Users,
  Waves,
  Wind,
} from "lucide-react";

type Incident = {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  tone: "critical" | "urgent" | "warning";
};

const incidentTypes: Incident[] = [
  { id: "crash", title: "Тежка катастрофа", subtitle: "Пострадали или блокирани хора", icon: <CarFront />, tone: "critical" },
  { id: "medical", title: "Човек в непосредствена опасност", subtitle: "Нужда от незабавна първа помощ", icon: <Ambulance />, tone: "critical" },
  { id: "missing-child", title: "Изгубено дете", subtitle: "Дете е изчезнало или не може да бъде открито", icon: <Baby />, tone: "critical" },
  { id: "disoriented", title: "Изгубен / дезориентиран човек", subtitle: "Лута се, неадекватен е или е сам на безлюдно място", icon: <Navigation />, tone: "critical" },
  { id: "mountain", title: "Изгубен в планината", subtitle: "Изчезнал, дезориентиран или без връзка", icon: <Mountain />, tone: "urgent" },
  { id: "fall", title: "Падане / труден терен", subtitle: "Скала, дере, стръмен склон", icon: <Footprints />, tone: "critical" },
  { id: "water", title: "Опасност във вода", subtitle: "Река, езеро или удавяне", icon: <Waves />, tone: "critical" },
  { id: "vehicle-fire", title: "Горящ автомобил", subtitle: "Автомобилът гори в момента", icon: <Flame />, tone: "critical" },
  { id: "vehicle-smoke", title: "Дим от автомобил", subtitle: "Излиза пушек, има миризма или риск от запалване", icon: <CarFront />, tone: "critical" },
  { id: "building-fire", title: "Пожар в къща / сграда", subtitle: "Огън или силен дим от обитаема сграда", icon: <Flame />, tone: "critical" },
  { id: "wildfire", title: "Горски / полски пожар", subtitle: "Огън в гора, поле или труднодостъпен терен", icon: <Flame />, tone: "critical" },
  { id: "gas", title: "Газ / опасно изтичане", subtitle: "Миризма, теч или съмнение за опасност", icon: <Wind />, tone: "urgent" },
  { id: "vehicle", title: "Закъсал автомобил", subtitle: "Нужда от помощ на труднодостъпно място", icon: <CarFront />, tone: "warning" },
];

const nearbyResponders = [
  { name: "Иван П.", role: "Планински спасител", distance: "1.2 км", eta: "4 мин", status: "available" },
  { name: "Мария К.", role: "Медицинско лице", distance: "2.0 км", eta: "6 мин", status: "available" },
  { name: "Георги Т.", role: "Доброволец 4x4", distance: "2.8 км", eta: "8 мин", status: "busy" },
];

export default function Home() {
  const [mode, setMode] = useState<"report" | "responder" | "admin">("report");
  const [selected, setSelected] = useState("crash");
  const [locationState, setLocationState] = useState<"idle" | "loading" | "ready" | "denied">("idle");
  const [locationLabel, setLocationLabel] = useState("Локацията още не е прихваната");
  const [manualLocation, setManualLocation] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [callbackConsent, setCallbackConsent] = useState(true);

  const selectedIncident = useMemo(() => incidentTypes.find((item) => item.id === selected) ?? incidentTypes[0], [selected]);
  const identityReady = reporterName.trim().length >= 3 && reporterPhone.replace(/\D/g, "").length >= 8;
  const locationReady = locationState === "ready" || manualLocation.trim().length >= 5;
  const canSubmit = identityReady && locationReady && callbackConsent;

  function captureLocation() {
    if (!navigator.geolocation) {
      setLocationState("denied");
      setLocationLabel("Това устройство не поддържа автоматична локация");
      return;
    }
    setLocationState("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(5);
        const lng = position.coords.longitude.toFixed(5);
        setLocationLabel(`${lat}, ${lng} · точност ~${Math.round(position.coords.accuracy)} м`);
        setLocationState("ready");
      },
      () => {
        setLocationState("denied");
        setLocationLabel("Не успяхме да вземем GPS. Опиши мястото ръчно отдолу.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
    );
  }

  function demoSubmit() {
    if (!canSubmit) return;
    alert("Демо режим: сигналът не е изпратен. След Convex интеграцията тук ще се създава реален инцидент и ще се известяват подходящите спасители.");
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark"><Siren size={24} /></div>
          <div>
            <div className="brand">SOS BANSKO</div>
            <div className="brand-sub">Бърза реакция от хора наблизо</div>
          </div>
        </div>
        <div className="system-status"><span /> Системата е активна</div>
      </header>

      <section className="emergency-banner emergency-banner-strong">
        <AlertTriangle size={24} />
        <div>
          <strong className="call-112-title">ПЪРВО СЕ ОБАДЕТЕ НА 112!</strong>
          <span>SOS Bansko не заменя 112. Целта е да подпомогне спешните служби, като активира проверени хора наблизо в първите критични минути до пристигането на професионалните екипи.</span>
        </div>
        <a href="tel:112">ОБАДИ СЕ НА 112</a>
      </section>

      <nav className="mode-tabs" aria-label="Режим на приложението">
        <button className={mode === "report" ? "active" : ""} onClick={() => setMode("report")}><Radio size={18} /> Подай сигнал</button>
        <button className={mode === "responder" ? "active" : ""} onClick={() => setMode("responder")}><ShieldCheck size={18} /> Спасител</button>
        <button className={mode === "admin" ? "active" : ""} onClick={() => setMode("admin")}><Users size={18} /> Център</button>
      </nav>

      {mode === "report" && (
        <div className="report-layout">
          <section className="panel main-panel">
            <div className="life-saving-note">
              <Siren size={22} />
              <div><strong>Тук подаваме сигнал, когато всяка минута има значение.</strong><span>Изгубено дете, дезориентиран човек в планината, тежка катастрофа, пожар, удавяне или друга ситуация с реална опасност за човешки живот.</span></div>
            </div>

            <div className="section-heading">
              <div><span className="eyebrow">СТЪПКА 1</span><h1>Какво се е случило?</h1><p>Избери най-близкия тип сигнал. Не губи време в дълго описание.</p></div>
              <div className="speed-pill">~30 сек.</div>
            </div>

            <div className="incident-grid">
              {incidentTypes.map((item) => (
                <button key={item.id} className={`incident-card ${selected === item.id ? "selected" : ""} ${item.tone}`} onClick={() => setSelected(item.id)}>
                  <span className="incident-icon">{item.icon}</span>
                  <span><strong>{item.title}</strong><small>{item.subtitle}</small></span>
                  <CheckCircle2 className="check" size={20} />
                </button>
              ))}
            </div>

            <div className="step-block">
              <div className="step-title"><span>2</span><div><h2>Къде се намира инцидентът?</h2><p>Точната локация позволява да извикаме най-близките подходящи хора.</p></div></div>
              <button className={`location-button ${locationState}`} onClick={captureLocation}>
                <LocateFixed size={24} />
                <span><strong>{locationState === "loading" ? "Прихващаме локацията…" : "Използвай текущата ми локация"}</strong><small>{locationLabel}</small></span>
                <ChevronRight />
              </button>
              <label className="manual-location-field">
                <span>Ако GPS не работи, опиши мястото</span>
                <input value={manualLocation} onChange={(e) => setManualLocation(e.target.value)} placeholder="Напр. пътя за хижа Вихрен, след втория завой..." />
              </label>
            </div>

            <div className="step-block identity-block">
              <div className="step-title"><span>3</span><div><h2>Кой подава сигнала?</h2><p>Името и телефонът са задължителни, за да може спасител или оператор да се свърже с теб веднага.</p></div></div>

              <div className="privacy-explanation">
                <ShieldCheck size={22} />
                <div><strong>Защо искаме име и телефон?</strong><span>За да ограничим фалшивите сигнали и да можем бързо да потвърдим важни детайли. Данните не са публични и се използват само за координация на сигнала и защита от злоупотреби.</span></div>
              </div>

              <div className="identity-grid">
                <label>
                  <span><User size={16} /> Име и фамилия</span>
                  <input value={reporterName} onChange={(e) => setReporterName(e.target.value)} autoComplete="name" placeholder="Напр. Иван Петров" />
                </label>
                <label>
                  <span><Phone size={16} /> Телефон за връзка</span>
                  <input value={reporterPhone} onChange={(e) => setReporterPhone(e.target.value)} autoComplete="tel" inputMode="tel" placeholder="Напр. +359 88 123 4567" />
                </label>
              </div>

              <div className="free-trust-row">
                <ShieldCheck size={18} />
                <div><strong>Без платена SMS верификация.</strong><span>При вход с Bansko.be профил самоличността ще бъде разпозната автоматично. При гост сигналът не се блокира — системата оценява GPS, снимки, история, дублирани сигнали и може да поиска обратно обаждане.</span></div>
              </div>

              <label className="callback-consent">
                <input type="checkbox" checked={callbackConsent} onChange={(e) => setCallbackConsent(e.target.checked)} />
                <span>Потвърждавам, че това е телефон, на който спасител или оператор може да ми се обади за уточнение.</span>
              </label>
            </div>

            <div className="step-block two-columns">
              <label className="upload-card">
                <Camera size={28} />
                <strong>Добави снимка или видео</strong>
                <span>{photoName || "Помага за бърза оценка и намалява риска от фалшив сигнал"}</span>
                <input type="file" accept="image/*,video/*" capture="environment" onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? "")} />
              </label>
              <div className="details-card">
                <label htmlFor="details">Кратки детайли <span>по желание</span></label>
                <textarea id="details" placeholder="Колко души са засегнати? Има ли непосредствена опасност? Какво виждаш?" />
              </div>
            </div>

            <div className={`submit-zone ${canSubmit ? "ready" : "not-ready"}`}>
              <div>
                <span className="submit-label">{canSubmit ? "ГОТОВ СИ ДА ИЗПРАТИШ" : "НУЖНИ СА ИМЕ, ТЕЛЕФОН И ЛОКАЦИЯ"}</span>
                <strong>{selectedIncident.title}</strong>
                <small>Критичният сигнал няма да чака SMS код. Той ще бъде оценен и насочен към най-близките подходящи спасители.</small>
              </div>
              <button className="sos-button" disabled={!canSubmit} onClick={demoSubmit}><Siren size={24} /> ИЗПРАТИ SOS СИГНАЛ</button>
            </div>
          </section>

          <aside className="panel side-panel">
            <div className="trust-card"><ShieldCheck size={28} /><div><strong>Проверена мрежа</strong><span>Сигналите се насочват към одобрени доброволци и спасители според умения, дистанция и наличност.</span></div></div>
            <div className="mini-map">
              <div className="map-grid" />
              <div className="map-pin incident"><Siren size={17} /></div>
              <div className="map-pin volunteer v1">1</div><div className="map-pin volunteer v2">2</div><div className="map-pin volunteer v3">3</div>
              <div className="radius r1" /><div className="radius r2" />
              <div className="map-caption"><MapPin size={16} /> Приоритет по близост</div>
            </div>
            <div className="response-stats"><div><strong>3</strong><span>спасители наблизо</span></div><div><strong>4–8</strong><span>мин. очаквана реакция</span></div></div>
            <div className="anonymous-note"><strong>Без акаунт?</strong><span>Можеш да подадеш сигнал като гост с име и телефон за връзка. След това можеш да създадеш Bansko.be профил за по-високо доверие и по-бързо подаване занапред.</span></div>
          </aside>
        </div>
      )}

      {mode === "responder" && (
        <section className="responder-layout">
          <div className="panel live-incident">
            <div className="live-head"><div><span className="pulse-dot" /> НОВ ПРИОРИТЕТЕН СИГНАЛ</div><span>преди 32 сек.</span></div>
            <div className="responder-alert">
              <div className="big-alert-icon"><CarFront size={34} /></div>
              <div><span className="priority-tag">ТИ СИ СРЕД НАЙ-БЛИЗКИТЕ</span><h1>Тежка катастрофа</h1><p>Път II-19, посока Добринище · приблизително 1.2 км от теб</p></div>
            </div>
            <div className="reporter-contact-preview"><User size={18} /><div><strong>Подател: Иван Петров</strong><span>Телефонът е достъпен само за координация на активния сигнал.</span></div><a href="tel:+359881234567"><Phone size={17} /> Обади се</a></div>
            <div className="critical-message">Първите минути са критични. Потвърди веднага дали можеш да реагираш.</div>
            <div className="response-actions"><button className="go"><CheckCircle2 /> Да, тръгвам <small>ETA ~4 мин.</small></button><button className="cant"><AlertTriangle /> Не, няма да успея</button></div>
            <button className="forward-button">Не можеш да стигнеш? Препрати приоритета към следващия най-близък спасител <ChevronRight size={18} /></button>
          </div>
          <div className="panel roster-panel"><div className="section-heading compact"><div><span className="eyebrow">НАБЛИЗО</span><h2>Екип за реакция</h2></div></div>{nearbyResponders.map((r, i) => <div className="responder-row" key={r.name}><span className={`avatar a${i+1}`}>{r.name.charAt(0)}</span><div><strong>{r.name}</strong><small>{r.role}</small></div><div className="distance"><strong>{r.distance}</strong><small>{r.eta}</small></div><span className={`status-dot ${r.status}`} /></div>)}</div>
        </section>
      )}

      {mode === "admin" && (
        <section className="admin-grid">
          <div className="panel admin-hero"><div><span className="eyebrow">ГЛАВЕН ЦЕНТЪР</span><h1>Оперативен контрол</h1><p>Един главен акаунт управлява спасителите, ролите, категориите и достъпа. Публична саморегистрация за спасители няма.</p></div><button><Users size={18} /> Създай спасителски акаунт</button></div>
          <div className="metric-card"><strong>24</strong><span>одобрени спасители</span><small>18 активни днес</small></div>
          <div className="metric-card"><strong>7</strong><span>специализирани категории</span><small>медици, ПСС, 4x4, вода…</small></div>
          <div className="metric-card"><strong>0</strong><span>активни сигнали</span><small>районът е спокоен</small></div>
          <div className="panel pipeline-card"><h2>Планиран сигнален pipeline</h2><div className="pipeline"><span>Сигнал</span><ChevronRight/><span>Trust score</span><ChevronRight/><span>Най-близки</span><ChevronRight/><span>Push</span><ChevronRight/><span>Telegram fallback</span></div></div>
          <div className="panel categories-card"><h2>Категории спасители</h2><div className="category-chips"><span>Планинско спасяване</span><span>Медицинска помощ</span><span>4x4 / офроуд</span><span>Водно спасяване</span><span>Пожари</span><span>Техническа помощ</span><span>Общи доброволци</span></div></div>
        </section>
      )}

      <footer><span>SOS Bansko · обществена система за бърза реакция</span><span>Първо 112 · SOS Bansko подпомага, не заменя спешните служби</span></footer>
    </main>
  );
}
