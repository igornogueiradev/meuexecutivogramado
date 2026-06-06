const API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyDGGQVJ7FPzHiza9WgbHTrIof95VELmmBM';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600');

  try {
    const searchRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.id',
      },
      body: JSON.stringify({
        textQuery: 'Meu Executivo Gramado Gramado RS Brasil',
        maxResultCount: 1,
      }),
    });

    const searchData = await searchRes.json();
    if (!searchData.places?.length) return res.json({ reviews: [] });

    const placeId = searchData.places[0].id;

    const detailsRes = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, {
      headers: {
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'reviews,rating,userRatingCount',
      },
    });

    const data = await detailsRes.json();

    const reviews = (data.reviews || [])
      .filter(r => r.text?.text?.length > 5)
      .slice(0, 3)
      .map(r => ({
        author: r.authorAttribution?.displayName || 'Cliente',
        rating: r.rating,
        text: r.text.text.length > 220 ? r.text.text.substring(0, 220) + '...' : r.text.text,
      }));

    res.json({ reviews, rating: data.rating, total: data.userRatingCount });
  } catch (e) {
    console.error('Reviews API error:', e);
    res.json({ reviews: [] });
  }
};
