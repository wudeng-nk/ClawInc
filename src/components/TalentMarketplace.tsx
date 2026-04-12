import { useState, useMemo, useEffect } from 'react';
import { useParkStore } from '../store/useParkStore';
import type { MarketAgent } from '../types';
import { fetchOpenClawAgents, type OpenClawAgentConfig } from '../utils/openclawAgents';
import RecruitAgentModal from './RecruitAgentModal';
import HireAgentModal from './HireAgentModal';

const ROLES = ['全部', 'CEO', 'CTO', '产品', '设计', '运营', '市场', 'HR', '工程师', '其他'];

function StatusDot({ status }: { status: string }) {
  const color = status === 'thinking' ? '#60aaff' : status === 'idle' ? '#4ade80' : '#555';
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color, marginLeft: 6 }} />;
}

function SkillTag({ skill }: { skill: string }) {
  return <span style={{ display: 'inline-block', padding: '2px 8px', background: '#1e2a4a', border: '1px solid #3a5aff', borderRadius: 12, fontSize: 11, color: '#60aaff', marginRight: 4, marginBottom: 4 }}>{skill}</span>;
}

/** Convert an OpenClaw agent config into a MarketAgent for display in the talent market. */
function openClawAgentToMarketAgent(oc: OpenClawAgentConfig): MarketAgent {
  return {
    id: oc.id,
    name: oc.identityName,
    role: 'AI Agent',
    avatar: oc.identityEmoji,
    status: 'idle',
    companyId: null,
    isCeo: false,
    bio: `模型: ${oc.model}`,
    skills: [oc.workspace],
    openclawWorkspace: oc.workspace,
  };
}

export default function TalentMarketplace() {
  const { agents, companies, setView } = useParkStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('全部');
  const [statusFilter, setStatusFilter] = useState<'all'|'available'|'hired'>('all');
  const [showRecruit, setShowRecruit] = useState(false);
  const [showHire, setShowHire] = useState(false);
  const [detailAgent, setDetailAgent] = useState<MarketAgent|null>(null);

  // OpenClaw agents fetched from the OpenClaw config
  const [openclawAgents, setOpenclawAgents] = useState<OpenClawAgentConfig[]>([]);
  const [loadingOc, setLoadingOc] = useState(true);

  useEffect(() => {
    fetchOpenClawAgents().then(agents => {
      setOpenclawAgents(agents);
      setLoadingOc(false);
    });
  }, []);

  const marketAgents = useMemo<MarketAgent[]>(() => {
    // ClawInc's own agents
    const clawincAgents: MarketAgent[] = agents.map(a => {
      const co = companies.find(c => c.id === a.companyId);
      return { ...a, companyName: co?.name };
    });

    // OpenClaw agents — only add ones not already tracked in ClawInc
    const clawincIds = new Set(agents.map(a => a.id));
    const ocMarketAgents = openclawAgents
      .filter(oc => !clawincIds.has(oc.id))
      .map(openClawAgentToMarketAgent);

    return [...clawincAgents, ...ocMarketAgents];
  }, [agents, companies, openclawAgents]);

  const filtered = useMemo(() => {
    return marketAgents.filter(a => {
      const matchSearch = !search ||
        a.name.includes(search) ||
        (a.bio && a.bio.includes(search)) ||
        (a.skills && a.skills.some(s => s.includes(search)));
      const matchRole = roleFilter === '全部' || a.role === roleFilter;
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'available' && !a.companyId) ||
        (statusFilter === 'hired' && !!a.companyId);
      return matchSearch && matchRole && matchStatus;
    });
  }, [marketAgents, search, roleFilter, statusFilter]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a14', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif', color: '#e0e0f0', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 28px', borderBottom: '1px solid #1e1e3a', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={() => setView('park')} style={{ background: 'transparent', border: '1px solid #3a3a6c', borderRadius: 8, color: '#a0a0c0', padding: '8px 16px', fontSize: 13, cursor: 'pointer' }}>← 返回园区</button>
        <div style={{ marginLeft: 8 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>人才市场</div>
          <div style={{ fontSize: 12, color: '#6a6a9a', marginTop: 2 }}>
            共 {marketAgents.length} 人 · 待业 {marketAgents.filter((a: MarketAgent) => !a.companyId).length}
            {!loadingOc && <span style={{ color: '#4a6a9a' }}>（OpenClaw {openclawAgents.length} 人）</span>}
          </div>
        </div>
        <button onClick={() => setShowRecruit(true)} style={{ marginLeft: 'auto', padding: '8px 20px', background: '#1a3a2a', border: '1px solid #4ade80', borderRadius: 8, color: '#4ade80', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ 招聘人才</button>
      </div>

      {/* Filters */}
      <div style={{ padding: '12px 28px', borderBottom: '1px solid #1a1a2e', display: 'flex', gap: 12, flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索姓名、能力..." style={{ padding: '8px 14px', background: '#12122a', border: '1px solid #3a3a6c', borderRadius: 8, color: '#e0e0f0', fontSize: 13, width: 200, outline: 'none' }} />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding: '8px 12px', background: '#12122a', border: '1px solid #3a3a6c', borderRadius: 8, color: '#e0e0f0', fontSize: 13, outline: 'none', cursor: 'pointer' }}>{ROLES.map(r => <option key={r}>{r}</option>)}</select>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all','全部'] as [string,string][]).map(([v,label]) => (
            <button key={v} onClick={() => setStatusFilter(v as any)} style={{ padding: '6px 14px', background: statusFilter === v ? '#2a2a5a' : 'transparent', border: '1px solid ' + (statusFilter === v ? '#6a6aff' : '#3a3a6c'), borderRadius: 6, color: statusFilter === v ? '#a0a0ff' : '#6a6a9a', fontSize: 12, cursor: 'pointer' }}>{label}</button>
          ))}
          {(['available','待业'] as [string,string][]).map(([v,label]) => (
            <button key={v} onClick={() => setStatusFilter(v as any)} style={{ padding: '6px 14px', background: statusFilter === v ? '#2a2a5a' : 'transparent', border: '1px solid ' + (statusFilter === v ? '#6a6aff' : '#3a3a6c'), borderRadius: 6, color: statusFilter === v ? '#a0a0ff' : '#6a6a9a', fontSize: 12, cursor: 'pointer' }}>{label}</button>
          ))}
          {(['hired','在职'] as [string,string][]).map(([v,label]) => (
            <button key={v} onClick={() => setStatusFilter(v as any)} style={{ padding: '6px 14px', background: statusFilter === v ? '#2a2a5a' : 'transparent', border: '1px solid ' + (statusFilter === v ? '#6a6aff' : '#3a3a6c'), borderRadius: 6, color: statusFilter === v ? '#a0a0ff' : '#6a6a9a', fontSize: 12, cursor: 'pointer' }}>{label}</button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 12, color: '#4a4a7a' }}>显示 {filtered.length} 人</div>
      </div>

      {/* Agent Grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
        {loadingOc && (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#4a4a7a', fontSize: 13 }}>
            正在从 OpenClaw 配置加载人才...
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map((agent: MarketAgent) => {
            const isOpenClaw = !!agent.openclawWorkspace;
            return (
              <div key={agent.id} style={{ background: '#12122a', border: '1px solid ' + (isOpenClaw ? '#2a3a4a' : agent.companyId ? '#2a2a4a' : '#2a3a2a'), borderRadius: 12, padding: '20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ fontSize: 36, lineHeight: 1 }}>{agent.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {agent.name}
                      {agent.isCeo && <span style={{ fontSize: 10, background: '#3a2a00', border: '1px solid #ffb800', borderRadius: 4, padding: '1px 5px', color: '#ffb800' }}>👑 CEO</span>}
                      {isOpenClaw && <span style={{ fontSize: 10, background: '#1a2a3a', border: '1px solid #60aaff', borderRadius: 4, padding: '1px 5px', color: '#60aaff' }}>🌐 OpenClaw</span>}
                      <StatusDot status={agent.status} />
                    </div>
                    <div style={{ fontSize: 12, color: '#6a6a9a', marginTop: 2 }}>{agent.role}</div>
                    <div style={{ fontSize: 11, color: agent.companyId ? '#60aaff' : '#4ade80', marginTop: 2 }}>
                      {agent.companyId ? '在职 · ' + (agent.companyName ?? '未知公司') : '🟢 待业'}
                    </div>
                  </div>
                </div>
                {agent.bio && <div style={{ fontSize: 12, color: '#8a8ab0', lineHeight: 1.5, borderTop: '1px solid #1e1e3a', paddingTop: 8 }}>{agent.bio}</div>}
                {agent.skills && agent.skills.length > 0 && (
                  <div style={{ borderTop: '1px solid #1e1e3a', paddingTop: 8, display: 'flex', flexWrap: 'wrap', gap: 0 }}>
                    {agent.skills.map((s: string) => <SkillTag key={s} skill={s} />)}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button onClick={() => setDetailAgent(agent)} style={{ flex: 1, padding: '7px', background: 'transparent', border: '1px solid #3a3a6c', borderRadius: 6, color: '#a0a0c0', fontSize: 12, cursor: 'pointer' }}>查看详情</button>
                  {!agent.companyId && !agent.isCeo && <button onClick={() => setShowHire(true)} style={{ flex: 1, padding: '7px', background: '#1a2a4a', border: '1px solid #3a6aff', borderRadius: 6, color: '#60aaff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>入职</button>}
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && !loadingOc && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#4a4a7a' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <div>没有找到符合条件的人才</div>
            <button onClick={() => setShowRecruit(true)} style={{ marginTop: 16, padding: '8px 20px', background: '#1a3a2a', border: '1px solid #4ade80', borderRadius: 8, color: '#4ade80', fontSize: 13, cursor: 'pointer' }}>发布招聘</button>
          </div>
        )}
      </div>

      {showRecruit && <RecruitAgentModal onClose={() => setShowRecruit(false)} />}
      {showHire && <HireAgentModal onClose={() => setShowHire(false)} />}

      {/* Detail Modal */}
      {detailAgent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={e => { if (e.target === e.currentTarget) setDetailAgent(null); }}>
          <div style={{ background: '#12122a', border: '1px solid #3a3a6c', borderRadius: 16, padding: '32px', width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 48 }}>{detailAgent.avatar}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{detailAgent.name}</div>
                <div style={{ fontSize: 13, color: '#6a6a9a' }}>{detailAgent.role}</div>
                <div style={{ fontSize: 12, color: detailAgent.companyId ? '#60aaff' : '#4ade80', marginTop: 2 }}>{detailAgent.companyId ? (detailAgent.companyName ?? '未知公司') : '🟢 待业中'}</div>
              </div>
            </div>
            {detailAgent.bio && <div style={{ fontSize: 13, color: '#c0c0e0', lineHeight: 1.6, marginBottom: 16, padding: '12px 16px', background: '#0d0d20', borderRadius: 8 }}>{detailAgent.bio}</div>}
            {detailAgent.skills && <div style={{ marginBottom: 20 }}><div style={{ fontSize: 11, color: '#5a5a8a', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>能力</div><div style={{ display: 'flex', flexWrap: 'wrap', gap: 0 }}>{detailAgent.skills.map((s: string) => <SkillTag key={s} skill={s} />)}</div></div>}
            {detailAgent.openclawWorkspace && (
              <div style={{ marginBottom: 16, padding: '8px 12px', background: '#0d1a2a', borderRadius: 8, border: '1px solid #1a3a5a' }}>
                <div style={{ fontSize: 11, color: '#5a7a9a', marginBottom: 4 }}>OpenClaw Workspace</div>
                <div style={{ fontSize: 12, color: '#60aaff', wordBreak: 'break-all' }}>{detailAgent.openclawWorkspace}</div>
              </div>
            )}
            <div style={{ fontSize: 11, color: '#4a4a7a', textAlign: 'center' }}>ID: {detailAgent.id}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button onClick={() => setDetailAgent(null)} style={{ flex: 1, padding: '10px', background: 'transparent', border: '1px solid #3a3a6c', borderRadius: 8, color: '#a0a0c0', fontSize: 13, cursor: 'pointer' }}>关闭</button>
              {!detailAgent.companyId && !detailAgent.isCeo && <button onClick={() => { setDetailAgent(null); setShowHire(true); }} style={{ flex: 1, padding: '10px', background: '#1a2a4a', border: '1px solid #3a6aff', borderRadius: 8, color: '#60aaff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>邀请入职</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
