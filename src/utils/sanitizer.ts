import validator from 'validator';

export function JSONSanitizer(data: Object) {

    for(const key of Object.keys(data)) {
        const objecttype = typeof(data[key]);
        switch(objecttype) {
            case 'object': JSONSanitizer(data[key]); break;
            case 'string':  data[key] = validator.escape(data[key]); break;
            default: console.warn(`type: ${ objecttype}: ${JSON.stringify(data[key])} not processed`);
        }
    }
}