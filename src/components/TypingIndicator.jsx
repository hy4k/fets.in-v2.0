import AgentAvatar from './AgentAvatar';

export default function TypingIndicator() {
  return (
    <div className="typing-indicator">
      <AgentAvatar />
      <div className="typing-dots">
        <div className="typing-dot" />
        <div className="typing-dot" />
        <div className="typing-dot" />
      </div>
    </div>
  );
}
