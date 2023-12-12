import { weightedRandom } from './weightedRandom';

exports.handler = async function(delivery:any) {
    console.log("Delivering pizza");
    let pizzaDelivered = delivery && weightedRandom(0.8);  // Randomize if driver came through on this one
    let holdForPickup = !delivery;

    if (!pizzaDelivered && !holdForPickup) {
        console.log("Notify customer we dropped the ball...er, pizza")
    }

    return { 'delivered': pizzaDelivered, 'holdForPickup': holdForPickup }
}