import { weightedRandom } from './weightedRandom';

exports.handler = async function(flavour:any) {
    console.log("Building Pizza.");
    let outOfCheese = weightedRandom(0.1);
    let staffOnStrike = weightedRandom(0.5);

    if (outOfCheese) {
        // Placeholder for notification, SNS?
        console.log("Message user, out of cheese, our bad.")
    }

    return {
        'pizzaBuilt': 'Pepperoni',
        'outOfCheese': outOfCheese,
        'staffOnStrike': staffOnStrike
    }
}