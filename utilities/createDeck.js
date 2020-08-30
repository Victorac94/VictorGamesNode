module.exports = createDeckCards = config => {
    const roles = {
        cops: ['KS', 'KH', 'KD', 'KC'],
        thieves: ['AS', 'AH', 'AD', 'AC'],
        citizens: ['4S', '5S', '7S', '3H', '5H', '9H', '5D', '6D', '8D', '3C', '6C', '9C'],
        whores: ['JS', 'JH', 'JD', 'JC'],
        deputies: ['QS', 'QH', 'QD', 'QC'],
        kamikazes: ['0S', '0H', '0D', '0C'],
        learners: ['2S', '2H', '2D', '2C']
    }

    let result = [];

    for (let role in config) {
        if (config[role] === 0) continue;

        const numberOfCharacters = roles[role].slice(0, config[role]); // Get the number of characters and values for each role

        result.push(numberOfCharacters);
    }

    return result.join(',');
}