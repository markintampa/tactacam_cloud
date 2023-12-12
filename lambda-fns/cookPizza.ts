import { weightedRandom } from './weightedRandom';

exports.handler = async function(flavour:any) {
    console.log("Cooking Pizza...");
    let status = weightedRandom(0.2) ? 'burnt' : 'cooked'
    return {'pizzaStatus': 'cooked'} // or burnt
}