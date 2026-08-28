import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/Chat/ChatWindow';
import { Menu, X } from 'lucide-react';

const ChatPage = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 65px)',
      width: '100vw',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Desktop & Mobile Sidebar */}
      <div style={{
        display: 'block',
        height: '100%',
      }}>
        <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      </div>

      {/* Main Chat Content Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <ChatWindow />
      </div>
    </div>
  );
};

export default ChatPage;
