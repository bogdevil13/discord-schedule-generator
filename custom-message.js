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

function generateTimeConfigRow(config){
    return `<tr id=${config.name}>
                <td scope="row">
                    <button type="button" class="btn  btn-sm btn-danger remove-button">-</button>
                    <button type="button" class="btn  btn-sm btn-primary add-button">+</button>
                </td>
                <td scope="row">${config.label}</td>
                <td scope="row">${config.example12hr}</td>
                <td scope="row">${config.example24hr}</td>
                <td scope="row">&lt;&lt;${config.name}&gt;&gt;</td>
            </tr>`
}

document.addEventListener('DOMContentLoaded', (event) => {
    document.querySelector("#custom-format-options").innerHTML = timeFormats.reduce((prev, current)=>prev + this.generateTimeConfigRow(current),'');
    [...document.querySelectorAll('#custom-format-options .remove-button, #custom-format-options .add-button') ]
    .forEach(e=>e.addEventListener('click', this.customMessageButtonHandler ));
    [...document.querySelectorAll('#stream-template, #title-template')].forEach(e=>e.addEventListener('input', this.generatePreview ));
    generatePreview()

})

function customMessageButtonHandler(event){
    let isAdd = event.target.classList.contains('add-button');
    let name =  event.target.parentElement.parentElement.id ;
    let template = document.querySelector('#stream-template')
    // let configs = timeFormats.find(e=>e.name == name);
    console.log(name, isAdd)
    if(isAdd){
        template.value = template.value + `<<${name}>>`;
        generatePreview()
    }else if(template.value.indexOf(`<<${name}>>`) != -1 ){
        let lastIndex = template.value.lastIndexOf(`<<${name}>>`) 
        template.value = template.value.substring(0,lastIndex) + template.value.substring(lastIndex+ `<<${name}>>`.length)
        generatePreview()
    }   

}

function generatePreview(){
    let titleTemplate = document.querySelector('#title-template').value;
    titleTemplate ? null : (titleTemplate  = document.querySelector('#title-template').placeholder)
    let streamTemplate = document.querySelector('#stream-template').value;
    streamTemplate ? null : (streamTemplate  = document.querySelector('#stream-template').placeholder)
    console.log( 'title : ', titleTemplate, ' stream : ',streamTemplate)
    let streamMapping = [
        {counter : 1 ,category : 'Minecraft'},
        {counter : 2 ,category : 'Skyrim'},
        {counter : 3 ,category : 'Just Chatting'},
        {counter : 4 ,category : 'Community Game Night'},
    ]
    let previewHTML = `<p class="mb-0">${titleTemplate}</p>`;
    timeFormats.slice(0,7).forEach(e=>{
        streamTemplate = streamTemplate.replaceAll(`<<${e.name}>>`, `<span class="discord-preview-date rounded">${e.example12hr}</span>` )
    })
    streamMapping.forEach(e =>{
        previewHTML += `<p class="mb-0">${streamTemplate.replaceAll('<<counter>>',  e.counter).replaceAll('<<category>>',  e.category)   }</p>`
    })
    document.querySelector('.discord-preview').innerHTML = previewHTML
}

