import { notifierService } from './notifierService';

interface Order {
    flavour: string;
    size: string;
    toppings: string[];
    address: string;
    delivery: boolean;
  }

export async function handler(order:Order) {
    // exports.handler = async function(order:Order) {
    console.log("Requested Pizza :", JSON.stringify(order.flavour, undefined, 2));
    console.log("Toppings :", JSON.stringify(order.toppings, undefined, 2));
    
    var errors: string[] = [];
    let containsPineapple = false;
    
    if(order.flavour == 'pineapple' || order.flavour =='hawaiian'){
        containsPineapple = true;
    }

    // (Simulated) Check/validate address if delivery
    if (order.delivery && order.address != "1234 Smith St") {
        notifierService("Retry order with valid address.");
        errors.push("Missing/invalid address");
    }

    // Calculate price for size $12/14/16 and $1 toppings
    let price = order.size == 'large' ? 16 : order.size == 'medium' ? 14 : 12;
    price += order.toppings.length;

    console.log("Store order in DB for reference...");

    return {'containsPineapple': containsPineapple, 'errors': errors}
}
