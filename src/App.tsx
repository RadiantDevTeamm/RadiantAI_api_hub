import { useState } from 'react';
import { SavedModelsProvider } from '@/hooks/useSavedModels';
import { ConversationsProvider, useConversations } from '@/hooks/useConversations';
import { useTheme } from '@/hooks/useTheme';
import { Header } from '@/components/Header';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { AddKeyModal } from '@/components/chat/AddKeyModal';
import { HistoryDrawer } from '@/components/chat/HistoryDrawer';
import { SettingsModal } from '@/components/SettingsModal';

function AppInner() {
  const { theme } = useTheme();
  const { setActiveId } = useConversations();
  const [activeTab, setActiveTab] = useState<'history' | 'chat'>('chat');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [addKeyOpen, setAddKeyOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleTabChange = (tab: 'history' | 'chat') => {
    if (tab === 'history') {
      setHistoryOpen(true);
    } else {
      setHistoryOpen(false);
      setActiveTab('chat');
    }
  };

  const handleNewChat = () => {
    setActiveId(null);
    setActiveTab('chat');
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-bg text-text">
      <Header
        theme={theme}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <main className="flex-1 overflow-hidden">
        <ChatPanel />
      </main>
      <HistoryDrawer
        open={historyOpen}
        onClose={() => {
          setHistoryOpen(false);
          setActiveTab('chat');
        }}
        onNewChat={handleNewChat}
      />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onAddKey={() => setAddKeyOpen(true)}
      />
      <AddKeyModal open={addKeyOpen} onClose={() => setAddKeyOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <SavedModelsProvider>
      <ConversationsProvider>
        <AppInner />
      </ConversationsProvider>
    </SavedModelsProvider>
  );
}
