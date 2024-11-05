function generateNickname() {
    const adjectives = ["Fluffy", "Sparkly", "Cuddly", "Fancy", "Lovely", "Charming", "Cute", "Sassy"];
    const nouns = ["Bunny", "Kitty", "Bear", "Fox", "Princess", "Butterfly", "Cupcake", "Angel"];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 1000);
    return `${adjective}${noun}${number}`;
}

module.exports = generateNickname;
