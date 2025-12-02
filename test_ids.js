async function testIds() {
    const term = 'Bench Press';
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

    const id = item.data.id;
    const base_id = item.data.base_id;

    console.log(`Testing ID: ${id}`);
    const infoUrl1 = `https://wger.de/api/v2/exerciseinfo/${id}/`;
    const resp1 = await fetch(infoUrl1);
    if (resp1.ok) {
        console.log(`ID ${id} worked!`);
    } else {
        console.log(`ID ${id} failed: ${resp1.status}`);
    }

    console.log(`Testing Base ID: ${base_id}`);
    const infoUrl2 = `https://wger.de/api/v2/exerciseinfo/${base_id}/`;
    const resp2 = await fetch(infoUrl2);
    if (resp2.ok) {
        console.log(`Base ID ${base_id} worked!`);
    } else {
        console.log(`Base ID ${base_id} failed: ${resp2.status}`);
    }
}

testIds();
