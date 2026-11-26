import { Check, FileText, Image as ImageIcon, UploadCloud } from "lucide-react";

export function AuthIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`auth-illustration ${className}`} aria-hidden="true">
      <div className="auth-orbit auth-orbit-one" />
      <div className="auth-orbit auth-orbit-two" />
      <div className="auth-paper auth-paper-left">
        <FileText size={28} />
        <span /><span />
        <i><ImageIcon size={22} /></i>
      </div>
      <div className="auth-paper auth-paper-right">
        <ImageIcon size={32} />
        <span /><span />
      </div>
      <div className="auth-file-card">
        <div className="auth-file-glow" />
        <div className="auth-file-window">
          <span className="auth-file-topline" />
          <UploadCloud className="auth-upload-icon" size={55} strokeWidth={1.5} />
          <div className="auth-file-lines"><span /><span /></div>
        </div>
        <span className="auth-file-check"><Check size={24} strokeWidth={3} /></span>
      </div>
      <span className="auth-spark auth-spark-one" />
      <span className="auth-spark auth-spark-two" />
      <span className="auth-spark auth-spark-three" />
    </div>
  );
}
