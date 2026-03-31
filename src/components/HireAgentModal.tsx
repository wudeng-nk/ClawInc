import { useState, useMemo } from 'react';
import { useParkStore } from '../store/useParkStore';
import type { MarketAgent } from '../types';

function StatusDot({ status }: { status: string }) {
  const color = status === 'thinking' ? '#60aaff' : status === 'idle' ? '#4ade80' : '#555';
  return <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: color }} />;
}

interface Props {
  companyId: string;
  onClose: () => void;
}

export default function HireAgentModal({ companyId, onClose }: Props) {
  const { agents, companies, hireAgent, setView } = useParkStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const company = companies.find(c => c.id === companyId);

  const availableAgents = useMemo<MarketAgent[]>(() => {
    return agents
      .filter(a => !a.companyId && !a.isCeo)
      .map(a => ({ ...a, companyName: undefined }));
  }, [agents]);

  const handleConfirm = async () => {
    if (!selected) { setError('请选择一名候选人'); return; }
    setLoading(true);
    setError('');
    try {
      await hireAgent(selected, companyId);
      onClose();
      setView('company');
    } catch (err) {
      setError('入职失败: ' + String(err));
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, fontFamily: 'system-ui, sans-serif' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#12122a', border: '1px solid #3a3a6c', borderRadius: 16, padding: '28px 32px', width: 480, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#e0e0f0' }}>选择入职员工</div>
          <div style={{ fontSize: 12, color: '#6a6a9a', marginTop: 2 }}>为 {company?.name ?? '公司'} 招聘成员 · 待业人才 {availableAgents.length} 人</div>
        </div>

        {availableAgents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#4a4a7a', flex: 1 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div>暂无待业人才</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>可前往人才市场招聘新人</div>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 320 }}>
            {availableAgents.map(agent => (
              <div key={agent.id} onClick={() => setSelected(agent.id)} style={{ padding: '12px 16px', background: selected === agent.id ? '#1a2a4a' : '#0d0d20', border: '1px solid ' + (selected === agent.id ? '#3a6aff' : '#2a2a4a'), borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s' }}>
                <div style={{ fontSize: 28 }}>{agent.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {agent.name}
                    <StatusDot status={agent.status} />
                  </div>
                  <div style={{ fontSize: 12, color: '#6a6a9a', marginTop: 1 }}>{agent.role}</div>
                  {agent.skills && agent.skills.length > 0 && (
                    <div style={{ fontSize: 11, color: '#60aaff', marginTop: 3 }}>{agent.skills.join(' · ')}</div>
                  )}
                </div>
                {selected === agent.id && <div style={{ color: '#60aaff', fontSize: 18 }}>✓</div>}
              </div>
            ))}
          </div>
        )}

        {error && <div style={{ color: '#ff6666', fontSize: 12, marginTop: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
          <button onClick={onClose} style={{ padding: '9px 20px', background: 'transparent', border: '1px solid #3a3a6c', borderRadius: 8, color: '#a0a0c0', fontSize: 13, cursor: 'pointer' }}>取消</button>
          <button onClick={handleConfirm} disabled={!selected || loading} style={{ padding: '9px 24px', background: selected ? '#1a2a4a' : '#1a1a2a', border: '1px solid ' + (selected ? '#3a6aff' : '#2a2a3a'), borderRadius: 8, color: selected ? '#60aaff' : '#4a4a6a', fontSize: 13, fontWeight: 600, cursor: selected ? 'pointer' : 'not-allowed' }}>{loading ? '入职中...' : '确认入职'}</button>
        </div>
      </div>
    </div>
  );
}
