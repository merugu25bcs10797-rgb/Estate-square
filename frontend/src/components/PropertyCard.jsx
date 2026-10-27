import React from 'react';
import { Link } from 'react-router-dom';
import { Bed, Bath, Maximize2, MapPin, Heart } from 'lucide-react';
import Badge from './Badge.jsx';
import { formatPrice } from '../utils/formatters.js';

export const PropertyCard = ({
  property,
  isFavorite = false,
  onToggleFavorite,
  showStatus = false,
  actions
}) => {
  const imageUrl =
    property.images && property.images.length > 0 && property.images[0].url
      ? property.images[0].url
      : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80';

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(property._id);
    }
  };

  return (
    <div className="group bg-white rounded-lg border border-warm-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col h-full">
      {/* 4:3 Image Container */}
      <div className="relative aspect-4/3 w-full bg-warm-200 overflow-hidden">
        <Link to={`/property/${property._id}`} className="block w-full h-full">
          <img
            src={imageUrl}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80';
            }}
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5 z-10">
          <Badge variant={property.listingType} size="sm">
            For {property.listingType}
          </Badge>
          {showStatus && (
            <Badge variant={property.status} size="sm">
              {property.status}
            </Badge>
          )}
        </div>

        {/* Favorite Heart Button */}
        {onToggleFavorite && (
          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label="Toggle Favorite"
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-charcoal shadow-xs hover:bg-white hover:text-rose-600 transition-colors z-10"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isFavorite ? 'fill-rose-600 text-rose-600' : 'text-charcoal-muted'
              }`}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Property Type */}
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-lg font-bold text-charcoal tracking-tight">
              {formatPrice(property.price, property.listingType)}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-muted">
              {property.propertyType.replace('_', ' ')}
            </span>
          </div>

          {/* Title */}
          <Link to={`/property/${property._id}`}>
            <h3 className="text-sm font-semibold text-charcoal line-clamp-1 group-hover:text-forest transition-colors">
              {property.title}
            </h3>
          </Link>

          {/* City & Address */}
          <div className="flex items-center text-xs text-charcoal-muted mt-1 space-x-1">
            <MapPin className="w-3.5 h-3.5 text-forest flex-shrink-0" />
            <span className="truncate">
              {property.address}, {property.city}
            </span>
          </div>
        </div>

        {/* Specs / Meta */}
        <div className="pt-3 mt-3 border-t border-warm-100 flex items-center justify-between text-xs text-charcoal-muted">
          <div className="flex items-center space-x-3">
            {property.bedrooms > 0 && (
              <span className="flex items-center space-x-1">
                <Bed className="w-3.5 h-3.5 text-charcoal-light" />
                <span>{property.bedrooms} BHK</span>
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center space-x-1">
                <Bath className="w-3.5 h-3.5 text-charcoal-light" />
                <span>{property.bathrooms} Bath</span>
              </span>
            )}
            {property.areaSqFt && (
              <span className="flex items-center space-x-1">
                <Maximize2 className="w-3.5 h-3.5 text-charcoal-light" />
                <span>{property.areaSqFt} sqft</span>
              </span>
            )}
          </div>
        </div>

        {/* Optional Custom Card Actions (for seller dashboard edit/delete) */}
        {actions && <div className="mt-3 pt-3 border-t border-warm-200">{actions}</div>}
      </div>
    </div>
  );
};

export default PropertyCard;
