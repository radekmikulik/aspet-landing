'use client';
import { useState, useEffect } from 'react';
import { Client, clientsStore } from '@/lib/clients.storage';
import { 
  MessageThread, 
  MessageItem,
  messagesStorage, 
  showToast 
} from '@/lib/messages.storage';

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMessageSent?: (threadId: string) => void;
  preselectedClientId?: string; // Pro předvyplnění z clients stránky
}

export default function NewMessageModal({ 
  isOpen, 
  onClose, 
  onMessageSent, 
  preselectedClientId 
}: NewMessageModalProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Load clients
  useEffect(() => {
    if (isOpen) {
      const allClients = clientsStore.getAll().filter(c => c.status === 'active');
      setClients(allClients);
      setFilteredClients(allClients);
      
      // Preselect client if provided
      if (preselectedClientId) {
        setSelectedClientId(preselectedClientId);
      }
    }
  }, [isOpen, preselectedClientId]);

  // Filter clients based on search
  useEffect(() => {
    if (!clientSearchTerm.trim()) {
      setFilteredClients(clients);
    } else {
      const searchTerm = clientSearchTerm.toLowerCase();
      setFilteredClients(
        clients.filter(client => 
          client.name.toLowerCase().includes(searchTerm) ||
          (client.email && client.email.toLowerCase().includes(searchTerm)) ||
          (client.phone && client.phone.toLowerCase().includes(searchTerm))
        )
      );
    }
  }, [clientSearchTerm, clients]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedClientId('');
      setClientSearchTerm('');
      setSubject('');
      setMessage('');
      setIsSending(false);
    }
  }, [isOpen]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!selectedClientId || !subject.trim() || !message.trim() || isSending) {
      return;
    }

    setIsSending(true);

    try {
      // Create new thread
      const newThread: MessageThread = {
        id: '',
        clientId: selectedClientId,
        subject: subject.trim(),
        lastUpdatedAt: new Date().toISOString(),
        unreadForProvider: 0,
        status: 'open',
        messages: []
      };

      // Save thread
      messagesStorage.upsert(newThread);
      
      // Get the saved thread with generated ID
      const savedThreads = messagesStorage.getAll();
      const savedThread = savedThreads.find(t => 
        t.clientId === selectedClientId && 
        t.subject === subject.trim()
      );

      if (savedThread) {
        // Add first message
        const firstMessage: MessageItem = {
          id: '',
          author: 'provider',
          text: message.trim(),
          createdAt: new Date().toISOString(),
          read: true
        };

        messagesStorage.appendMessage(savedThread.id, firstMessage);
        
        showToast('Zpráva odeslána', 'success');
        
        // Notify parent component
        if (onMessageSent) {
          onMessageSent(savedThread.id);
        }
        
        onClose();
      } else {
        throw new Error('Failed to create thread');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      showToast('Chyba při odesílání zprávy', 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Get selected client info
  const selectedClient = clients.find(c => c.id === selectedClientId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Nová zpráva</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Client Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Klient *
            </label>
            
            {/* Search for clients */}
            <div className="mb-3">
              <input
                type="text"
                placeholder="Hledat klienta podle jména, emailu, telefonu..."
                value={clientSearchTerm}
                onChange={(e) => setClientSearchTerm(e.target.value)}
                className="w-full rounded-md border border-[#C8D6CF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8D6CF]"
              />
            </div>

            {/* Client list */}
            <div className="border border-[#C8D6CF] rounded-md max-h-40 overflow-y-auto">
              {filteredClients.length === 0 ? (
                <div className="p-3 text-sm text-gray-500 text-center">
                  {clients.length === 0 ? 'Žádní aktivní klienti' : 'Žádní klienti nenalezeni'}
                </div>
              ) : (
                filteredClients.map((client) => (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClientId(client.id)}
                    className={`p-3 cursor-pointer hover:bg-[#F5F7F6] border-b border-[#E7EFEA] last:border-b-0 ${
                      selectedClientId === client.id ? 'bg-[#E7EFEA]' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="client"
                        checked={selectedClientId === client.id}
                        onChange={() => setSelectedClientId(client.id)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {client.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {client.email && <span>{client.email}</span>}
                          {client.email && client.phone && <span> • </span>}
                          {client.phone && <span>{client.phone}</span>}
                        </div>
                        {client.tags && client.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {client.tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Selected client confirmation */}
            {selectedClient && (
              <div className="mt-2 p-2 bg-[#E7EFEA] rounded-md">
                <div className="text-sm">
                  <span className="font-medium">Vybraný klient:</span> {selectedClient.name}
                </div>
              </div>
            )}
          </div>

          {/* Subject */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Předmět *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Zadejte předmět zprávy..."
              className="w-full rounded-md border border-[#C8D6CF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8D6CF]"
            />
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zpráva *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Napište svou zprávu..."
              rows={4}
              className="w-full rounded-md border border-[#C8D6CF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8D6CF] resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isSending}
              className="rounded-md border border-[#C8D6CF] bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-[#E7EFEA] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Zrušit
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!selectedClientId || !subject.trim() || !message.trim() || isSending}
              className="rounded-md bg-[#2F4B40] px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Odesílám...
                </>
              ) : (
                'Odeslat'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}