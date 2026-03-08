module.exports = {
    ci: {
        collect: {
            url: ['http://localhost:3000/login'],
            startServerCommand: 'npm run start',
            numberOfRuns: 2,
        },
        assert: {
            assertions: {
                'categories:performance': ['warn', { minScore: 0.8 }],
                'categories:accessibility': ['warn', { minScore: 0.9 }],
                'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
                'interactive': ['warn', { maxNumericValue: 3800 }],
            },
        },
        upload: {
            target: 'temporary-public-storage',
        },
    },
};
