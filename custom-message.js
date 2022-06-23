const timeFormats = [
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
        example12hr:    'in a day | in 3 hours | in 11 minutes',
        example24hr:    'in a day | in 3 hours | in 11 minutes',
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

function generateTimeConfigRow(config){
    return `<tr id=${config.name}>
                <td scope="row">
                    <button type="button" class="btn  btn-sm btn-danger remove-button">-</button>
                    <button type="button" class="btn  btn-sm btn-primary add-button">+</button>
                </td>
                <td scope="row">${config.label}</td>
                <td scope="row">${config.example12hr}</td>
                <td scope="row">${config.example24hr}</td>
            </tr>`
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector("#custom-format-options").innerHTML = timeFormats.reduce((prev, current)=>prev + this.generateTimeConfigRow(current),'');
    [...document.querySelectorAll('#custom-format-options .remove-button, #custom-format-options .add-button') ]
    .forEach(e=>e.addEventListener('click', this.customMessageButtonHandler ))

})

function customMessageButtonHandler(event){
    let isAdd = event.target.classList.contains('add-button');
    let name =  event.target.parentElement.parentElement.id ;
    let template = document.querySelector('#stream-template')
    // let configs = timeFormats.find(e=>e.name == name);
    console.log(name, isAdd)
    if(isAdd){
        template.value = template.value + `<<${name}>>`;
    }else{

    }   

}

