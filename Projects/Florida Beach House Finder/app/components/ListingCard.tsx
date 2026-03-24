'use client';

import type { Listing } from './types';

export function priceColor(price: number) {
  if (price < 300000) return '#16a34a';
  if (price < 350000) return '#d97706';
  return '#dc2626';
}

export function fmtPrice(p: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(p);
}

function daysAgo(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (d === 0) return 'Today';
  if (d === 1) return '1d ago';
  return `${d}d ago`;
}

export function buildDeepLinks(listing: Listing) {
  const addr = encodeURIComponent(`${listing.address} ${listing.city} FL`);
  const city = encodeURIComponent(listing.city);
  return {
    zillow:  listing.source === 'zillow'
      ? listing.sourceUrl
      : `https://www.zillow.com/homes/for_sale/${addr}_rb/`,
    realtor: listing.source === 'realtor'
      ? listing.sourceUrl
      : `https://www.realtor.com/realestateandhomes-search/${city}_FL`,
    redfin:  listing.source === 'redfin'
      ? listing.sourceUrl
      : `https://www.redfin.com/city/FL/${city}/filter/property-type=house`,
    google:  `https://www.google.com/search?q=${addr}+real+estate`,
  };
}

interface LinkBtnProps {
  href: string;
  label: string;
  color: string;
}

function LinkBtn({ href, label, color }: LinkBtnProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5px 4px',
        borderRadius: 7,
        fontSize: '0.6rem',
        fontWeight: 700,
        color: '#fff',
        background: color,
        textDecoration: 'none',
        minHeight: 26,
        letterSpacing: '0.02em',
      }}
      onClick={e => e.stopPropagation()}
    >
      {label}
    </a>
  );
}

interface Props {
  listing: Listing;
  isSelected: boolean;
  onClick: (l: Listing) => void;
}

export default function ListingCard({ listing, isSelected, onClick }: Props) {
  const links = buildDeepLinks(listing);
  const ago = daysAgo(listing.scrapedAt || listing.listedAt);

  return (
    <div
      onClick={() => onClick(listing)}
      className="rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99] fade-in"
      style={{
        background: 'var(--bg-card)',
        border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
        boxShadow: isSelected
          ? '0 0 0 3px color-mix(in srgb, var(--accent) 20%, transparent), var(--shadow-card)'
          : 'var(--shadow-card)',
      }}
    >
      {/* Image */}
      <div
        style={{
          height: 160,
          background: 'var(--bg-elevated)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {listing.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.images[0]}
            alt={listing.address}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 44,
              opacity: 0.2,
            }}
          >
            🏠
          </div>
        )}

        {/* Beach distance — top left */}
        {listing.beachDistanceMiles < 999 && (
          <div style={{ position: 'absolute', top: 8, left: 8 }}>
            <span
              style={{
                background: 'rgba(0,0,0,0.62)',
                color: '#fff',
                fontSize: '0.62rem',
                fontWeight: 600,
                padding: '3px 7px',
                borderRadius: 6,
                backdropFilter: 'blur(6px)',
              }}
            >
              🌊 {listing.beachDistanceMiles.toFixed(1)}mi
            </span>
          </div>
        )}

        {/* Badges — top right */}
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            alignItems: 'flex-end',
          }}
        >
          {listing.hasPool && (
            <span
              style={{
                background: 'var(--pool-badge)',
                color: '#fff',
                fontSize: '0.6rem',
                fontWeight: 700,
                padding: '3px 7px',
                borderRadius: 6,
              }}
            >
              🏊 Pool
            </span>
          )}
          {listing.poolReady && !listing.hasPool && (
            <span
              style={{
                background: 'var(--pool-ready-badge)',
                color: '#fff',
                fontSize: '0.6rem',
                fontWeight: 700,
                padding: '3px 7px',
                borderRadius: 6,
              }}
            >
              ⭕ Pool-Ready
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 14px 10px' }}>
        {/* Price */}
        <div
          style={{
            fontSize: '1.3rem',
            fontWeight: 700,
            color: priceColor(listing.price),
            fontFamily: 'var(--font-display)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {fmtPrice(listing.price)}
        </div>

        {/* Address */}
        <div
          style={{
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            marginTop: 3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {listing.address}, {listing.city}
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            marginTop: 8,
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
          }}
        >
          <span>
            <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{listing.beds}</strong> bd
          </span>
          <span>
            <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{listing.baths}</strong> ba
          </span>
          {listing.sqft && (
            <span>
              <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{listing.sqft.toLocaleString()}</strong> sqft
            </span>
          )}
          {listing.yearBuilt && (
            <span>
              Built{' '}
              <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{listing.yearBuilt}</strong>
            </span>
          )}
        </div>

        {/* Source + age */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 6,
          }}
        >
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              textTransform: 'capitalize',
              color:
                listing.source === 'zillow' ? '#006aff' :
                listing.source === 'redfin' ? '#cc0000' :
                listing.source === 'realtor' ? '#d92228' :
                'var(--text-muted)',
            }}
          >
            {listing.source}
          </span>
          {ago && (
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{ago}</span>
          )}
        </div>

        {/* Deep-link buttons */}
        <div
          style={{ display: 'flex', gap: 4, marginTop: 8 }}
          onClick={e => e.stopPropagation()}
        >
          <LinkBtn href={links.zillow}  label="Zillow"   color="#006aff" />
          <LinkBtn href={links.realtor} label="Realtor"  color="#d92228" />
          <LinkBtn href={links.redfin}  label="Redfin"   color="#cc0000" />
          <LinkBtn href={links.google}  label="Google"   color="#4285f4" />
        </div>
      </div>
    </div>
  );
}
