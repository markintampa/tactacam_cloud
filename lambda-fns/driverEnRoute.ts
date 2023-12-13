import { notifierService } from './notifierService';

exports.handler = async function(order:any) {
    let driver = 'found';
    if (order.delivery) {
        notifierService("Driver is on the way!");
    } else {
        driver = 'NA'
    }

    return { 'status' : driver }
}
