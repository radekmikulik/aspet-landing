'use client';

type Offer = {
  id: string;
  status: 'Koncept'|'Schváleno'|'Zveřejněno'|'Pozastaveno';
  category: 'beauty'|'gastro'|'ubytovani'|'reality'|'remesla';
  title: string;
  description: string;
  tags: string[];
  city?: string;
  address?: string;
  radiusKm?: number;
  whenType?: 'jednorazova'|'prubezna';
  dateFrom?: string;
  dateTo?: string;
  lodgingType?: 'hotel'|'penzion'|'apartman'|'airbnb'|'dům'|'byt'|'jiné';
  capacityAdults?: number;
  childrenAllowed?: boolean;
  childrenFreeAge?: number;
  price?: string;
  oldPrice?: string;
  discountLabel?: string;
  promoLabel?: string;
  vip: boolean;
  photos: string[];
  heroIndex?: number;
  providerName?: string;
  createdAt: string;
  publishedAt?: string;
  cityNormalized?: string;
};

interface OfferPreviewProps {
  offer: Offer;
  onClose: () => void;
}

export default function OfferPreview({ offer, onClose }: OfferPreviewProps) {
  const isVIP = offer.vip;
  const heroPhoto = offer.photos[offer.heroIndex || 0];
  
  // Calculate NEW label duration based on category
  const getNewDuration = () => {
    const isBeautyGastroAccommodation = ['beauty', 'gastro', 'ubytovani'].includes(offer.category);
    return isBeautyGastroAccommodation ? 24 : 72; // hours
  };

  const isNew = () => {
    const now = new Date().getTime();
    const created = new Date(offer.createdAt).getTime();
    const hoursElapsed = (now - created) / (1000 * 60 * 60);
    return hoursElapsed < getNewDuration();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      beauty: 'Beauty & wellness',
      gastro: 'Gastronomie',
      ubytovani: 'Ubytování',
      reality: 'Reality',
      remesla: 'Řemesla'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const renderVIPCard = () => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md w-full">
      {/* Photo */}
      <div className="relative h-48 bg-gray-200">
        {heroPhoto ? (
          <img 
            src={heroPhoto} 
            alt={offer.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-4xl mb-2">📷</div>
              <div>Žádná fotka</div>
            </div>
          </div>
        )}
        
        {/* VIP Badge */}
        {isVIP && (
          <div className="absolute top-3 left-3">
            <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              VIP
            </span>
          </div>
        )}
        
        {/* NEW Badge */}
        {isNew() && (
          <div className="absolute top-3 right-3">
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              NEW
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {getCategoryLabel(offer.category)}
          </span>
          {offer.providerName && (
            <span className="text-xs text-gray-500">
              {offer.providerName}
            </span>
          )}
        </div>

        <h3 className="font-bold text-lg mb-2 line-clamp-2">{offer.title}</h3>
        
        {offer.city && (
          <p className="text-sm text-gray-600 mb-2">📍 {offer.city}</p>
        )}

        {/* Price Section - POD fotkou */}
        <div className="mb-3">
          {offer.price && (
            <div className="space-y-1">
              {offer.oldPrice && (
                <div className="text-sm text-gray-400 line-through">
                  {offer.oldPrice}
                </div>
              )}
              <div className="text-xl font-bold text-[#2F4B40]">
                {offer.price}
              </div>
              
              {/* Discount and Promo Labels */}
              {(offer.discountLabel || offer.promoLabel) && (
                <div className="space-y-1">
                  {offer.discountLabel && (
                    <div className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                      {offer.discountLabel}
                    </div>
                  )}
                  {offer.promoLabel && (
                    <div className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded ml-2">
                      {offer.promoLabel}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        {offer.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {offer.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-[#E7EFEA] text-[#2F4B40] px-2 py-1 rounded">
                {tag}
              </span>
            ))}
            {offer.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{offer.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Additional Info */}
        {(offer.whenType || offer.lodgingType) && (
          <div className="text-sm text-gray-600 space-y-1">
            {offer.whenType && (
              <div>
                {offer.whenType === 'jednorazova' && offer.dateFrom && (
                  <span>📅 {formatDate(offer.dateFrom)}
                    {offer.dateTo && ` - ${formatDate(offer.dateTo)}`}
                  </span>
                )}
                {offer.whenType === 'prubezna' && (
                  <span>📅 Průběžná nabídka</span>
                )}
              </div>
            )}
            
            {offer.lodgingType && (
              <div>
                🏠 {offer.lodgingType}
                {offer.capacityAdults && ` (až ${offer.capacityAdults} dospělých)`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderStandardCard = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-sm w-full">
      {/* Photo */}
      <div className="relative h-32 bg-gray-200">
        {heroPhoto ? (
          <img 
            src={heroPhoto} 
            alt={offer.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-2xl mb-1">📷</div>
              <div className="text-xs">Žádná fotka</div>
            </div>
          </div>
        )}
        
        {/* NEW Badge - smaller */}
        {isNew() && (
          <div className="absolute top-2 right-2">
            <span className="bg-red-500 text-white px-1 py-0.5 rounded text-xs font-bold">
              NEW
            </span>
          </div>
        )}
      </div>

      {/* Content - compact */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
            {getCategoryLabel(offer.category)}
          </span>
          {offer.providerName && (
            <span className="text-xs text-gray-500">
              {offer.providerName}
            </span>
          )}
        </div>

        <h3 className="font-semibold text-sm mb-1 line-clamp-1">{offer.title}</h3>
        
        {offer.city && (
          <p className="text-xs text-gray-600 mb-1">📍 {offer.city}</p>
        )}

        {/* Price - compact */}
        {offer.price && (
          <div className="flex items-center justify-between">
            <div>
              {offer.oldPrice && (
                <span className="text-xs text-gray-400 line-through mr-1">
                  {offer.oldPrice}
                </span>
              )}
              <span className="text-sm font-bold text-[#2F4B40]">
                {offer.price}
              </span>
            </div>
            
            {/* Discount Label */}
            {offer.discountLabel && (
              <span className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded">
                {offer.discountLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#2F4B40]">Náhled nabídky</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Card Preview */}
        <div className="p-6">
          <div className="flex justify-center">
            {isVIP ? renderVIPCard() : renderStandardCard()}
          </div>
          
          {/* Additional Info */}
          <div className="mt-6 p-4 bg-[#F5F7F6] rounded-lg">
            <h3 className="font-semibold mb-2 text-[#2F4B40]">Popis nabídky:</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {offer.description || 'Žádný popis nebyl zadán.'}
            </p>
          </div>

          {/* Tags Details */}
          {offer.tags.length > 0 && (
            <div className="mt-4 p-4 bg-[#F5F7F6] rounded-lg">
              <h3 className="font-semibold mb-2 text-[#2F4B40]">Tagy:</h3>
              <div className="flex flex-wrap gap-2">
                {offer.tags.map((tag) => (
                  <span key={tag} className="text-sm bg-[#E7EFEA] text-[#2F4B40] px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Availability Details */}
          {(offer.whenType || offer.dateFrom || offer.dateTo) && (
            <div className="mt-4 p-4 bg-[#F5F7F6] rounded-lg">
              <h3 className="font-semibold mb-2 text-[#2F4B40]">Dostupnost:</h3>
              <div className="text-sm text-gray-700">
                {offer.whenType === 'jednorazova' && (
                  <div>
                    {offer.dateFrom && <div>📅 Od: {formatDate(offer.dateFrom)}</div>}
                    {offer.dateTo && <div>📅 Do: {formatDate(offer.dateTo)}</div>}
                  </div>
                )}
                {offer.whenType === 'prubezna' && (
                  <div>📅 Průběžná nabídka</div>
                )}
              </div>
            </div>
          )}

          {/* Accommodation Details */}
          {offer.lodgingType && (
            <div className="mt-4 p-4 bg-[#F5F7F6] rounded-lg">
              <h3 className="font-semibold mb-2 text-[#2F4B40]">Ubytování:</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <div>🏠 Typ: {offer.lodgingType}</div>
                {offer.capacityAdults && (
                  <div>👥 Počet dospělých: {offer.capacityAdults}</div>
                )}
                {offer.childrenAllowed && (
                  <div>👶 Děti povoleny
                    {offer.childrenFreeAge && ` (zdarma do ${offer.childrenFreeAge} let)`}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}