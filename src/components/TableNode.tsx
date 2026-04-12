import type { Table } from '../types';
import { useParkStore } from '../store/useParkStore';

interface Props {
  table: Table;
  offset: { x: number; y: number };
  zoom: number;
  onClick: () => void;
}

export default function TableNode({ table, offset, zoom, onClick }: Props) {
  const companies = useParkStore(s => s.companies);
  const company = table.companyId ? companies.find(c => c.id === table.companyId) : null;
  const ceo = company?.agents.find(a => a.role === 'CEO');

  const screenX = table.x * zoom + offset.x;
  const screenY = table.y * zoom + offset.y;
  const size = 120 * zoom;

  return (
    <div
      className="table-node"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      style={{
        position: 'absolute',
        left: screenX,
        top: screenY,
        width: size,
        height: size,
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        borderRadius: 12,
        border: table.status === 'empty'
          ? `2px dashed ${'#3a3a5c'}`
          : `2px solid ${'#4a4a8a'}`,
        background: table.status === 'empty'
          ? 'rgba(20,20,40,0.6)'
          : 'rgba(30,30,70,0.8)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6 * zoom,
        transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
        boxShadow: table.status === 'occupied'
          ? `0 0 ${20 * zoom}px rgba(80,80,200,0.2)`
          : 'none',
        fontFamily: 'system-ui, sans-serif',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = table.status === 'empty' ? '#5a5a8c' : '#6a6aac';
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 ${24 * zoom}px rgba(100,100,255,0.25)`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = table.status === 'empty' ? '#3a3a5c' : '#4a4a8a';
        (e.currentTarget as HTMLElement).style.boxShadow = table.status === 'occupied'
          ? `0 0 ${20 * zoom}px rgba(80,80,200,0.2)`
          : 'none';
      }}
    >
      {table.status === 'empty' ? (
        <>
          <div style={{
            fontSize: 24 * zoom,
            color: '#3a3a6c',
            lineHeight: 1,
          }}>+</div>
          <div style={{
            fontSize: 10 * zoom,
            color: '#3a3a6c',
            textAlign: 'center',
          }}>待入驻</div>
        </>
      ) : (
        <>
          <div style={{
            fontSize: 28 * zoom,
            lineHeight: 1,
            filter: ceo?.status === 'offline' ? 'grayscale(1)' : 'none',
            opacity: ceo?.status === 'offline' ? 0.5 : 1,
          }}>
            {ceo?.avatar ?? '🏢'}
          </div>
          <div style={{
            fontSize: 11 * zoom,
            fontWeight: 600,
            color: '#c0c0e0',
            textAlign: 'center',
            maxWidth: size - 16,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {company?.name}
          </div>
          <div style={{
            fontSize: 9 * zoom,
            color: '#6a6a9a',
            textAlign: 'center',
          }}>
            {ceo?.name ?? 'CEO'}
          </div>
          {/* Status indicator with ripple */}
          {ceo && (
            <div
              className={`agent-status-dot ${ceo.status}`}
              style={{
                position: 'absolute',
                bottom: 8 * zoom,
                right: 8 * zoom,
              }}
            >
              {ceo.status === 'thinking' && <div className="ripple-ring" />}
              <div
                className="status-core"
                style={{
                  width: 8 * zoom,
                  height: 8 * zoom,
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
