import { useState } from 'react';
import { IconChevronLeft, IconHeart } from '../components/icons.jsx';
import ContactRequestField from '../components/ContactRequestField.jsx';

const CLEAN_LABELS = ['Very messy', 'Relaxed', 'Middle ground', 'Fairly tidy', 'Very tidy'];
const SLEEP_LABELS = ['Night owl', 'Leans late', 'Flexible', 'Leans early', 'Early bird'];
const NOISE_LABELS = ['Needs quiet', 'Prefers quiet', 'Moderate', 'Tolerant', 'Very tolerant'];

function bandLabel(labels, score) {
  const idx = Math.min(labels.length - 1, Math.max(0, Math.round(score) - 1));
  return labels[idx];
}

function InfoCell({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--color-neutral-600)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <h3 style={{ fontSize: 15, margin: '0 0 12px' }}>{title}</h3>
      {children}
    </div>
  );
}

export default function ListingDetail({ currentUserId, user, score, flags, isFavorite, onToggleFavorite, onBack, onBlock, onReport }) {
  const [confirmingBlock, setConfirmingBlock] = useState(false);
  const [blockBusy, setBlockBusy] = useState(false);
  const [blockError, setBlockError] = useState(null);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportBusy, setReportBusy] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [reportError, setReportError] = useState(null);

  async function handleConfirmBlock() {
    setBlockBusy(true);
    setBlockError(null);
    try {
      await onBlock(user.id);
      onBack();
    } catch (e) {
      setBlockError(e.message);
      setBlockBusy(false);
    }
  }

  async function handleSubmitReport() {
    setReportBusy(true);
    setReportError(null);
    try {
      await onReport(user.id, reportReason.trim());
      setReportSent(true);
    } catch (e) {
      setReportError(e.message);
    } finally {
      setReportBusy(false);
    }
  }

  const basics = [
    { label: 'Gender', value: user.gender === 'woman' ? 'Woman' : 'Man' },
    user.pronouns && { label: 'Pronouns', value: user.pronouns },
    user.yearMajor && { label: 'Year & major', value: user.yearMajor },
    user.hometown && { label: 'Hometown', value: user.hometown },
  ].filter(Boolean);

  return (
    <div className="screen">
      <div style={{ position: 'relative', height: 260, background: 'linear-gradient(160deg,#ffe1d0,#ffc6a5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: 72, color: 'var(--color-accent-700)', opacity: 0.5 }}>{user.name[0]?.toUpperCase()}</span>
        <button onClick={onBack} style={{ position: 'absolute', top: 20, left: 16, width: 40, height: 40, borderRadius: 999, background: 'rgba(245,234,216,.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconChevronLeft size={19} />
        </button>
        <button
          onClick={onToggleFavorite}
          style={{ position: 'absolute', top: 20, right: 16, width: 40, height: 40, borderRadius: 999, background: 'var(--color-accent)', color: 'var(--color-accent-100)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <IconHeart size={19} filled={isFavorite} />
        </button>
      </div>
      <div className="screen-body" style={{ paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, margin: 0 }}>{user.name}</h1>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <span className="tag" style={{ background: 'var(--color-accent)', color: 'var(--color-accent-100)', fontWeight: 700 }}>{score}% match</span>
            {flags.map(f => <span key={f} className="tag tag-neutral">{f}</span>)}
          </div>
        </div>

        <SectionCard title="Basics">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' }}>
            {basics.map(b => <InfoCell key={b.label} label={b.label} value={b.value} />)}
          </div>
        </SectionCard>

        <SectionCard title="About">
          <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0 }}>
            {user.bio || <span style={{ color: 'var(--color-neutral-500)', fontStyle: 'italic' }}>Not specified</span>}
          </p>
        </SectionCard>

        <SectionCard title="Logistics">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' }}>
            <InfoCell label="Cleanliness" value={bandLabel(CLEAN_LABELS, user.scores.clean)} />
            <InfoCell label="Sleep schedule" value={bandLabel(SLEEP_LABELS, user.scores.sleep)} />
            <InfoCell label="Noise tolerance" value={bandLabel(NOISE_LABELS, user.scores.noise)} />
            <InfoCell label="Guest frequency" value={<span style={{ color: 'var(--color-neutral-500)', fontStyle: 'italic', fontWeight: 400 }}>Not specified</span>} />
          </div>
        </SectionCard>

        {(user.instagram || user.snapchat) && (
          <SectionCard title="Social">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {user.instagram && <div style={{ fontSize: 14 }}>Instagram · <strong>{user.instagram}</strong></div>}
              {user.snapchat && <div style={{ fontSize: 14 }}>Snapchat · <strong>{user.snapchat}</strong></div>}
            </div>
          </SectionCard>
        )}

        <SectionCard title="Contact">
          <ContactRequestField currentUserId={currentUserId} ownerId={user.id} field="email" label="Email" />
          <ContactRequestField currentUserId={currentUserId} ownerId={user.id} field="phone" label="Phone number" />
        </SectionCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '4px 4px 20px' }}>
          {!reportOpen ? (
            <button
              onClick={() => setReportOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-neutral-600)', fontSize: 12, textAlign: 'left', padding: 0 }}
            >
              Report this profile
            </button>
          ) : reportSent ? (
            <p style={{ fontSize: 12, color: 'var(--color-neutral-600)' }}>Thanks — this has been reported for review.</p>
          ) : (
            <div className="card" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 600 }}>Why are you reporting {user.name}? (optional)</label>
              <textarea
                className="input" value={reportReason} onChange={e => setReportReason(e.target.value)}
                placeholder="Add any details that would help..." style={{ minHeight: 60 }}
              />
              {reportError && <p style={{ fontSize: 12, color: 'var(--color-danger-600, #c0392b)', margin: 0 }}>{reportError}</p>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" style={{ width: 'auto', fontSize: 12, padding: '7px 14px' }} onClick={() => setReportOpen(false)} disabled={reportBusy}>Cancel</button>
                <button className="btn btn-primary" style={{ width: 'auto', fontSize: 12, padding: '7px 14px' }} onClick={handleSubmitReport} disabled={reportBusy}>
                  {reportBusy ? 'Submitting…' : 'Submit report'}
                </button>
              </div>
            </div>
          )}

          {!confirmingBlock ? (
            <button
              onClick={() => setConfirmingBlock(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger-600, #c0392b)', fontSize: 12, textAlign: 'left', padding: 0 }}
            >
              Block {user.name}
            </button>
          ) : (
            <div className="card" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 12, margin: 0 }}>
                Block {user.name}? They won't be able to message you, request your contact info, or see your profile — and you won't see theirs.
              </p>
              {blockError && <p style={{ fontSize: 12, color: 'var(--color-danger-600, #c0392b)', margin: 0 }}>{blockError}</p>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" style={{ width: 'auto', fontSize: 12, padding: '7px 14px' }} onClick={() => setConfirmingBlock(false)} disabled={blockBusy}>Cancel</button>
                <button className="btn btn-primary" style={{ width: 'auto', fontSize: 12, padding: '7px 14px', background: 'var(--color-danger-600, #c0392b)' }} onClick={handleConfirmBlock} disabled={blockBusy}>
                  {blockBusy ? 'Blocking…' : 'Confirm block'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
