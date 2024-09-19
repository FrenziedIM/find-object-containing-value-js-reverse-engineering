function searchForText(searchText, options = {}) {
    const seen = new WeakSet();
    const results = [];
    const defaultOptions = {
        ignoreCSS: false,
        ignoreHTML: false,
        minLength: 0,
        maxLength: Infinity
    };
    const finalOptions = { ...defaultOptions, ...options };

    function isCSS(key, value) {
        return key.toLowerCase().includes('style') || 
               (typeof value === 'string' && value.includes(':') && value.includes(';'));
    }

    function isHTML(value) {
        return typeof value === 'string' && 
               (value.startsWith('<') && value.endsWith('>') || 
                value.includes('</') && value.includes('>'));
    }

    function searchObject(obj, path = 'window') {
        if (obj === null || typeof obj !== 'object' || seen.has(obj)) {
            return;
        }

        seen.add(obj);

        for (let key in obj) {
            try {
                const value = obj[key];
                const newPath = `${path}['${key}']`;

                if (finalOptions.ignoreCSS && isCSS(key, value)) continue;
                if (finalOptions.ignoreHTML && isHTML(value)) continue;

                if (typeof value === 'string' && 
                    value.includes(searchText) &&
                    value.length >= finalOptions.minLength &&
                    value.length <= finalOptions.maxLength) {
                    results.push({ path: newPath, value: value });
                } else if (typeof value === 'object' && value !== null) {
                    searchObject(value, newPath);
                }
            } catch (e) {
                // Ignore errors (e.g., from getters that throw)
            }
        }
    }

    // Start with the window object
    searchObject(window);

    return results;
}

// Function to safely evaluate a path
function safeEval(path) {
    try {
        return eval(path);
    } catch (e) {
        return `Error accessing path: ${e.message}`;
    }
}

// Function to run search and display results
function runSearch(searchText, options = {}) {
    console.log(`Searching for: "${searchText}"`);
    console.log('Options:', options);
    
    const startTime = performance.now();
    const foundVariables = searchForText(searchText, options);
    const endTime = performance.now();
    
    console.log(`Search completed in ${(endTime - startTime).toFixed(2)} ms`);
    console.log(`Found ${foundVariables.length} results:`);

    const structuredResults = {};

    foundVariables.forEach((result, index) => {
        const resultKey = `Result ${index + 1}`;
        structuredResults[resultKey] = {
            path: result.path,
            value: result.value,
            length: result.value.length,
            currentValue: safeEval(result.path)
        };

        console.log(resultKey + ':');
        console.log(`  Path: ${result.path}`);
        console.log(`  Value: ${result.value}`);
        console.log(`  Length: ${result.value.length} characters`);
        console.log(`  Current value: ${structuredResults[resultKey].currentValue}`);
        console.log('---');
    });

    console.log('Structured Results Object:');
    console.log(structuredResults, null, 2);

    return structuredResults;
}

const results = runSearch('KL1004', { 
     ignoreCSS: true, 
     ignoreHTML: true, 
     minLength: 0, 
     maxLength: 100 
});