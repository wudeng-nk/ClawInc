import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useParkStore } from '../store/useParkStore';
import TableNode from './TableNode';
import CompanyNameModal from './CompanyNameModal';
import CreateCompanyModal from './CreateCompanyModal';

export default function ParkCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Step 1: ask company name
  const [step1PendingTableId, setStep1PendingTableId] = useState<string | null>(null);
  const [step1PendingName, setStep1PendingName] = useState<string>('');
  const [showStep1, setShowStep1] = useState(false);

  // Step 2: ask CEO name + avatar
  const [showStep2, setShowStep2] = useState(false);

  const {
    tables,
    canvasOffset,
    canvasZoom,
    setCanvasOffset,
    setCanvasZoom,
    view,
    setView,
    selectTable,
  } = useParkStore();

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setCanvasZoom(canvasZoom + delta);
  }, [canvasZoom, setCanvasZoom]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.table-node')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCanvasOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTableClick = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;
    if (table.status === 'empty') {
      setStep1PendingTableId(tableId);
      setShowStep1(true);
    } else {
      selectTable(tableId);
    }
  };

  // Step 1 confirmed → go to step 2
  const handleStep1Confirm = (name: string) => {
    setStep1PendingName(name);
    setShowStep1(false);
    setShowStep2(true);
  };

  // Step 2 confirmed → call createCompany with CEO info
  const handleStep2Confirm = (ceoName: string, ceoAvatar: string) => {
    if (step1PendingTableId) {
      useParkStore.getState().createCompany(step1PendingTableId, step1PendingName, ceoName, ceoAvatar);
    }
    setShowStep2(false);
    setStep1PendingTableId(null);
    setStep1PendingName('');
  };

  if (view === 'company') return null;

  return (
    <div
      ref={containerRef}
      className="park-canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        background: 'radial-gradient(ellipse at center, #2d5a3d 0%, #1a3d2a 60%, #0f2518 100%)',
        position: 'relative',
      }}
    >
      {/* Cartoon clouds */}
      {[[100, 80], [400, 60], [750, 90]].map(([cx, cy], i) => (
        <div key={`cloud-${i}`} style={{
          position: 'absolute', left: cx, top: cy,
          fontSize: 42 + i * 4, opacity: 0.35,
          pointerEvents: 'none', zIndex: 1,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
        }}>☁️</div>
      ))}

      {/* Cartoon trees */}
      {[{ e: '🌳', x: 80, y: 300, s: 38 }, { e: '🌲', x: 1150, y: 200, s: 34 }, { e: '🌳', x: 500, y: 150, s: 36 }, { e: '🌲', x: 900, y: 650, s: 32 }].map((t, i) => (
        <div key={`tree-${i}`} style={{
          position: 'absolute', left: t.x, top: t.y,
          fontSize: t.s, pointerEvents: 'none', zIndex: 1,
          filter: 'drop-shadow(2px 3px 3px rgba(0,0,0,0.3))',
        }}>{t.e}</div>
      ))}

      {/* Dotted cartoon path connecting tables */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
        <path
          d="M 330 380 Q 500 320 670 380"
          fill="none" stroke="#c4a46b" strokeWidth="4"
          strokeDasharray="10 8" strokeLinecap="round" opacity="0.55"
        />
      </svg>

      {/* Cartoon buildings */}
      {[{e: '🏢', x: 150, y: 220, s: 48}, {e: '🏬', x: 850, y: 200, s: 44}, {e: '🏨', x: 500, y: 580, s: 46}].map((b, i) => (
        <div key={\`building-\${i}\`} style={{
          position: 'absolute', left: b.x, top: b.y,
          fontSize: b.s, pointerEvents: 'none', zIndex: 1,
          filter: 'drop-shadow(3px 4px 5px rgba(0,0,0,0.35))',
        }}>{b.e}</div>
      ))}

      {/* Cartoon entrance arch */}
      <div style={{
        position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, textAlign: 'center', pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 36, lineHeight: 1 }}>🏰</div>
        <div style={{
          marginTop: 2, padding: '4px 18px',
          background: 'linear-gradient(135deg, #5b3a1a 0%, #8b6914 50%, #5b3a1a 100%)',
          borderRadius: 12, border: '2px solid #c4a46b',
          fontFamily: '"Comic Sans MS", "Segoe UI", system-ui, sans-serif',
          fontSize: 18, fontWeight: 800, color: '#ffeaa7',
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
          letterSpacing: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}>云爪孵化器</div>
        <div style={{ fontSize: 11, color: '#a0c8a0', marginTop: 2, letterSpacing: 1 }}>ClawInc Park · Phase 2</div>
      </div>
      <button onClick={() => setView('talent')} style={{ position: 'absolute', top: 16, right: 24, zIndex: 10, padding: '8px 16px', background: 'rgba(30,60,30,0.85)', border: '2px solid #5a9a5a', borderRadius: 12, color: '#c0e8c0', fontSize: 13, cursor: 'pointer', fontFamily: 'system-ui, sans-serif', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>🏪 人才市场</button>

      {/* Zoom indicator */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        right: 24,
        color: '#3a6a4a',
        fontSize: 12,
        fontFamily: 'monospace',
        zIndex: 10,
        pointerEvents: 'none',
      }}>
        {Math.round(canvasZoom * 100)}%
      </div>

      {/* Tables */}
      {tables.map((table) => (
        <TableNode
          key={table.id}
          table={table}
          offset={canvasOffset}
          zoom={canvasZoom}
          onClick={() => handleTableClick(table.id)}
        />
      ))}

      {showStep1 && (
        <CompanyNameModal
          onConfirm={handleStep1Confirm}
          onCancel={() => {
            setShowStep1(false);
            setStep1PendingTableId(null);
          }}
        />
      )}

      {showStep2 && (
        <CreateCompanyModal
          companyName={step1PendingName}
          onConfirm={handleStep2Confirm}
          onCancel={() => {
            setShowStep2(false);
          }}
        />
      )}
    </div>
  );
}
