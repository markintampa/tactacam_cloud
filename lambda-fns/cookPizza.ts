exports.handler = async function(flavour:any) {
    console.log("Cooking Pizza...");

    return {'pizzaStatus': 'cooked'} // or burnt
}