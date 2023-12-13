import { notifierService } from './notifierService';
import { weightedRandom } from './weightedRandom';

exports.handler = async function() {
    console.log("Cooking Pizza...");
    let status = weightedRandom(0.2) ? 'burnt' : 'cooked';
    if (status == 'burnt') {
        notifierService('Retry, notify user it will be another 10 minutes');
    }
    return {'pizzaStatus': status}
}
