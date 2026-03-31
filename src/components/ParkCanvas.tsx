import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useParkStore } from '../store/useParkStore';
import TableNode from './TableNode';
import CreateCompanyModal from './CreateCompanyModal';

export default function ParkCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pendingTableId, setPendingTableId] = useState<string | null>(null);

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
      setPendingTableId(tableId);
      setShowCreateModal(true);
    } else {
      selectTable(tableId);
    }
  };

  const handleCreateCompany = (name: string) => {
    if (pendingTableId) {
      useParkStore.getState().createCompany(pendingTableId, name);
    }
    setShowCreateModal(false);
    setPendingTableId(null);
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
        backgroundColor: '#0a0a0f',
        backgroundImage: `
          linear-gradient(rgba(40,40,60,0.4) 1px, transparent 1px),
          linear-gradient(90deg, rgba(40,40,60,0.4) 1px, transparent 1px)
        `,
        backgroundSize: `${40 * canvasZoom}px ${40 * canvasZoom}px`,
        backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`,
        position: 'relative',
      }}
    >
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: 24,
        left: 32,
        zIndex: 10,
        color: '#e0e0f0',
        fontFamily: 'system-ui, sans-serif',
        pointerEvents: 'none',
      }}>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 1 }}>云爪孵化器</div>
        <div style={{ fontSize: 12, color: '#6b6b8a', marginTop: 2 }}>ClawInc Park · Phase 2</div>
      </div>
      <button onClick={() => setView('talent')} style={{ position: 'absolute', top: 24, right: 32, zIndex: 10, padding: '8px 16px', background: '#12122a', border: '1px solid #3a3a6c', borderRadius: 8, color: '#a0a0c0', fontSize: 13, cursor: 'pointer', fontFamily: 'system-ui, sans-serif' }}>🏪 人才市场</button>

      {/* Zoom indicator */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        right: 24,
        color: '#4a4a6a',
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

      {showCreateModal && (
        <CreateCompanyModal
          onConfirm={handleCreateCompany}
          onCancel={() => {
            setShowCreateModal(false);
            setPendingTableId(null);
          }}
        />
      )}
    </div>
  );
}
