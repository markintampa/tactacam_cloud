import { weightedRandom } from './weightedRandom';

exports.handler = async function(delivery:any) {
    console.log("Delivering pizza");
    let pizzaDelivered = delivery && weightedRandom(0.8);  // Randomize if driver came through on this one
    let holdForPickup = !delivery;

    return { 'delivered': pizzaDelivered, 'holdForPickup': holdForPickup }
}