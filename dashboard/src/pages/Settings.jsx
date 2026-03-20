import { useState } from 'react'
import {
  Settings as SettingsIcon, Save, Server, Mail, Shield,
  Bell, Palette, Key, Eye, EyeOff, Check, RefreshCw
} from 'lucide-react'

function Section({ title, icon: Icon, children }) {
  return (
    <div className="card p-5 flex flex-col gap-5">
      <p className="section-title flex items-center gap-2">
        <Icon size={14} className="text-violet-400"/>
        {title}
      </p>
      {children}
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="label">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-600">{hint}</p>}
    </div>
  )
}

function Toggle({ label, desc, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm text-white font-medium">{label}</p>
        {desc && <p className="text-xs text-gray-500 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={()=>onChange(!value)}
        className={`relative w-10 h-5 rounded-full transition-colors ${
          value ? 'bg-violet-600' : 'bg-[#2a2a4a]'
        }`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
          value ? 'translate-x-5' : 'translate-x-0.5'
        }`}/>
      </button>
    </div>
  )
}

export default function Settings() {
  const [toast,   setToast]   = useState(null)
  const [showKey, setShowKey] = useState(false)

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(null),3000) }
  const save = section => showToast(`${section} sauvegardé.`)

  // Serveur
  const [serverIp,  setServerIp]  = useState('127.0.0.1')
  const [serverPort,setServerPort]= useState('2005')
  const [serverName,setServerName]= useState('Universe Reborn')
  const [maintenanceMode, setMaintMode] = useState(false)
  const [registrationsOpen, setRegOpen] = useState(true)

  // Email
  const [smtpHost,  setSmtpHost]  = useState('smtp.gmail.com')
  const [smtpPort,  setSmtpPort]  = useState('587')
  const [smtpUser,  setSmtpUser]  = useState('')
  const [smtpPass,  setSmtpPass]  = useState('')
  const [fromEmail, setFromEmail] = useState('noreply@universe-reborn.fr')
  const [emailVerifRequired, setEmailVerif] = useState(true)

  // Sécurité
  const [playKeyRequired, setPlayKeyReq] = useState(true)
  const [maxCharsPerAcc,  setMaxChars]   = useState('4')
  const [sessionTimeout,  setSessTimeout]= useState('30')
  const [bruteForceProtect, setBruteForce]= useState(true)

  // Notifications
  const [notifNewAccount, setNotifNewAcc] = useState(true)
  const [notifBugReport,  setNotifBug]    = useState(true)
  const [notifModReport,  setNotifMod]    = useState(true)
  const [notifServerDown, setNotifSrv]    = useState(true)

  const [apiKey] = useState('sk_live_ur_' + Math.random().toString(36).substring(2,18))

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg bg-green-600/90 text-white text-sm font-semibold shadow-xl animate-fade-in">
          <Check size={15}/> {toast}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Paramètres</h1>
          <p className="page-subtitle">Configuration du serveur et du dashboard</p>
        </div>
      </div>

      {/* Serveur */}
      <Section title="Serveur" icon={Server}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Nom du serveur">
            <input className="input" value={serverName} onChange={e=>setServerName(e.target.value)}/>
          </Field>
          <Field label="Adresse IP">
            <input className="input" value={serverIp} onChange={e=>setServerIp(e.target.value)}/>
          </Field>
          <Field label="Port API" hint="Port du serveur Darkflame">
            <input className="input" value={serverPort} onChange={e=>setServerPort(e.target.value)}/>
          </Field>
        </div>
        <div className="border-t border-[#1e1e3a] pt-4 flex flex-col gap-2">
          <Toggle label="Mode maintenance" desc="Empêche les joueurs de se connecter" value={maintenanceMode} onChange={setMaintMode}/>
          <Toggle label="Inscriptions ouvertes" desc="Autoriser les nouvelles inscriptions" value={registrationsOpen} onChange={setRegOpen}/>
        </div>
        <button onClick={()=>save('Paramètres serveur')} className="btn-primary w-fit"><Save size={14}/> Sauvegarder</button>
      </Section>

      {/* Email */}
      <Section title="Email & SMTP" icon={Mail}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Hôte SMTP">
            <input className="input" value={smtpHost} onChange={e=>setSmtpHost(e.target.value)}/>
          </Field>
          <Field label="Port SMTP">
            <input className="input" value={smtpPort} onChange={e=>setSmtpPort(e.target.value)}/>
          </Field>
          <Field label="Utilisateur SMTP">
            <input className="input" value={smtpUser} onChange={e=>setSmtpUser(e.target.value)} placeholder="user@gmail.com"/>
          </Field>
          <Field label="Mot de passe SMTP">
            <div className="relative">
              <input type={showKey?'text':'password'} className="input pr-9" value={smtpPass} onChange={e=>setSmtpPass(e.target.value)} placeholder="••••••••"/>
              <button onClick={()=>setShowKey(s=>!s)} className="absolute right-2 top-1/2 -translate-y-1/2 btn-icon p-1">
                {showKey?<EyeOff size={13}/>:<Eye size={13}/>}
              </button>
            </div>
          </Field>
          <Field label="Email expéditeur" hint="Adresse affichée dans les emails">
            <input className="input" value={fromEmail} onChange={e=>setFromEmail(e.target.value)}/>
          </Field>
        </div>
        <Toggle label="Vérification email obligatoire" desc="Les nouveaux comptes doivent vérifier leur email" value={emailVerifRequired} onChange={setEmailVerif}/>
        <div className="flex gap-2">
          <button onClick={()=>save('Configuration email')} className="btn-primary"><Save size={14}/> Sauvegarder</button>
          <button onClick={()=>showToast('Email de test envoyé.')} className="btn-secondary"><Mail size={14}/> Tester SMTP</button>
        </div>
      </Section>

      {/* Sécurité */}
      <Section title="Sécurité" icon={Shield}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Personnages max par compte">
            <input type="number" min={1} max={8} className="input" value={maxCharsPerAcc} onChange={e=>setMaxChars(e.target.value)}/>
          </Field>
          <Field label="Timeout session (minutes)">
            <input type="number" min={5} className="input" value={sessionTimeout} onChange={e=>setSessTimeout(e.target.value)}/>
          </Field>
        </div>
        <div className="flex flex-col gap-2">
          <Toggle label="Play Key obligatoire" desc="Les joueurs ont besoin d'une clé pour s'inscrire" value={playKeyRequired} onChange={setPlayKeyReq}/>
          <Toggle label="Protection brute-force" desc="Bloquer les IPs après trop de tentatives" value={bruteForceProtect} onChange={setBruteForce}/>
        </div>
        <button onClick={()=>save('Paramètres sécurité')} className="btn-primary w-fit"><Save size={14}/> Sauvegarder</button>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <div className="flex flex-col gap-2">
          <Toggle label="Nouvel compte inscrit"  desc="Notifier à chaque nouvelle inscription" value={notifNewAccount} onChange={setNotifNewAcc}/>
          <Toggle label="Nouveau bug report"     desc="Notifier à chaque nouveau rapport"      value={notifBugReport}  onChange={setNotifBug}/>
          <Toggle label="Nouveau signalement"    desc="Notifier à chaque signalement joueur"   value={notifModReport}  onChange={setNotifMod}/>
          <Toggle label="Serveur hors ligne"     desc="Alerte si le serveur tombe"             value={notifServerDown} onChange={setNotifSrv}/>
        </div>
        <button onClick={()=>save('Notifications')} className="btn-primary w-fit"><Save size={14}/> Sauvegarder</button>
      </Section>

      {/* API Key */}
      <Section title="Clé API" icon={Key}>
        <Field label="Clé API publique" hint="Utilisez cette clé pour accéder aux endpoints REST du dashboard.">
          <div className="flex gap-2">
            <input readOnly className="input font-mono text-xs" value={showKey ? apiKey : '•'.repeat(apiKey.length)}/>
            <button onClick={()=>setShowKey(s=>!s)} className="btn-secondary px-3">
              {showKey?<EyeOff size={14}/>:<Eye size={14}/>}
            </button>
          </div>
        </Field>
        <button onClick={()=>showToast('Clé API régénérée.')} className="btn-danger w-fit">
          <RefreshCw size={14}/> Régénérer la clé
        </button>
      </Section>

    </div>
  )
}
