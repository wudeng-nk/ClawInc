import { useState, useRef, useEffect } from 'react';
import { useParkStore } from '../store/useParkStore';

const AVATAR_OPTIONS = ['🦁', '🦊', '🐯', '🐺', '🦅', '🐉', '🦅', '🐲', '🦉', '🐰', '🐸', '🐵', '🦄', '🐝', '🦋', '🌟', '🔥', '💎', '🌈', '🎯'];

interface Props {
  onClose: () => void;
}

export default function RecruitAgentModal({ onClose }: Props) {
  const { recruitAgent } = useParkStore();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_OPTIONS[0]);
  const [bio, setBio] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('请输入姓名'); return; }
    if (!role.trim()) { setError('请输入角色'); return; }
    setLoading(true);
    setError('');
    try {
      const skills = skillsInput.split(/[,，、]/).map(s => s.trim()).filter(Boolean);
      await recruitAgent({ name: name.trim(), role: role.trim(), avatar, bio: bio.trim() || undefined, skills: skills.length > 0 ? skills : undefined });
      onClose();
    } catch (err) {
      setError('创建失败: ' + String(err));
      setLoading(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, fontFamily: 'system-ui, sans-serif' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#12122a', border: '1px solid #3a3a6c', borderRadius: 16, padding: '32px', width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#e0e0f0', marginBottom: 6 }}>招聘人才</div>
        <div style={{ fontSize: 13, color: '#6a6a9a', marginBottom: 24 }}>创建一个全新的人才，进入人才市场待选</div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#6a6a9a', marginBottom: 6 }}>姓名 *</div>
            <input ref={nameRef} value={name} onChange={e => { setName(e.target.value); setError(''); }} placeholder="例如：张三" style={{ width: '100%', padding: '10px 12px', background: '#0a0a1e', border: '1px solid ' + (error && !name ? '#ff4444' : '#3a3a6c'), borderRadius: 8, color: '#e0e0f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#6a6a9a', marginBottom: 6 }}>角色 *</div>
            <input value={role} onChange={e => { setRole(e.target.value); setError(''); }} placeholder="例如：产品经理" style={{ width: '100%', padding: '10px 12px', background: '#0a0a1e', border: '1px solid #3a3a6c', borderRadius: 8, color: '#e0e0f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#6a6a9a', marginBottom: 6 }}>头像</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {AVATAR_OPTIONS.map(a => (
                <button type="button" key={a} onClick={() => setAvatar(a)} style={{ width: 36, height: 36, fontSize: 20, background: avatar === a ? '#2a2a5a' : '#0a0a1e', border: '1px solid ' + (avatar === a ? '#6a6aff' : '#3a3a6c'), borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{a}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#6a6a9a', marginBottom: 6 }}>能力（逗号分隔）</div>
            <input value={skillsInput} onChange={e => setSkillsInput(e.target.value)} placeholder="例如：产品设计, 用户研究, 数据分析" style={{ width: '100%', padding: '10px 12px', background: '#0a0a1e', border: '1px solid #3a3a6c', borderRadius: 8, color: '#e0e0f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: '#6a6a9a', marginBottom: 6 }}>个人简介</div>
            <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="简单介绍一下这位人才的背景和专长..." rows={3} style={{ width: '100%', padding: '10px 12px', background: '#0a0a1e', border: '1px solid #3a3a6c', borderRadius: 8, color: '#e0e0f0', fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
          </div>
          {error && <div style={{ color: '#ff6666', fontSize: 12, marginBottom: 12 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #3a3a6c', borderRadius: 8, color: '#a0a0c0', fontSize: 14, cursor: 'pointer' }}>取消</button>
            <button type="submit" disabled={loading} style={{ padding: '10px 24px', background: '#4a4a9a', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>{loading ? '创建中...' : '确认招聘'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
