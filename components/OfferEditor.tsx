'use client';

import React, { useMemo, useState } from 'react';
import AudiencePicker from './AudiencePicker';
import { AudienceMode } from '@/lib/offers.storage';

export type Offer = {
  id: string;
  title: string;
  category: 'beauty'|'gastro'|'ubytovani'|'reality'|'remesla';
  city: string;
  description: string;
  images: string[];
  coverIndex: number;
  price?: string;
  oldPrice?: string;
  discount?: string;
  vip: boolean;
  audienceMode: 'PUBLIC' | 'CLIENTS_ALL' | 'CLIENTS_TAGS' | 'CLIENTS_SELECTED';
  audienceTags?: string[];
  audienceClientIds?: string[];
  status: 'Koncept'|'Schváleno'|'Zveřejněno';
  createdAt: string;
};

type Props = {
  initial?: Partial<Offer>;
  onClose: () => void;
  onSaveDraft: (o: Offer) => void;
  onPublish: (o: Offer) => void;
};

function Field({label, children}:{label:string;children:React.ReactNode}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-gray-600">{label}</span>
      {children}
    </label>
  );
}

function PreviewCard({ o }: { o: Offer }) {
  const img = o.images[o.coverIndex] || '';
  return (
    <article className="group overflow-hidden rounded-md border border-[#DDE6E1] bg-white shadow-md">
      <div className="h-40 w-full bg-[#E7EFEA] relative">
        {img && <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      </div>
      <div className="p-3 space-y-2">
        {(o.discount || o.vip) && (
          <div className="flex items-center gap-2">
            {o.discount && (
              <span className="inline-block rounded-none bg-[#7F9B8E]/92 text-white text-[10px] font-semibold px-2.5 py-0.5 ring-1 ring-black/15">
                {o.discount}
              </span>
            )}
            {o.vip && (
              <span className="inline-flex items-center rounded bg-[#E7EFEA] px-1.5 py-0.5 text-[10px] font-semibold text-[#2F4B40] ring-1 ring-[#C8D6CF]">
                VIP
              </span>
            )}
          </div>
        )}
        <h3 className="text-sm font-semibold text-gray-900">{o.title || 'Bez názvu'}</h3>
        <p className="text-xs text-gray-700 line-clamp-2">{o.description}</p>
        <div className="text-xs text-gray-600">{o.city || 'Město'} • {o.category}</div>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {o.oldPrice && <span className="text-xs text-gray-400 line-through">{o.oldPrice}</span>}
            {o.price && <span className="text-sm font-semibold text-blue-900">{o.price}</span>}
          </div>
          <span className="text-[11px] text-gray-600">
            {o.audienceMode === 'PUBLIC' ? 'Veřejná' : 
             o.audienceMode === 'CLIENTS_ALL' ? 'Jen pro klienty' : 
             o.audienceMode === 'CLIENTS_TAGS' ? 'Klienti s tagy' : 
             'Vybraní klienti'}
          </span>
        </div>
      </div>
    </article>
  );
}

export default function OfferEditor({ initial, onClose, onSaveDraft, onPublish }: Props) {
  const [step, setStep] = useState<1|2|3|4|5>(1);
  const [reviewed, setReviewed] = useState(false);

  const [title, setTitle] = useState(initial?.title || '');
  const [category, setCategoryKey] = useState<Offer['category']>(initial?.category || 'beauty');
  const [city, setCity] = useState(initial?.city || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [images, setImages] = useState<string[]>(initial?.images || []);
  const [coverIndex, setCoverIndex] = useState(initial?.coverIndex ?? 0);
  const [price, setPrice] = useState(initial?.price || '');
  const [oldPrice, setOldPrice] = useState(initial?.oldPrice || '');
  const [discount, setDiscount] = useState(initial?.discount || '');
  const [vip, setVip] = useState<boolean>(!!initial?.vip);
  const [audienceMode, setAudienceMode] = useState<AudienceMode>(initial?.audienceMode || 'PUBLIC');
  const [audienceTags, setAudienceTags] = useState<string[]>(initial?.audienceTags || []);
  const [audienceClientIds, setAudienceClientIds] = useState<string[]>(initial?.audienceClientIds || []);

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const list: string[] = [];
    Array.from(files).forEach(f => list.push(URL.createObjectURL(f)));
    setImages(prev => [...list, ...prev]);
    if (images.length === 0) setCoverIndex(0);
  };

  const offer: Offer = {
    id: initial?.id || 'tmp-' + Math.random().toString(36).slice(2,9),
    title, category, city, description, images, coverIndex,
    price, oldPrice, discount, vip, audienceMode, audienceTags, audienceClientIds,
    status: reviewed ? 'Schváleno' : 'Koncept',
    createdAt: new Date().toISOString(),
  };

  // Validation based on audience mode
  const isValidAudience = () => {
    switch (audienceMode) {
      case 'PUBLIC':
        return true;
      case 'CLIENTS_ALL':
        return true; // Assume at least one active client exists
      case 'CLIENTS_TAGS':
        return audienceTags.length > 0;
      case 'CLIENTS_SELECTED':
        return audienceClientIds.length > 0;
      default:
        return false;
    }
  };

  const canPublish = reviewed && !!title.trim() && !!city.trim() && images.length > 0 && isValidAudience();

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="max-w-5xl w-full rounded-xl border border-[#D2DED8] bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-[#E0E8E3] px-4 py-3">
            <div className="text-base font-semibold text-blue-900">Nová nabídka</div>
            <button onClick={onClose} className="rounded px-2 py-1 hover:bg-[#E7EFEA]" aria-label="Zavřít">✕</button>
          </div>

          <div className="px-4 pt-3 pb-1 flex items-center gap-2 text-xs">
            {[1,2,3,4,5].map(n => (
              <span key={n} className={`rounded px-2 py-1 ring-1 ${step===n?'bg-[#E7EFEA] text-[#2F4B40] ring-[#C8D6CF]':'text-gray-600 ring-[#E0E8E3]'}`}>Krok {n}</span>
            ))}
            <span className="ml-auto text-[11px] text-gray-600">Stav: <strong>{offer.status}</strong></span>
          </div>

          <div className="p-4 space-y-4 max-h-[70vh] overflow-auto">
            {step===1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Název"><input value={title} onChange={e=>setTitle(e.target.value)} className="w-full rounded-md border border-[#C8D6CF] px-3 py-2 text-sm" placeholder="např. Lash lifting + brow shape"/></Field>
                <Field label="Kategorie">
                  <select value={category} onChange={(e)=>setCategoryKey(e.target.value as any)} className="w-full rounded-md border border-[#C8D6CF] px-3 py-2 text-sm">
                    <option value="beauty">Beauty & Wellbeing</option>
                    <option value="gastro">Gastro</option>
                    <option value="ubytovani">Ubytování</option>
                    <option value="reality">Reality</option>
                    <option value="remesla">Řemesla</option>
                  </select>
                </Field>
                <Field label="Město"><input value={city} onChange={e=>setCity(e.target.value)} className="w-full rounded-md border border-[#C8D6CF] px-3 py-2 text-sm" placeholder="např. Olomouc"/></Field>
                <Field label="Popis"><textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} className="w-full rounded-md border border-[#C8D6CF] px-3 py-2 text-sm" placeholder="Krátký popis nabídky"/></Field>
              </div>
            )}

            {step===2 && (
              <div className="space-y-3">
                <input type="file" accept="image/*" multiple onChange={(e)=>onFiles(e.target.files)} />
                {images.length===0 ? (
                  <div className="rounded-md border border-[#D2DED8] bg-[#F8FAF9] p-6 text-center text-sm text-gray-700">
                    Přidejte alespoň jednu fotku. První fotografie bude použita jako náhled.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {images.map((src, i)=>(
                      <button key={i} onClick={()=>setCoverIndex(i)} className={`relative aspect-square overflow-hidden rounded border ${coverIndex===i?'border-blue-400 ring-2 ring-blue-300':'border-[#D2DED8]'}`}>
                        <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover"/>
                        {coverIndex===i && <span className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 py-0.5 text-[10px]">Náhled</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step===3 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Cena (např. 890 Kč)"><input value={price} onChange={e=>setPrice(e.target.value)} className="w-full rounded-md border border-[#C8D6CF] px-3 py-2 text-sm"/></Field>
                <Field label="Původní cena (volitelné)"><input value={oldPrice} onChange={e=>setOldPrice(e.target.value)} className="w-full rounded-md border border-[#C8D6CF] px-3 py-2 text-sm"/></Field>
                <Field label="Sleva / promo (např. –15% nebo –300 Kč)"><input value={discount} onChange={e=>setDiscount(e.target.value)} className="w-full rounded-md border border-[#C8D6CF] px-3 py-2 text-sm"/></Field>
                <label className="inline-flex items-center gap-2 mt-1">
                  <input type="checkbox" checked={vip} onChange={(e)=>setVip(e.target.checked)} />
                  <span className="text-sm text-gray-800">VIP nabídka</span>
                </label>
              </div>
            )}

            {step===4 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="inline-flex items-start gap-2">
                    <input type="checkbox" checked={reviewed} onChange={(e)=>setReviewed(e.target.checked)} />
                    <span className="text-sm text-gray-800">Potvrzuji, že jsem <strong>zkontroloval/a náhled</strong> a údaje jsou správné.</span>
                  </label>
                  <p className="text-xs text-gray-600">Po kontrole náhledu můžete přejít na další krok a vybrat publikum.</p>
                </div>
                <div>
                  <div className="mb-2 text-sm font-semibold text-blue-900">Náhled karty</div>
                  <PreviewCard o={offer}/>
                </div>
              </div>
            )}

            {step===5 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-[#2F4B40]">E) Publikovat komu</h3>
                  <AudiencePicker
                    mode={audienceMode}
                    selectedTags={audienceTags}
                    selectedClientIds={audienceClientIds}
                    onModeChange={setAudienceMode}
                    onTagsChange={setAudienceTags}
                    onClientIdsChange={setAudienceClientIds}
                  />
                </div>
                <div>
                  <div className="mb-2 text-sm font-semibold text-blue-900">Náhled karty</div>
                  <PreviewCard o={offer}/>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-[#E0E8E3] px-4 py-3">
            <div className="flex items-center gap-2">
              <button onClick={()=>onSaveDraft(offer)} className="rounded-md border border-[#C8D6CF] bg-white px-3 py-1.5 text-sm text-blue-900 hover:bg-[#E7EFEA]">Uložit koncept</button>
              <span className="text-xs text-gray-600">Status: {offer.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={()=>setStep((s)=> (s>1 ? (s-1) as any : s))} disabled={step===1} className="rounded-md border border-[#C8D6CF] bg-white px-3 py-1.5 text-sm text-blue-900 disabled:opacity-50">Zpět</button>
              <button onClick={()=>setStep((s)=> (s<5 ? (s+1) as any : s))} disabled={step===5} className="rounded-md border border-[#C8D6CF] bg-white px-3 py-1.5 text-sm text-blue-900 disabled:opacity-50">Další</button>
              <button onClick={()=>onPublish({...offer, status:'Zveřejněno'})} disabled={!canPublish} className="rounded-md bg-[#2F4B40] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50">Publikovat</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
