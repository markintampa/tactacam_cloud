exports.handler = async function(flavour:any) {
    console.log("Pizza sitting under heat lamps awaiting pickup...");
    
    let containsPineapple = false;
    
    if(flavour == 'pineapple' || flavour =='hawaiian'){
        containsPineapple = true;
    }

    return {'containsPineapple': containsPineapple}
}