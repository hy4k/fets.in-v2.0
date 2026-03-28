import { Sparkles } from 'lucide-react';

export default function AgentAvatar({ size = 'sm' }) {
  return (
    <div className={`agent-avatar ${size === 'lg' ? 'agent-avatar-lg' : ''}`}>
      <Sparkles
        size={size === 'lg' ? 32 : 20}
        className="text-white relative z-10"
        strokeWidth={2.5}
      />
    </div>
  );
}
