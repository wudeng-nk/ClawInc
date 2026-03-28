
import { useParkStore } from '../store/useParkStore';

export default function CompanyPanel() {
  const { selectedTableId, companies, agents, tables, setView } = useParkStore();

  const table = tables.find(t => t.id === selectedTableId);
  const company = table?.companyId ? companies.find(c => c.id === table.companyId) : null;
  const ceo = company ? agents.find(a => a.id === company.ceoId) : null;
  const companyAgents = company ? agents.filter(a => a.companyId === company.id) : [];

  if (!company) return null;

  const statusColor = (status: string) =>
    status === 'thinking' ? '#60aaff' : status === 'idle' ? '#4ade80' : '#555';

  const statusLabel = (status: string) =>
    status === 'thinking' ? '思考中' : status === 'idle' ? '空闲' : '离线';

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#0a0a14',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif',
      color: '#e0e0f0',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 28px',
        borderBottom: '1px solid #1e1e3a',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        flexShrink: 0,
      }}>
        <button
          onClick={() => setView('park')}
          style={{
            background: 'transparent',
            border: '1px solid #3a3a6c',
            borderRadius: 8,
            color: '#a0a0c0',
            padding: '8px 16px',
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          ← 返回园区
        </button>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{company.name}</div>
          <div style={{ fontSize: 12, color: '#6a6a9a', marginTop: 2 }}>
            成立于 {new Date(company.createdAt).toLocaleDateString('zh-CN')}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Agent List Sidebar */}
        <div style={{
          width: 260,
          borderRight: '1px solid #1e1e3a',
          padding: '20px 0',
          overflowY: 'auto',
          flexShrink: 0,
        }}>
          <div style={{ padding: '0 20px 12px', fontSize: 11, fontWeight: 600, color: '#5a5a8a', letterSpacing: 1, textTransform: 'uppercase' }}>
            成员列表 ({companyAgents.length})
          </div>

          {companyAgents.map((agent) => (
            <div
              key={agent.id}
              style={{
                padding: '10px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'default',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1a30')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: 28, lineHeight: 1, filter: agent.status === 'offline' ? 'grayscale(1)' : 'none', opacity: agent.status === 'offline' ? 0.5 : 1 }}>
                  {agent.avatar}
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: statusColor(agent.status),
                  border: '2px solid #0a0a14',
                }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {agent.role === 'CEO' && <span title="CEO" style={{ fontSize: 10 }}>👑</span>}
                  {agent.name}
                </div>
                <div style={{ fontSize: 11, color: '#6a6a9a' }}>
                  {agent.role} · {statusLabel(agent.status)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Area */}
        <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>公司概况</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { label: '沟通摘要', value: '—', color: '#60aaff' },
              { label: '任务量', value: '0', color: '#a78bfa' },
              { label: '活跃度', value: '—', color: '#4ade80' },
              { label: '每日进展', value: '—', color: '#fb923c' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  background: '#12122a',
                  border: '1px solid #1e1e3a',
                  borderRadius: 12,
                  padding: '20px 24px',
                }}
              >
                <div style={{ fontSize: 11, color: '#5a5a8a', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Placeholder connection lines area */}
          <div style={{ marginTop: 32 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: '#6a6a9a' }}>公司架构</div>
            <div style={{
              background: '#0d0d20',
              border: '1px dashed #2a2a4a',
              borderRadius: 12,
              height: 160,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3a3a6a',
              fontSize: 13,
            }}>
              {ceo && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 40 }}>{ceo.avatar}</div>
                  <div style={{ color: '#6a6a9a', fontSize: 13 }}>{ceo.name} <span style={{ color: '#4a4a7a' }}>(CEO)</span></div>
                  <div style={{ color: '#3a3a5a', fontSize: 11 }}>连接线占位 · Phase 2 动态显示</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
