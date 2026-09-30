import TopBar from "@/components/layout/TopBar";
import ChatInterface from "@/components/chat/ChatInterface";

export const metadata = {
  title: "AI Chat — AgriAI",
};

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen bg-transparent">
      <TopBar
        title="AI Chat Assistant"
        subtitle="Powered by Gemini · 9 Agricultural Tools"
      />
      <div className="flex-1 overflow-hidden bg-transparent">
        <ChatInterface />
      </div>
    </div>
  );
}
