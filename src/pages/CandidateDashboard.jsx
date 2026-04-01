import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ArrowRight, CheckCircle2, Bell, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/'); return; }

      const { data: profileData } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (profileData) setProfile(profileData);
      setLoading(false);
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="dash-page">
        <div className="dash-loader">
          <div className="dash-loader-ring"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Candidate';
  const examInterest = profile?.interested_exam || 'Certification';

  return (
    <div className="dash-page">

      {/* Animated background mesh */}
      <div className="dash-bg" aria-hidden="true">
        <div className="dash-bg-blob dash-bg-blob--1"></div>
        <div className="dash-bg-blob dash-bg-blob--2"></div>
        <div className="dash-bg-blob dash-bg-blob--3"></div>
        <div className="dash-bg-noise"></div>
      </div>

      {/* ===== TOP BAR ===== */}
      <header className="dash-header">
        <a href="/" className="dash-logo">FETS<span>.</span></a>
        <div className="dash-header-right">
          <div className="dash-avatar">{firstName.charAt(0)}</div>
          <button onClick={handleLogout} className="dash-logout">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="dash-main">

        {/* Hero greeting */}
        <section className="dash-greeting">
          <p className="dash-greeting-label">{greeting}</p>
          <h1 className="dash-greeting-name">
            {firstName}<span className="dash-dot">.</span>
          </h1>
        </section>

        {/* Glass Cards */}
        <div className="dash-grid">

          {/* Card 1: Registration Status */}
          <div className="dash-glass-card dash-glass-card--accent">
            <div className="dash-card-glow"></div>
            <div className="dash-card-status">
              <CheckCircle2 size={18} />
              <span>Early Access Active</span>
            </div>
            <h2 className="dash-card-title">{examInterest}</h2>
            <p className="dash-card-sub">
              You're registered for priority exam date notifications. We'll alert you the moment new slots open.
            </p>
            <div className="dash-card-divider"></div>
            <div className="dash-card-meta">
              <span className="dash-card-tag">
                <Bell size={12} /> Notifications On
              </span>
              <span className="dash-card-tag">
                <Sparkles size={12} /> Priority Queue
              </span>
            </div>
          </div>

          {/* Card 2: What's Next */}
          <div className="dash-glass-card">
            <h3 className="dash-section-label">What's Next</h3>
            <div className="dash-next-list">
              <a href="/#mock-exams" className="dash-next-item">
                <div className="dash-next-icon dash-next-icon--teal">📝</div>
                <div className="dash-next-info">
                  <h4>Take a Mock Test</h4>
                  <p>Practice in real exam conditions</p>
                </div>
                <ArrowRight size={16} className="dash-next-arrow" />
              </a>
              <a href="/#faq" className="dash-next-item">
                <div className="dash-next-icon dash-next-icon--violet">💬</div>
                <div className="dash-next-info">
                  <h4>Exam Day FAQ</h4>
                  <p>What to bring, expect & prepare</p>
                </div>
                <ArrowRight size={16} className="dash-next-arrow" />
              </a>
              <a href="/" className="dash-next-item">
                <div className="dash-next-icon dash-next-icon--rose">📍</div>
                <div className="dash-next-info">
                  <h4>Visit Our Centre</h4>
                  <p>Calicut & Kochi locations</p>
                </div>
                <ArrowRight size={16} className="dash-next-arrow" />
              </a>
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="dash-footer">
          FORUN TESTING & EDUCATIONAL SERVICES
        </footer>

      </main>
    </div>
  );
}
