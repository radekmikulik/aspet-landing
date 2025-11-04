// components/ClientModals.tsx
"use client";

import { useState, useEffect } from 'react';
import { Client, ClientStatus, clientsStore, invitesStore, showToast } from '@/lib/clients.storage';

interface AddEditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  editClient?: Client | null;
}

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteCreated: (inviteCode: string, inviteLink: string) => void;
}

export function AddEditClientModal({ isOpen, onClose, onSave, editClient }: AddEditClientModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    tags: '',
    status: 'active' as ClientStatus,
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editClient) {
      setFormData({
        name: editClient.name || '',
        email: editClient.email || '',
        phone: editClient.phone || '',
        tags: editClient.tags?.join(', ') || '',
        status: editClient.status || 'active',
        notes: editClient.notes || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        tags: '',
        status: 'active',
        notes: ''
      });
    }
    setErrors({});
  }, [editClient, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Jméno je povinné';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Neplatný formát e-mailu';
    }
    
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Neplatný formát telefonu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const tags = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    const client: Client = {
      id: editClient?.id || '',
      name: formData.name.trim(),
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      status: formData.status,
      dateAdded: editClient?.dateAdded || new Date().toISOString(),
      lastSeen: editClient?.lastSeen,
      notes: formData.notes.trim() || undefined
    };
    
    onSave(client);
    onClose();
    showToast(editClient ? 'Klient byl aktualizován' : 'Klient byl přidán', 'success');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-[#D2DED8] shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editClient ? 'Upravit klienta' : 'Přidat klienta'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Zavřít"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Jméno <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8D6CF] ${
                  errors.name ? 'border-red-300' : 'border-[#C8D6CF]'
                }`}
                placeholder="Např. Petra K."
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8D6CF] ${
                  errors.email ? 'border-red-300' : 'border-[#C8D6CF]'
                }`}
                placeholder="petra@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Telefon
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8D6CF] ${
                  errors.phone ? 'border-red-300' : 'border-[#C8D6CF]'
                }`}
                placeholder="+420 123 456 789"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Štítky
              </label>
              <input
                type="text"
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full rounded-md border border-[#C8D6CF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8D6CF]"
                placeholder="VIP, řasy, obočí"
              />
              <p className="mt-1 text-xs text-gray-500">Více štítků oddělte čárkou</p>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Stav
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ClientStatus })}
                className="w-full rounded-md border border-[#C8D6CF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8D6CF]"
              >
                <option value="active">Aktivní</option>
                <option value="inactive">Neaktivní</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Poznámky
              </label>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-md border border-[#C8D6CF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8D6CF]"
                placeholder="Interní poznámky..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-md border border-[#C8D6CF] bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-[#E7EFEA]"
              >
                Zrušit
              </button>
              <button
                type="submit"
                className="flex-1 rounded-md bg-[#2F4B40] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
              >
                {editClient ? 'Uložit změny' : 'Přidat klienta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function InviteModal({ isOpen, onClose, onInviteCreated }: InviteModalProps) {
  const [emailHint, setEmailHint] = useState('');
  const [ttlHours, setTtlHours] = useState(72);
  const [isCreating, setIsCreating] = useState(false);
  const [createdInvite, setCreatedInvite] = useState<{ code: string; link: string } | null>(null);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      const invite = invitesStore.createInvite(emailHint, ttlHours);
      const inviteLink = `aspeti://invite/${invite.code}`;
      
      setCreatedInvite({
        code: invite.code,
        link: inviteLink
      });
      
      onInviteCreated(invite.code, inviteLink);
    } catch (error) {
      showToast('Chyba při vytváření pozvánky', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = () => {
    if (createdInvite) {
      navigator.clipboard.writeText(createdInvite.link);
      showToast('Odkaz zkopírován', 'success');
    }
  };

  const handleClose = () => {
    setEmailHint('');
    setTtlHours(72);
    setCreatedInvite(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-[#D2DED8] shadow-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Vytvořit pozvánku</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Zavřít"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!createdInvite ? (
            <form onSubmit={handleCreateInvite} className="space-y-4">
              <div>
                <label htmlFor="emailHint" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail (volitelné)
                </label>
                <input
                  type="email"
                  id="emailHint"
                  value={emailHint}
                  onChange={(e) => setEmailHint(e.target.value)}
                  className="w-full rounded-md border border-[#C8D6CF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8D6CF]"
                  placeholder="příjemce@example.com"
                />
                <p className="mt-1 text-xs text-gray-500">Pro lepší přehled v pozvánce</p>
              </div>

              <div>
                <label htmlFor="ttlHours" className="block text-sm font-medium text-gray-700 mb-1">
                  Expirace
                </label>
                <select
                  id="ttlHours"
                  value={ttlHours}
                  onChange={(e) => setTtlHours(Number(e.target.value))}
                  className="w-full rounded-md border border-[#C8D6CF] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8D6CF]"
                >
                  <option value={24}>24 hodin</option>
                  <option value={72}>3 dny</option>
                  <option value={168}>7 dní</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-md border border-[#C8D6CF] bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-[#E7EFEA]"
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 rounded-md bg-[#2F4B40] px-4 py-2 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50"
                >
                  {isCreating ? 'Vytvářím...' : 'Vytvořit pozvánku'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Pozvánka vytvořena!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Pošlete tento odkaz vašemu klientovi pro připojení k platformě.
                </p>
              </div>

              <div className="bg-[#F5F7F6] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-gray-600">Kód pozvánky:</span>
                  <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                    {createdInvite.code}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600">Odkaz:</span>
                  <input
                    type="text"
                    value={createdInvite.link}
                    readOnly
                    className="flex-1 text-xs bg-white px-2 py-1 rounded border border-[#C8D6CF] font-mono"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="rounded-md border border-[#C8D6CF] bg-white px-3 py-1 text-xs hover:bg-[#E7EFEA]"
                  >
                    Kopírovat
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleClose}
                  className="flex-1 rounded-md bg-[#2F4B40] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
                >
                  Hotovo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}