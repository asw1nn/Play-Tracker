async function findBenchPress() {
    const url = `https://wger.de/api/v2/exercise/?name=Bench%20Press&language=2&status=2`;
    console.log(`Fetching: ${url}`);
    const response = await fetch(url);
    const data = await response.json();
    console.log('Results:', JSON.stringify(data.results, null, 2));
}

findBenchPress();
