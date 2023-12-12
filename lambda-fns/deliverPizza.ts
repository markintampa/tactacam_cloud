exports.handler = async function(flavour:any) {
    console.log("Delivering pizza");
    let pizzaDelivered = true;

    return { 'delivered': pizzaDelivered }
}