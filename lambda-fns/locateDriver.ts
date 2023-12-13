import { notifierService } from './notifierService';

exports.handler = async function(order:any) {
    let driver = 'found';
    if (order.delivery) {
        notifierService("Locating driver");
    } else {
        driver = 'NA'
    }

    return { 'status' : driver }
}
