import { useEffect, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword, GoogleAuthProvider, RecaptchaVerifier, sendPasswordResetEmail,
  sendSignInLinkToEmail, signInWithEmailAndPassword, signInWithPhoneNumber, signInWithPopup,
  signInWithRedirect, signOut, updateProfile
} from "firebase/auth";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase.js";
import { REWARD_TARGET } from "../../config.js";
import { ensureProfile } from "../hooks.js";
import { storage, tsMillis } from "../../lib/utils.js";
import { useSite } from "../context.js";
import { IconClose, IconGoogle } from "../icons.jsx";

function errorKey(err) {
  const code = (err && err.code) || "";
  if (/user-not-found|wrong-password|invalid-credential|invalid-login/.test(code)) return "authInvalid";
  if (/email-already-in-use/.test(code)) return "authExists";
  if (/weak-password/.test(code)) return "authWeak";
  if (/invalid-email/.test(code)) return "authBadEmail";
  return "authGeneric";
}

export default function AuthModal() {
  const { t, lang, kr, closeAuth, customer } = useSite();
  const { user, orders, pendingReward, setPendingReward, setUser, refresh } = customer;
  const [tab, setTab] = useState("login");
  const [msg, setMsg] = useState({ key: "", error: false });
  const [form, setForm] = useState({ loginEmail: "", loginPassword: "", name: "", email: "", password: "", phone: "", code: "", linkEmail: "" });
  const [phoneStep, setPhoneStep] = useState("number");
  const confirmRef = useRef(null);
  const recaptchaRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => { closeRef.current && closeRef.current.focus(); if (user) refresh(user.uid); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const say = (key, error = false) => setMsg({ key, error });
  const done = () => { say(""); closeAuth(); };

  const login = (e) => {
    e.preventDefault();
    if (!form.loginEmail || !form.loginPassword) return say("authMissing", true);
    signInWithEmailAndPassword(auth, form.loginEmail.trim(), form.loginPassword).then(done).catch((err) => say(errorKey(err), true));
  };
  const register = async (e) => {
    e.preventDefault();
    const name = form.name.trim(), email = form.email.trim();
    if (!name || !email || !form.password) return say("authMissing", true);
    if (form.password.length < 6) return say("authWeak", true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, form.password);
      await updateProfile(cred.user, { displayName: name });
      const profile = await ensureProfile(cred.user, name);
      if (profile.name !== name) updateDoc(doc(db, "users", cred.user.uid), { name }).catch(() => {});
      setUser({ uid: cred.user.uid, email, ...profile, name });
      done();
    } catch (err) { say(errorKey(err), true); }
  };
  const reset = () => {
    if (!form.loginEmail) return say("resetNeedEmail", true);
    sendPasswordResetEmail(auth, form.loginEmail.trim()).then(() => say("resetSent")).catch((err) => say(errorKey(err), true));
  };
  const google = () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    signInWithPopup(auth, provider).then(done).catch((err) => {
      const code = (err && err.code) || "";
      if (/popup-closed|cancelled-popup/.test(code)) return;
      if (/popup-blocked|operation-not-supported/.test(code)) { signInWithRedirect(auth, provider); return; }
      say(errorKey(err), true);
    });
  };
  const sendCode = async () => {
    let phone = form.phone.replace(/\s+/g, "");
    if (!phone) return say("authMissing", true);
    if (phone.startsWith("0")) phone = `+46${phone.slice(1)}`;
    try {
      if (!recaptchaRef.current) recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
      confirmRef.current = await signInWithPhoneNumber(auth, phone, recaptchaRef.current);
      setPhoneStep("code");
      say("phoneSent");
    } catch {
      say("phoneError", true);
      if (recaptchaRef.current) { try { recaptchaRef.current.clear(); } catch { /* ignore */ } recaptchaRef.current = null; }
    }
  };
  const verifyCode = () => {
    if (!form.code || !confirmRef.current) return say("authMissing", true);
    confirmRef.current.confirm(form.code.trim()).then(() => { setPhoneStep("number"); done(); }).catch(() => say("phoneInvalidCode", true));
  };
  const sendLink = () => {
    const email = form.linkEmail.trim();
    if (!email) return say("authMissing", true);
    sendSignInLinkToEmail(auth, email, { url: location.origin + location.pathname, handleCodeInApp: true })
      .then(() => { storage("emailForSignIn", email); say("emailLinkSent"); })
      .catch(() => say("emailLinkError", true));
  };
  const redeem = async () => {
    if (!user || (Number(user.points) || 0) < REWARD_TARGET || pendingReward) return;
    try {
      await addDoc(collection(db, "rewards"), {
        uid: user.uid, name: user.name || "", email: user.email || "",
        points: REWARD_TARGET, status: "pending", createdAt: serverTimestamp()
      });
      setPendingReward(true);
      say("rewardRequested");
    } catch { say("authGeneric", true); }
  };

  const pts = user ? Number(user.points) || 0 : 0;
  const history = user ? [
    ...orders,
    ...(user.orders || []).map((o) => ({ total: o.total, createdAt: o.at, items: (o.summary || []).map((s) => ({ name: s.name, qty: s.qty })), status: "done" }))
  ] : [];
  const dateLocale = lang === "ar" ? "ar" : lang === "en" ? "en-GB" : "sv-SE";

  return (
    <div className="modal">
      <div className="modal-backdrop" onClick={closeAuth} />
      <div className="sheet sheet-narrow" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button ref={closeRef} className="icon-btn sheet-close" type="button" aria-label={t("close")} onClick={closeAuth}><IconClose /></button>
        <div className="sheet-body">
          {!user ? (
            <>
              <h2 id="auth-title">{t("authTitle")}</h2>
              <p className="muted">{t("authIntro")}</p>
              <div className="tabs" role="tablist">
                <button type="button" role="tab" className={`tab${tab === "login" ? " active" : ""}`} aria-selected={tab === "login"} onClick={() => { setTab("login"); say(""); }}>{t("authLoginTab")}</button>
                <button type="button" role="tab" className={`tab${tab === "register" ? " active" : ""}`} aria-selected={tab === "register"} onClick={() => { setTab("register"); say(""); }}>{t("authRegisterTab")}</button>
              </div>
              {tab === "login" ? (
                <form className="auth-form" onSubmit={login}>
                  <label className="field"><span>{t("authEmail")}</span><input type="email" autoComplete="email" value={form.loginEmail} onChange={set("loginEmail")} required /></label>
                  <label className="field"><span>{t("authPassword")}</span><input type="password" autoComplete="current-password" value={form.loginPassword} onChange={set("loginPassword")} required /></label>
                  <button type="submit" className="btn btn-primary full">{t("authLoginSubmit")}</button>
                  <button type="button" className="link-btn" onClick={reset}>{t("forgotPassword")}</button>
                </form>
              ) : (
                <form className="auth-form" onSubmit={register}>
                  <label className="field"><span>{t("authName")}</span><input type="text" autoComplete="name" value={form.name} onChange={set("name")} required /></label>
                  <label className="field"><span>{t("authEmail")}</span><input type="email" autoComplete="email" value={form.email} onChange={set("email")} required /></label>
                  <label className="field"><span>{t("authPassword")}</span><input type="password" autoComplete="new-password" minLength={6} value={form.password} onChange={set("password")} required /><small className="hint">{t("passwordHint")}</small></label>
                  <button type="submit" className="btn btn-primary full">{t("authRegisterSubmit")}</button>
                </form>
              )}
              <div className="divider"><span>{t("authOr")}</span></div>
              <button className="btn btn-light full" type="button" onClick={google}><IconGoogle /><span>{t("authWithGoogle")}</span></button>
              <details className="more-auth">
                <summary>{t("moreOptions")}</summary>
                <div className="phone-auth">
                  {phoneStep === "number" ? (
                    <div id="phone-step-number">
                      <label className="field"><span>{t("phoneAuthLabel")}</span><input type="tel" placeholder="+46 7X XXX XX XX" autoComplete="tel" value={form.phone} onChange={set("phone")} /></label>
                      <button className="btn btn-ghost full" type="button" onClick={sendCode}>{t("phoneSendCode")}</button>
                    </div>
                  ) : (
                    <div id="phone-step-code">
                      <label className="field"><span>{t("phoneCodeLabel")}</span><input type="text" maxLength={6} inputMode="numeric" autoComplete="one-time-code" value={form.code} onChange={set("code")} /></label>
                      <button className="btn btn-primary full" type="button" onClick={verifyCode}>{t("phoneVerify")}</button>
                    </div>
                  )}
                  <div id="recaptcha-container" />
                </div>
                <div className="email-link-auth">
                  <label className="field"><span>{t("emailLinkLabel")}</span><input type="email" autoComplete="email" value={form.linkEmail} onChange={set("linkEmail")} /></label>
                  <button className="btn btn-ghost full" type="button" onClick={sendLink}>{t("emailLinkSend")}</button>
                </div>
              </details>
            </>
          ) : (
            <>
              <h2 id="auth-title">{t("hello", { name: user.name || "" })}</h2>
              <p className="muted">{user.email || user.phone || ""}</p>
              <div className="points-card">
                <div className="points-row"><strong>{pts}</strong><span>{t("pointsLabelLong")}</span></div>
                <div className="bar"><div className="bar-fill" style={{ width: `${Math.min(100, Math.round((pts / REWARD_TARGET) * 100))}%` }} /></div>
                <p className="muted small">{pts >= REWARD_TARGET ? t("rewardReady") : t("rewardProgressText", { left: REWARD_TARGET - pts })}</p>
                <button className="btn btn-primary full" type="button" disabled={pts < REWARD_TARGET || pendingReward} onClick={redeem}>{t("rewardRedeemBtn")}</button>
                {pendingReward && <p className="small">{t("rewardPending")}</p>}
              </div>
              <h3 className="h-small">{t("orderHistoryTitle")}</h3>
              <div className="order-history">
                {!history.length && <p className="empty">{t("noOrdersYet")}</p>}
                {history.slice(0, 20).map((o, i) => {
                  const status = o.status || "pending";
                  return (
                    <div className="order-row" key={o._id || i}>
                      <div>
                        <strong>{kr(o.total || 0)}{o.code ? ` · #${o.code}` : ""}</strong>
                        <span className={`badge ${status}`}>{t(`status_${status}`)}</span>
                      </div>
                      <small>{new Date(tsMillis(o.createdAt)).toLocaleDateString(dateLocale)} — {(o.items || []).map((it) => `${it.qty}× ${it.name}`).join(", ")}</small>
                    </div>
                  );
                })}
              </div>
              <button className="btn btn-ghost full" type="button" onClick={() => { signOut(auth); closeAuth(); }}>{t("authLogout")}</button>
            </>
          )}
          {msg.key && <p className={`form-msg${msg.error ? " error" : ""}`} role="status">{t(msg.key)}</p>}
        </div>
      </div>
    </div>
  );
}
