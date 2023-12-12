exports.handler = async function(flavour:any) {
    console.log("Requested Pizza :", JSON.stringify(flavour, undefined, 2));
    
    let containsPineapple = false;
    
    if(flavour == 'pineapple' || flavour =='hawaiian'){
        containsPineapple = true;
    }

    console.log("Storing order in DB for reference...")

    return {'containsPineapple': containsPineapple}
}