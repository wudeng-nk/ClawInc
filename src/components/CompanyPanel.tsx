import { useEffect, useRef, useState } from 'react';
import { useParkStore } from '../store/useParkStore';
import HireAgentModal from './HireAgentModal';

interface AgentPos {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function CompanyPanel() {
  const { selectedTableId, companies, agents, tables, setView, createAgent, removeAgent } = useParkStore();
  const [showHireModal, setShowHireModal] = useState(false);
  const [fireMode, setFireMode] = useState(false);
  const [selectedForFire, setSelectedForFire] = useState<string | null>(null);
  const ceoAreaRef = useRef<HTMLDivElement>(null);
  const agentRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [agentPositions, setAgentPositions] = useState<AgentPos[]>([]);

  const table = tables.find(t => t.id === selectedTableId);
  const company = table?.companyId ? companies.find(c => c.id === table.companyId) : null;
  const ceo = company ? agents.find(a => a.id === company.ceoId) : null;
  const companyAgents = company ? agents.filter(a => a.companyId === company.id) : [];
  const nonCeoAgents = companyAgents.filter(a => a.role !== 'CEO');

  useEffect(() => {
    const timer = setTimeout(() => {
      const positions: AgentPos[] = [];
      if (ceoAreaRef.current) {
        const rect = ceoAreaRef.current.getBoundingClientRect();
        positions.push({ id: ceo?.id ?? '', x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: rect.width, height: rect.height });
      }
      nonCeoAgents.forEach(agent => {
        const el = agentRefs.current.get(agent.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          positions.push({ id: agent.id, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, width: rect.width, height: rect.height });
        }
      });
      setAgentPositions(positions);
    }, 60);
    return () => clearTimeout(timer);
  }, [companyAgents.length, company?.id]);

  useEffect(() => {
    return () => { setFireMode(false); setSelectedForFire(null); };
  }, [company?.id]);

  if (!company) return null;

  const ceoPos = agentPositions.find(p => p.id === ceo?.id);
  const panelEl = document.querySelector('.company-panel-body') as HTMLElement;
  const panelRect = panelEl ? panelEl.getBoundingClientRect() : { left: 0, top: 0 };
  const toLocalX = (absX: number) => absX - panelRect.left;
  const toLocalY = (absY: number) => absY - panelRect.top;
  const statusLabel = (s: string) => s === 'thinking' ? '思考中' : s === 'idle' ? '空闲' : '离线';
  const dotBg = (s: string) => s === 'thinking' ? '#60aaff' : s === 'idle' ? '#4ade80' : '#555';
  const dotEl = (agentId: string, status: string) => (
    <div key={agentId} className={`agent-status-dot ${status}`} style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, flexShrink: 0 }}>
      {status === 'thinking' && <div className="ripple-ring" />}
      <div className="status-core" style={{ width: '100%', height: '100%', borderRadius: '50%', background: dotBg(status), position: 'relative', zIndex: 1 }} />
    </div>
  );

  const handleHireConfirm = (name: string, role: string, avatar: string) => {
    createAgent(company.id, { name, role, avatar });
    setShowHireModal(false);
  };
  const selectedAgent = selectedForFire ? companyAgents.find(a => a.id === selectedForFire) : null;
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a14', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif', color: '#e0e0f0', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 28px', borderBottom: '1px solid #1e1e3a', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={() => { setView('park'); setFireMode(false); setSelectedForFire(null); }}
          style={{ background: 'transparent', border: '1px solid #3a3a6c', borderRadius: 8, color: '#a0a0c0', padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>
          ← 返回园区
        </button>
        <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
          <button onClick={() => { setShowHireModal(true); setFireMode(false); }}
            style={{ padding: '8px 16px', background: '#1a2a4a', border: '1px solid #3a6aff', borderRadius: 8, color: '#60aaff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            + 入职
          </button>
          <button onClick={() => {
            if (nonCeoAgents.length === 0) { setFireMode(true); setTimeout(() => setFireMode(false), 1000); }
            else { setFireMode(true); setSelectedForFire(null); }
          }}
            style={{ padding: '8px 16px', background: fireMode ? '#2a1a1a' : 'transparent',
              border: `1px solid ${fireMode ? '#ff4a4a' : '#4a3a6c'}`, borderRadius: 8,
              color: fireMode ? '#ff6a6a' : '#a06060', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            {fireMode ? '✕ 退出选择' : '− 解雇'}
          </button>
        </div>
        <div style={{ marginLeft: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{company.name}</div>
          <div style={{ fontSize: 12, color: '#6a6a9a', marginTop: 2 }}>成立于 {new Date(company.createdAt).toLocaleDateString('zh-CN')}</div>
        </div>
      </div>

      {fireMode && (
        <div style={{ background: '#1a0a0a', borderBottom: '1px solid #3a1a1a', padding: '8px 28px', fontSize: 13, color: '#ff8080', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>🔥</span>
          {nonCeoAgents.length === 0 ? '无可解雇成员' : '选择一名成员进行解雇（CEO不可解雇）'}
        </div>
      )}

      {/* Body */}
      <div className="company-panel-body" style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Sidebar */}
        <div style={{ width: 260, borderRight: '1px solid #1e1e3a', padding: '20px 0', overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ padding: '0 20px 12px', fontSize: 11, fontWeight: 600, color: '#5a5a8a', letterSpacing: 1, textTransform: 'uppercase' }}>
            成员列表 ({companyAgents.length})
          </div>

          {/* CEO */}
          <div ref={ceoAreaRef} style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12, opacity: fireMode ? 0.4 : 1 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 28, lineHeight: 1, filter: ceo?.status === 'offline' ? 'grayscale(1)' : 'none', opacity: ceo?.status === 'offline' ? 0.5 : 1 }}>{ceo?.avatar}</div>
              {ceo && dotEl(ceo.id, ceo.status)}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                {ceo?.role === 'CEO' && <span style={{ fontSize: 10 }}>👑</span>}
                {ceo?.name}
              </div>
              <div style={{ fontSize: 11, color: '#6a6a9a' }}>{ceo?.role} · {ceo ? statusLabel(ceo.status) : ''}</div>
            </div>
          </div>

          {/* Non-CEO agents */}
          {nonCeoAgents.map((agent) => {
            const isSelected = selectedForFire === agent.id;
            return (
              <div key={agent.id}
                ref={(el) => { if (el) agentRefs.current.set(agent.id, el); }}
                onClick={() => { if (fireMode) setSelectedForFire(agent.id); }}
                style={{
                  padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12,
                  cursor: fireMode ? 'pointer' : 'default',
                  background: isSelected ? 'rgba(255,60,60,0.12)' : 'transparent',
                  borderLeft: isSelected ? '3px solid #ff4a4a' : '3px solid transparent',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => { if (fireMode && !isSelected) e.currentTarget.style.background = 'rgba(255,60,60,0.08)'; }}
                onMouseLeave={(e) => { if (fireMode && !isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ position: 'relative' }}>
                  <div style={{ fontSize: 28, lineHeight: 1, filter: agent.status === 'offline' ? 'grayscale(1)' : 'none', opacity: agent.status === 'offline' ? 0.5 : 1 }}>{agent.avatar}</div>
                  {dotEl(agent.id, agent.status)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{agent.name}</div>
                  <div style={{ fontSize: 11, color: '#6a6a9a' }}>{agent.role} · {statusLabel(agent.status)}</div>
                </div>
              </div>
            );
          })}
        </div>
        {/* SVG connection lines */}
        {ceoPos && nonCeoAgents.length > 0 && (
          <svg style={{ position: 'absolute', left: 260, top: 0, width: 'calc(100% - 260px)', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
            <defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><polygon points="0 0, 6 3, 0 6" fill="#4a4a8a" /></marker></defs>
            {agentPositions.filter(p => p.id !== ceo?.id).map(targetPos => {
              const x1 = toLocalX(ceoPos.x) + ceoPos.width / 2;
              const y1 = toLocalY(ceoPos.y);
              const x2 = toLocalX(targetPos.x) - targetPos.width / 2;
              const y2 = toLocalY(targetPos.y);
              const cx1 = x1 + 60;
              const cx2 = x2 - 60;
              return (
                <g key={targetPos.id}>
                  <path d={`M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`} stroke="rgba(80,80,200,0.15)" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path className="connection-line" d={`M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`} stroke="#4a4a8a" strokeWidth="1.5" strokeDasharray="6 4" fill="none" strokeLinecap="round" markerEnd="url(#arrowhead)" />
                </g>
              );
            })}
          </svg>
        )}

        {/* Stats Area */}
        <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>公司概况</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[{ label: '沟通摘要', value: '—', color: '#60aaff' }, { label: '任务量', value: '0', color: '#a78bfa' }, { label: '活跃度', value: '—', color: '#4ade80' }, { label: '每日进展', value: '—', color: '#fb923c' }].map(stat => (
              <div key={stat.label} style={{ background: '#12122a', border: '1px solid #1e1e3a', borderRadius: 12, padding: '20px 24px' }}>
                <div style={{ fontSize: 11, color: '#5a5a8a', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{stat.label}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Org chart */}
          <div style={{ marginTop: 32 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#6a6a9a' }}>公司架构</div>
            <div style={{ background: '#0d0d20', border: '1px solid #1e1e3a', borderRadius: 12, minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0', overflow: 'hidden', position: 'relative' }}>
              {companyAgents.length === 1 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 40 }}>{ceo?.avatar}</div>
                  <div style={{ color: '#6a6a9a', fontSize: 13 }}>{ceo?.name} <span style={{ color: '#4a4a7a' }}>(CEO)</span></div>
                  <div style={{ color: '#3a3a5a', fontSize: 11 }}>暂无其他成员</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                    <div style={{ fontSize: 36 }}>{ceo?.avatar}</div>
                    <div style={{ fontSize: 12, color: '#8a8ab0' }}>{ceo?.name}</div>
                    <div style={{ fontSize: 10, color: '#4a4a7a' }}>CEO</div>
                  </div>
                  {nonCeoAgents.length > 0 && (
                    <div style={{ width: Math.max(80, nonCeoAgents.length * 90), height: 2, background: '#3a3a6a', borderRadius: 1, position: 'relative' }}>
                      {nonCeoAgents.map((agent, i) => (
                        <div key={agent.id} style={{ position: 'absolute', top: 0, left: `${((i + 0.5) / nonCeoAgents.length) * 100}%`, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: 2, height: 12, background: '#3a3a6a' }} />
                          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <div style={{ fontSize: 28 }}>{agent.avatar}</div>
                            <div style={{ fontSize: 10, color: '#8a8ab0', textAlign: 'center', maxWidth: 72, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.name}</div>
                            <div style={{ fontSize: 9, color: '#4a4a7a' }}>{agent.role}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fire confirmation modal */}
      {selectedAgent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedForFire(null); }}>
          <div style={{ background: '#12122a', border: '1px solid #3a1a1a', borderRadius: 16, padding: '28px 32px', width: 340, textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.6)', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{selectedAgent.avatar}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#e0e0f0', marginBottom: 8 }}>{selectedAgent.name}</div>
            <div style={{ fontSize: 13, color: '#6a6a9a', marginBottom: 24 }}>{selectedAgent.role}</div>
            <div style={{ fontSize: 14, color: '#ff8080', marginBottom: 24, padding: '12px 16px', background: '#1a0808', borderRadius: 8, border: '1px solid #3a1a1a' }}>确认解雇此成员？此操作不可撤销。</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setSelectedForFire(null)} style={{ padding: '10px 24px', background: 'transparent', border: '1px solid #3a3a6c', borderRadius: 8, color: '#a0a0c0', fontSize: 14, cursor: 'pointer' }}>取消</button>
              <button onClick={() => { removeAgent(selectedAgent.id); setSelectedForFire(null); setFireMode(false); }}
                style={{ padding: '10px 24px', background: '#cc3030', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>确认解雇</button>
            </div>
          </div>
        </div>
      )}

      {/* Hire modal */}
      {showHireModal && <HireAgentModal onConfirm={handleHireConfirm} onCancel={() => setShowHireModal(false)} />}

      <style>{`.connection-line { animation: flowLine 2s linear infinite; } @keyframes flowLine { from { stroke-dashoffset: 20; } to { stroke-dashoffset: 0; } }`}</style>
    </div>
  );
}
