import Visit from '../models/Visit.js';

/**
 * Checks if a property already has a confirmed visit within 1 hour (+/- 59 minutes) of the targetDate.
 * @param {string|ObjectId} propertyId
 * @param {Date} targetDate
 * @param {string|ObjectId|null} excludeVisitId
 * @returns {Promise<boolean>} returns true if conflict exists
 */
export const hasVisitConflict = async (propertyId, targetDate, excludeVisitId = null) => {
  const targetTime = new Date(targetDate).getTime();
  const ONE_HOUR_MS = 60 * 60 * 1000;

  const windowStart = new Date(targetTime - ONE_HOUR_MS + 1000);
  const windowEnd = new Date(targetTime + ONE_HOUR_MS - 1000);

  const query = {
    property: propertyId,
    status: 'confirmed',
    visitDate: {
      $gte: windowStart,
      $lte: windowEnd
    }
  };

  if (excludeVisitId) {
    query._id = { $ne: excludeVisitId };
  }

  const conflictingVisit = await Visit.findOne(query);
  return Boolean(conflictingVisit);
};
