import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const DARK = {
  surface:     '#111111',
  border:      '#f97316',
  borderSoft:  '#222222',
  accent:      '#f97316',
  accentDark:  '#1a1200',
  text:        '#ffffff',
  textSec:     '#aaaaaa',
  navBg:       '#111111',
  linkActive:  '#f97316',
  linkInactive:'#aaaaaa',
  toggleBg:    '#1a1a1a',
  toggleBorder:'#333333',
  iconBg:      '#f97316',
  iconText:    '#000000',
}

const LIGHT = {
  surface:     '#ffffff',
  border:      '#f97316',
  borderSoft:  '#e5e5e5',
  accent:      '#f97316',
  accentDark:  '#fff3e0',
  text:        '#111111',
  textSec:     '#666666',
  navBg:       '#ffffff',
  linkActive:  '#f97316',
  linkInactive:'#666666',
  toggleBg:    '#f5f5f5',
  toggleBorder:'#dddddd',
  iconBg:      '#f97316',
  iconText:    '#ffffff',
}

export default function Navbar() {
  const location = useLocation()
  const isActive = (path) => location.pathname.startsWith(path)

  // Dark mode state — persisted in localStorage
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('nexflow-theme') !== 'light' }
    catch { return true }
  })

  const C = isDark ? DARK : LIGHT

  // Apply theme to body
  useEffect(() => {
    document.body.style.backgroundColor = isDark ? '#0a0a0a' : '#f5f5f0'
    document.body.style.color = isDark ? '#ffffff' : '#111111'
    try { localStorage.setItem('nexflow-theme', isDark ? 'dark' : 'light') }
    catch {}
  }, [isDark])

  const toggleTheme = () => setIsDark(prev => !prev)

  return (
    <nav style={{
      background: C.navBg,
      borderBottom: `2px solid ${C.accent}`,
      padding: '0 36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '62px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: isDark
        ? '0 4px 20px rgba(0,0,0,0.5)'
        : '0 4px 16px rgba(249,115,22,0.1)',
      transition: 'background 0.3s ease, box-shadow 0.3s ease',
    }}>

      {/* ── Logo ── */}
      <Link to="/workflows" style={{ display:'flex', alignItems:'center', gap:'10px', textDecoration:'none' }}>
        <div style={{
          width: '38px', height: '38px',
          background: C.iconBg,
          borderRadius: '7px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', color: C.iconText,
          fontWeight: '900', letterSpacing: '0.5px',
          fontFamily: 'Inter, sans-serif',
          flexShrink: 0,
        }}>NF</div>
        <div style={{ lineHeight: 1 }}>
          <span style={{
            color: C.text,
            fontSize: '18px', fontWeight: '900',
            textTransform: 'uppercase', letterSpacing: '0.5px',
            fontFamily: 'Inter, sans-serif',
          }}>Nex</span>
          <span style={{
            color: C.accent,
            fontSize: '18px', fontWeight: '900',
            textTransform: 'uppercase', letterSpacing: '0.5px',
            fontFamily: 'Inter, sans-serif',
          }}>Flow</span>
        </div>
      </Link>

      {/* ── Nav Links ── */}
      <div style={{ display:'flex', alignItems:'center', gap:'2px' }}>
        {[
          { to:'/workflows', label:'Workflows' },
          { to:'/audit',     label:'Audit Log' },
        ].map(({ to, label }) => (
          <Link key={to} to={to} style={{
            padding: '8px 18px',
            textDecoration: 'none',
            fontSize: '12px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.7px',
            fontFamily: 'Inter, sans-serif',
            color: isActive(to) ? C.linkActive : C.linkInactive,
            borderBottom: `3px solid ${isActive(to) ? C.accent : 'transparent'}`,
            marginBottom: '-2px',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { if(!isActive(to)) e.currentTarget.style.color = C.accent }}
          onMouseLeave={e => { if(!isActive(to)) e.currentTarget.style.color = C.linkInactive }}
          >{label}</Link>
        ))}
      </div>

      {/* ── Dark / Light Toggle ── */}
      <button
        onClick={toggleTheme}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 14px',
          background: C.accentDark,
          border: `1px solid rgba(249,115,22,0.35)`,
          borderRadius: '6px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = C.accent
          e.currentTarget.style.borderColor = C.accent
          e.currentTarget.querySelectorAll('span').forEach(s => s.style.color = '#000')
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = C.accentDark
          e.currentTarget.style.borderColor = 'rgba(249,115,22,0.35)'
          e.currentTarget.querySelectorAll('span').forEach(s => {
            if(s.classList.contains('icon')) s.style.color = C.accent
            if(s.classList.contains('lbl')) s.style.color = C.accent
          })
        }}
      >
        {/* Sun / Moon Icon */}
        <span className="icon" style={{
          fontSize: '16px',
          color: C.accent,
          lineHeight: 1,
          transition: 'all 0.2s',
        }}>
          {isDark ? '☀️' : '🌙'}
        </span>

        {/* Label */}
        <span className="lbl" style={{
          fontSize: '11px',
          fontWeight: '800',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: C.accent,
          fontFamily: 'Inter, sans-serif',
          transition: 'all 0.2s',
        }}>
          {isDark ? 'Light' : 'Dark'}
        </span>
      </button>
    </nav>
  )
}