import { useState } from 'react';
import { extractTextFromPDF } from '../../utils/pdfExtractor';
import { parseResumeFromText, type ParsedResumeData } from '../../utils/resumeParser';

interface Props {
  onDataParsed: (data: ParsedResumeData) => void;
  onClose: () => void;
}

export default function PDFImport({ onDataParsed, onClose }: Props) {
  const [status, setStatus] = useState<'idle' | 'parsing' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFile = async (file: File) => {
    setStatus('parsing');
    setMessage('正在提取 PDF 文本...');
    try {
      const text = await extractTextFromPDF(file);
      setMessage('正在解析简历内容...');
      const parsed = parseResumeFromText(text);
      setStatus('done');
      setMessage('解析完成！正在填充字段...');
      setTimeout(() => onDataParsed(parsed), 300);
    } catch {
      setStatus('error');
      setMessage('PDF 解析失败，请检查文件是否为有效的文字型 PDF');
    }
  };

  return (
    <div className="pdf-import-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pdf-import-dialog">
        <h3>从 PDF 导入简历</h3>
        <p>上传一份 PDF 简历，系统将自动提取文本并填充到对应模块。</p>
        <p style={{ fontSize: '13px', color: '#888' }}>
          支持中文和英文简历，解析结果可能不完全准确，请人工核对。
        </p>
        {status === 'idle' && (
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        )}
        {status === 'parsing' && (
          <div className="status-message" style={{ background: '#fffbe6', color: '#b37400' }}>
            {message}
          </div>
        )}
        {status === 'done' && (
          <div className="status-message" style={{ background: '#e6ffe6', color: '#2d7d2d' }}>
            {message}
          </div>
        )}
        {status === 'error' && (
          <div className="status-message" style={{ background: '#ffe6e6', color: '#c33' }}>
            {message}
          </div>
        )}
        <button onClick={onClose} className="btn-sm" style={{ marginTop: '16px', width: '100%' }}>
          关闭
        </button>
      </div>
    </div>
  );
}
