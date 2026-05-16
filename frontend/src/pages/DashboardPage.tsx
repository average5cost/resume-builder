import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as resumesApi from '../api/resumes';
import type { Resume } from '../types/resume';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      const data = await resumesApi.listResumes();
      setResumes(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const title = `我的简历 ${resumes.length + 1}`;
    try {
      const r = await resumesApi.createResume(title);
      navigate(`/editor/${r.id}`);
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除这份简历吗？')) return;
    await resumesApi.deleteResume(id);
    setResumes((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="dashboard">
      <header className="dash-header">
        <h1>我的简历</h1>
        <div className="dash-user">
          <span>{user?.username}</span>
          <button onClick={logout} className="btn-link">退出</button>
        </div>
      </header>
      <main className="dash-main">
        {loading ? (
          <p>加载中...</p>
        ) : resumes.length === 0 ? (
          <div className="dash-empty">
            <p>你还没有简历</p>
            <button onClick={handleCreate} className="btn-primary btn-lg">创建第一份简历</button>
          </div>
        ) : (
          <div className="resume-grid">
            {resumes.map((r) => (
              <div key={r.id} className="resume-card">
                <div className="resume-card-preview" onClick={() => navigate(`/editor/${r.id}`)}>
                  <div className="resume-card-icon">📄</div>
                  <h3>{r.title}</h3>
                  <span className="resume-card-meta">更新于 {new Date(r.updated_at).toLocaleDateString('zh-CN')}</span>
                </div>
                <div className="resume-card-actions">
                  <button onClick={() => navigate(`/editor/${r.id}`)} className="btn-sm">编辑</button>
                  <button onClick={() => handleDelete(r.id)} className="btn-sm btn-danger">删除</button>
                </div>
              </div>
            ))}
            <div className="resume-card resume-card-add" onClick={handleCreate}>
              <span className="add-icon">+</span>
              <span>创建新简历</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
