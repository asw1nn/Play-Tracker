async function testInfo() {
    const id = 351; // Romanian Deadlift
    const url = `https://wger.de/api/v2/exerciseinfo/${id}/`;
    console.log(`Fetching: ${url}`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.log(`Status: ${response.status}`);
            return;
        }
        const data = await response.json();
        console.log('Info:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testInfo();
