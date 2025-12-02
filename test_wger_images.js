async function testImages() {
    const searchUrl = `https://wger.de/api/v2/exercise/search/?term=Bench%20Press`;
    const searchResp = await fetch(searchUrl);
    const searchData = await searchResp.json();
    const benchPress = searchData.suggestions[0];

    console.log('Bench Press ID:', benchPress.data.id);

    const infoUrl = `https://wger.de/api/v2/exerciseinfo/${benchPress.data.id}/`;
    console.log(`Fetching Info: ${infoUrl}`);
    const infoResp = await fetch(infoUrl);
    const infoData = await infoResp.json();

    if (infoData.detail) {
        console.log('Info Error Detail:', infoData.detail);
    }

    const imgUrl = `https://wger.de/api/v2/exerciseimage/?exercise=${benchPress.data.id}`;
    console.log(`Fetching Images Endpoint: ${imgUrl}`);
    const imgResp = await fetch(imgUrl);
    const imgData = await imgResp.json();

    if (imgData.detail) { // Assuming it might be detail here too, though keys said 'exercise' earlier?
        console.log('Img Endpoint Error:', JSON.stringify(imgData, null, 2));
    } else {
        console.log('Img Endpoint Keys:', Object.keys(imgData));
    }
}

testImages();
