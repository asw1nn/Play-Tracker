async function testSearch() {
    const term = 'romanian';

    const urls = [
        `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(term)}`,
        `https://wger.de/api/v2/exercise/?name=${encodeURIComponent(term)}&language=2`,
    ];

    for (const url of urls) {
        console.log(`\nFetching: ${url}`);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.log(`Status: ${response.status}`);
                continue;
            }
            const data = await response.json();
            // Log first item only to save space
            const firstItem = data.results ? data.results[0] : data.suggestions ? data.suggestions[0] : data;
            console.log('First item:', JSON.stringify(firstItem, null, 2));
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

testSearch();
