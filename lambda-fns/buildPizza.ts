exports.handler = async function(flavour:any) {
    console.log("Building Pizza.");

    let outOfCheese = true;
    let staffOnStrike = true;

    return {
        'pizzaBuilt': 'Pepperoni',
        'outOfCheese': outOfCheese,
        'staffOnStrike': staffOnStrike
    }
}