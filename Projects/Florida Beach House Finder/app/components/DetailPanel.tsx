'use client';

import type { Listing } from './types';
import { priceColor, fmtPrice, buildDeepLinks } from './ListingCard';

interface Props {
  listing: Listing;
  onClose: () => void;
}

export default function DetailPanel({ listing: l, onClose }: Props) {
  const links = buildDeepLinks(l);

  const viewLinks = [
    { href: links.zillow,  label: 'Zillow',   color: '#006aff' },
    { href: links.realtor, label: 'Realtor',  color: '#d92228' },
    { href: links.redfin,  label: 'Redfin',   color: '#cc0000' },
    { href: links.google,  label: 'Google',   color: '#4285f4' },
  ];

  const statCells = [
    { label: 'Beds',        value: `${l.beds} bed` },
    { label: 'Baths',       value: `${l.baths} ba` },
    { label: 'Sqft',        value: l.sqft ? l.sqft.toLocaleString() : '—' },
    { label: 'Year Built',  value: l.yearBuilt ? String(l.yearBuilt) : '—' },
    { label: 'Lot',         value: l.lotSizeSqft ? `${(l.lotSizeSqft / 43560).toFixed(2)} ac` : '—' },
    { label: 'Region',      value: l.region || '—' },
  ];

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-body)',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: '16px 16px 14px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
          <div>
            <div
              style={{
                fontSize: '1.7rem',
                fontWeight: 700,
                color: priceColor(l.price),
                fontFamily: 'var(--font-display)',
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
              }}
            >
              {fmtPrice(l.price)}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 3 }}>
              {l.address}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {l.city}, {l.state} {l.zip}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 8,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              cursor: 'pointer',
              color: 'var(--text-muted)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 32,
              minHeight: 32,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.646 3.646a.5.5 0 0 1 .708 0L8 7.293l3.646-3.647a.5.5 0 0 1 .708.708L8.707 8l3.647 3.646a.5.5 0 0 1-.708.708L8 8.707l-3.646 3.647a.5.5 0 0 1-.708-.708L7.293 8 3.646 4.354a.5.5 0 0 1 0-.708z" />
            </svg>
          </button>
        </div>

        {/* ── View This Property links ── */}
        <div style={{ display: 'flex', gap: 6 }}>
          {viewLinks.map(({ href, label, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                display: 'block',
                textAlign: 'center',
                padding: '7px 4px',
                borderRadius: 9,
                fontSize: '0.62rem',
                fontWeight: 700,
                color: '#fff',
                background: color,
                textDecoration: 'none',
                letterSpacing: '0.02em',
              }}
            >
              View on {label}
            </a>
          ))}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div
        style={{
          overflowY: 'auto',
          flex: 1,
          padding: '16px',
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {/* Images */}
        {l.images?.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: 4,
              overflowX: 'auto',
              marginBottom: 16,
              borderRadius: 10,
              overflow: 'hidden',
              scrollbarWidth: 'none',
            }}
          >
            {l.images.slice(0, 5).map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={img}
                alt=""
                style={{
                  height: 130,
                  width: 200,
                  objectFit: 'cover',
                  flexShrink: 0,
                  borderRadius:
                    i === 0 ? '8px 0 0 8px' :
                    i === l.images.length - 1 ? '0 8px 8px 0' : 0,
                }}
                loading="lazy"
              />
            ))}
          </div>
        )}

        {/* 6-cell stats grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            marginBottom: 12,
          }}
        >
          {statCells.map(({ label, value }) => (
            <div
              key={label}
              style={{
                padding: '10px 12px',
                background: 'var(--bg-elevated)',
                borderRadius: 10,
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  fontSize: '0.6rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: 3,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Beach card */}
        <InfoCard icon="🌊" title="Nearest Beach">
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {l.nearestBeach || 'Nearby beach'}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {l.beachDistanceMiles.toFixed(1)} miles
            {l.beachProximity ? ` · ${l.beachProximity}` : ''}
          </div>
        </InfoCard>

        {/* Pool card */}
        {(l.hasPool || l.poolReady) && (
          <InfoCard icon="🏊" title={l.hasPool ? 'Pool' : 'Pool-Ready Lot'}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {l.hasPool ? '✅ Pool included' : '⭕ Lot is pool-ready'}
            </div>
          </InfoCard>
        )}

        {/* Parking card */}
        {l.hasParking && (
          <InfoCard icon="🚗" title="Parking">
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Parking available
            </div>
          </InfoCard>
        )}

        {/* Description */}
        {l.description && (
          <div style={{ marginTop: 12 }}>
            <div
              style={{
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 6,
                fontWeight: 600,
              }}
            >
              Description
            </div>
            <p
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                fontFamily: 'var(--font-body)',
              }}
            >
              {l.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '10px 12px',
        background: 'var(--bg-elevated)',
        borderRadius: 10,
        border: '1px solid var(--border)',
        marginBottom: 8,
      }}
    >
      <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
      <div>
        <div
          style={{
            fontSize: '0.6rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: 2,
          }}
        >
          {title}
        </div>
        {children}
      </div>
    </div>
  );
}
