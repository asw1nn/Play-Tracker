async function checkPauseBench() {
    const term = 'Pause Bench';
    const searchUrl = `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(term)}`;
    console.log(`Searching: ${term}`);
    const searchResp = await fetch(searchUrl);
    const searchData = await searchResp.json();

    if (searchData.suggestions.length === 0) {
        console.log('No results found');
        return;
    }

    const item = searchData.suggestions[0];
    console.log('Item:', JSON.stringify(item, null, 2));

    const id = item.data.base_id || item.data.id;
    console.log(`Checking details for ID: ${id}`);

    const infoUrl = `https://wger.de/api/v2/exerciseinfo/${id}/`;
    const infoResp = await fetch(infoUrl);
    const infoData = await infoResp.json();

    console.log('Images array:', JSON.stringify(infoData.images, null, 2));
}

checkPauseBench();
