'use client';

import { useState, useEffect } from 'react';
import { AudienceMode } from '@/lib/offers.storage';
import { clientsStore } from '@/lib/clients.storage';

interface AudiencePickerProps {
  mode: AudienceMode;
  selectedTags: string[];
  selectedClientIds: string[];
  onModeChange: (mode: AudienceMode) => void;
  onTagsChange: (tags: string[]) => void;
  onClientIdsChange: (clientIds: string[]) => void;
}

export default function AudiencePicker({
  mode,
  selectedTags,
  selectedClientIds,
  onModeChange,
  onTagsChange,
  onClientIdsChange
}: AudiencePickerProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [availableClients, setAvailableClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Load available tags and clients
  useEffect(() => {
    const loadData = () => {
      setAvailableTags(clientsStore.getAllTags());
      setAvailableClients(clientsStore.getAll());
    };

    if (typeof window !== 'undefined') {
      loadData();
    }
  }, []);

  // Get current audience display text
  const getAudienceDisplayText = () => {
    switch (mode) {
      case 'PUBLIC':
        return 'Veřejně';
      case 'CLIENTS_ALL':
        return 'Všichni klienti';
      case 'CLIENTS_TAGS':
        return `Klienti s tagy (${selectedTags.length})`;
      case 'CLIENTS_SELECTED':
        return `Vybraní klienti (${selectedClientIds.length})`;
      default:
        return 'Neznámé';
    }
  };

  // Filter clients based on search term
  const filteredClients = availableClients.filter(client => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      (client.email && client.email.toLowerCase().includes(searchLower)) ||
      (client.phone && client.phone.toLowerCase().includes(searchLower))
    );
  });

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    onTagsChange(newTags);
  };

  const handleClientToggle = (clientId: string) => {
    const newClientIds = selectedClientIds.includes(clientId)
      ? selectedClientIds.filter(id => id !== clientId)
      : [...selectedClientIds, clientId];
    onClientIdsChange(newClientIds);
  };

  return (
    <div className="space-y-6">
      {/* Audience Chip */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-[#2F4B40]">Publikum</h3>
        <div className="px-3 py-1 rounded-md bg-[#E7EFEA] text-[#2F4B40] text-sm font-medium ring-1 ring-[#C8D6CF]">
          {getAudienceDisplayText()}
        </div>
      </div>

      {/* Radio Options */}
      <div className="space-y-3">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            name="audience"
            value="PUBLIC"
            checked={mode === 'PUBLIC'}
            onChange={() => onModeChange('PUBLIC')}
            className="w-4 h-4 text-[#2F4B40] border-[#D2DED8] focus:ring-[#C8D6CF] focus:ring-2"
          />
          <span className="text-sm text-gray-700">
            <span className="font-medium">Všem (veřejná nabídka)</span>
            <div className="text-xs text-gray-500">Viditelná na homepage</div>
          </span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            name="audience"
            value="CLIENTS_ALL"
            checked={mode === 'CLIENTS_ALL'}
            onChange={() => onModeChange('CLIENTS_ALL')}
            className="w-4 h-4 text-[#2F4B40] border-[#D2DED8] focus:ring-[#C8D6CF] focus:ring-2"
          />
          <span className="text-sm text-gray-700">
            <span className="font-medium">Jen mým klientům</span>
            <div className="text-xs text-gray-500">Dostupná všem aktivním klientům</div>
          </span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            name="audience"
            value="CLIENTS_TAGS"
            checked={mode === 'CLIENTS_TAGS'}
            onChange={() => onModeChange('CLIENTS_TAGS')}
            className="w-4 h-4 text-[#2F4B40] border-[#D2DED8] focus:ring-[#C8D6CF] focus:ring-2"
          />
          <span className="text-sm text-gray-700">
            <span className="font-medium">Klientům s tagy</span>
            <div className="text-xs text-gray-500">Vyberte specifické štítky klientů</div>
          </span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="radio"
            name="audience"
            value="CLIENTS_SELECTED"
            checked={mode === 'CLIENTS_SELECTED'}
            onChange={() => onModeChange('CLIENTS_SELECTED')}
            className="w-4 h-4 text-[#2F4B40] border-[#D2DED8] focus:ring-[#C8D6CF] focus:ring-2"
          />
          <span className="text-sm text-gray-700">
            <span className="font-medium">Vybraným klientům</span>
            <div className="text-xs text-gray-500">Vyberte konkrétní klienty</div>
          </span>
        </label>
      </div>

      {/* Tag Selection for CLIENTS_TAGS */}
      {mode === 'CLIENTS_TAGS' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#2F4B40]">
              Vyberte tagy klientů
            </label>
            <div className="text-xs text-gray-500">
              {selectedTags.length} tagů vybráno
            </div>
          </div>
          
          {availableTags.length === 0 ? (
            <div className="text-sm text-gray-500 p-3 bg-[#F5F7F6] rounded-md border border-[#D2DED8]">
              Zatím nejsou k dispozici žádné tagy. Nejprve vytvořte klienty se štítky.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {availableTags.map(tag => (
                <label key={tag} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => handleTagToggle(tag)}
                    className="w-4 h-4 text-[#2F4B40] border-[#D2DED8] rounded focus:ring-[#C8D6CF] focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">{tag}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Client Selection for CLIENTS_SELECTED */}
      {mode === 'CLIENTS_SELECTED' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-[#2F4B40]">
              Vyberte klienty
            </label>
            <div className="text-xs text-gray-500">
              {selectedClientIds.length} klientů vybráno
            </div>
          </div>

          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Vyhledat klienty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[#D2DED8] rounded-md focus:ring-2 focus:ring-[#C8D6CF] focus:border-[#C8D6CF]"
            />
          </div>

          {filteredClients.length === 0 ? (
            <div className="text-sm text-gray-500 p-3 bg-[#F5F7F6] rounded-md border border-[#D2DED8]">
              {searchTerm ? 'Nebyly nalezeni žádní klienti podle zadaného výrazu.' : 'Zatím nejsou k dispozici žádní klienti.'}
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredClients.map(client => (
                <label key={client.id} className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-[#F5F7F6]">
                  <input
                    type="checkbox"
                    checked={selectedClientIds.includes(client.id)}
                    onChange={() => handleClientToggle(client.id)}
                    className="w-4 h-4 text-[#2F4B40] border-[#D2DED8] rounded focus:ring-[#C8D6CF] focus:ring-2"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {client.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {client.email && <span>{client.email}</span>}
                      {client.email && client.phone && <span> · </span>}
                      {client.phone && <span>{client.phone}</span>}
                    </div>
                    {client.tags && client.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {client.tags.map((tag: string) => (
                          <span key={tag} className="inline-block px-2 py-0.5 text-xs bg-[#E7EFEA] text-[#2F4B40] rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${
                      client.status === 'active' ? 'bg-emerald-500' : 'bg-neutral-900'
                    }`} title={client.status === 'active' ? 'Aktivní' : 'Neaktivní'} />
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Validation Error */}
      {mode === 'CLIENTS_TAGS' && selectedTags.length === 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-sm text-red-700">
            Pro publikaci na tagy je nutné vybrat alespoň jeden tag.
          </div>
        </div>
      )}

      {mode === 'CLIENTS_SELECTED' && selectedClientIds.length === 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="text-sm text-red-700">
            Pro publikaci vybraným klientům je nutné vybrat alespoň jednoho klienta.
          </div>
        </div>
      )}
    </div>
  );
}