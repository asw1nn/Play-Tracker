async function testDetails() {
    const id = 351; // Romanian Deadlift
    const url = `https://wger.de/api/v2/exercise/${id}/`;
    console.log(`Fetching: ${url}`);

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Details:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testDetails();
