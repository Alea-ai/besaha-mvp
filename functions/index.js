
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

// Haversine formula to calculate distance in meters
function haversineDistance(coord1, coord2) {
  const toRad = (deg) => deg * Math.PI / 180;
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lng - coord1.lng);
  const a = Math.sin(dLat/2)**2 +
            Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
            Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Trigger: onCreate of a review document.
 * Logic: 
 * 1. Fetch Restaurant coordinates.
 * 2. Calculate distance from review.userLocation to restaurant.coordinates.
 * 3. Check if distance <= 200m AND photo evidence exists.
 * 4. Update review document with verified: true/false.
 */
exports.onReviewCreated = functions.firestore
  .document('reviews/{reviewId}')
  .onCreate(async (snap, context) => {
    const review = snap.data();
    const reviewRef = snap.ref;

    try {
      const restId = review.restaurantId;
      
      // Fetch Restaurant
      const restSnap = await db.collection('restaurants').doc(restId).get();
      if (!restSnap.exists) {
        await reviewRef.update({ verified: false, verificationReason: 'Restaurant not found' });
        return;
      }

      const restData = restSnap.data();
      const restCoords = restData.coordinates; // { lat, lng }
      const userCoords = review.userLocation;  // { lat, lng }

      if (!userCoords) {
        await reviewRef.update({ verified: false, verificationReason: 'No GPS data provided' });
        return;
      }

      // Calculate Distance
      const distMeters = haversineDistance(restCoords, userCoords);
      
      // Check Media
      const hasMedia = Array.isArray(review.mediaUrls) && review.mediaUrls.length > 0;

      if (distMeters <= 200 && hasMedia) {
        // SUCCESS: Verify Review
        await reviewRef.update({ verified: true, verificationReason: 'Verified by GPS & Photo' });

        // Update User Contributions & Restaurant Stats (Transaction)
        await db.runTransaction(async (tx) => {
          // User Stats
          const userRef = db.collection('users').doc(review.userId);
          const userDoc = await tx.get(userRef);
          if (userDoc.exists) {
            const newCount = (userDoc.data().contributionsCount || 0) + 1;
            tx.update(userRef, { contributionsCount: newCount });
          }

          // Restaurant Stats (Meta)
          const restRef = restSnap.ref;
          const rDoc = await tx.get(restRef);
          const prevMeta = rDoc.data().meta || { reviewsCount: 0, avgScores: {} };
          const nextCount = (prevMeta.reviewsCount || 0) + 1;

          // Simple average recalculation (can be optimized)
          // For MVP, just increment count.
          // In prod, you'd recalculate weighted averages for all 5 categories.
          tx.update(restRef, { 
            'meta.reviewsCount': nextCount 
          });
        });

      } else {
        // FAILURE
        const reason = !hasMedia ? 'Missing photo proof' : `Too far away (${Math.round(distMeters)}m)`;
        await reviewRef.update({ verified: false, verificationReason: reason });
      }

    } catch (err) {
      console.error('Verification Function Error:', err);
      await reviewRef.update({ verified: false, verificationReason: 'Server Verification Error' });
    }
});
