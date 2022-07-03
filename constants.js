export const timeFormats = [
    {
        name:           'shortTime',
        label:          'Short Time',
        example12hr:    '8:30 AM',
        example24hr:    '8:30',
        formatCharacter: '<t:epoch:t>'
    },
    {
        name:           'longTime',
        label:          'Long Time',
        example12hr:    '8:30:00 AM',
        example24hr:    '8:30:00',
        formatCharacter: '<t:epoch:T>'
    },
    {
        name:           'shortDate',
        label:          'Short Date',
        example12hr:    '06/13/2022',
        example24hr:    '13/06/2022',
        formatCharacter: '<t:epoch:d>'
    },
    {
        name:           'longDate',
        label:          'Long Date',
        example12hr:    'June 13, 2022',
        example24hr:    '13 June 2022',
        formatCharacter: '<t:epoch:D>'
    },
    {
        name:           'shortDateTime',
        label:          'Short Date/Time',
        example12hr:    'June 13, 2022 8:30 AM',
        example24hr:    '13 June 2022 8:30',
        formatCharacter: '<t:epoch:f>'
    },
    {
        name:           'longDateTime',
        label:          'Long Date/Time',
        example12hr:    'Monday, June 13, 2022 8:30 AM',
        example24hr:    'Monday, 13 June 2022 8:30',
        formatCharacter: '<t:epoch:F>'
    },
    {
        name:           'relativeTime',
        label:          'Relative Time',
        example12hr:    'in a day',
        example24hr:    '',
        formatCharacter: '<t:epoch:R>'
    },
    {
        name:           'counter',
        label:          'Counter',
        example12hr:    '1,2,3.....',
        example24hr:    '',
        formatCharacter: ''
    },
    {
        name:           'category',
        label:          'Description/Category',
        example12hr:    '[description for the stream]',
        example24hr:    '',
        formatCharacter: ''
    },
]


export const defaultConfig = {
    'titleTemplate' : '**Schedule**',
    'streamTemplate' : '#<<counter>>. <<longDateTime>> (<<relativeTime>>) : <<category>>'
}

export function getConfig(configName){
    if(storageAvailable('localStorage')){
        let configs = JSON.parse(window.localStorage.getItem('userConfigs'))
        if(configs && configs[configName]){
            return configs[configName]
        }else {
            return defaultConfig[configName]
        }
    }else{
        return defaultConfig[configName]
    }
}

export function storageAvailable(type) {
    var storage;
    try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}

export function escapeHtml(unsafe){
    return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

