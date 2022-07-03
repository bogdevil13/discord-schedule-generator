import { timeFormats, storageAvailable, escapeHtml, defaultConfig, getConfig } from "./constants.js";

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
    let userConfigs = window.localStorage.getItem('userConfigs');
    if(userConfigs) userConfigs = JSON.parse(userConfigs);
    document.querySelector("#custom-format-options").innerHTML = timeFormats.reduce((prev, current)=>prev + generateTimeConfigRow(current),'');
    [...document.querySelectorAll('#custom-format-options .remove-button, #custom-format-options .add-button') ]
    .forEach(e=>e.addEventListener('click', customMessageButtonHandler ));
    let streamTemplate = document.querySelector("#stream-template");
    streamTemplate.addEventListener('input', generatePreview )
    if(userConfigs && userConfigs.streamTemplate) streamTemplate.value = userConfigs.streamTemplate;
    let titleTemplate = document.querySelector("#title-template");
    titleTemplate.addEventListener('input', generatePreview )
    if(userConfigs && userConfigs.titleTemplate) titleTemplate.value = userConfigs.titleTemplate;
    generatePreview()
    document.querySelector("#save-template").addEventListener('click', saveTemplate );
    document.querySelector("#reset-template").addEventListener('click', resetToDefaults );

})

function customMessageButtonHandler(event){
    let isAdd = event.target.classList.contains('add-button');
    let name =  event.target.parentElement.parentElement.id ;
    let template = document.querySelector('#stream-template')
    // let configs = timeFormats.find(e=>e.name == name);
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
    // console.log( 'title : ', titleTemplate, ' stream : ',streamTemplate)
    let streamMapping = [
        {counter : 1 ,category : 'Minecraft'},
        {counter : 2 ,category : 'Skyrim'},
        {counter : 3 ,category : 'Just Chatting'},
        {counter : 4 ,category : 'Community Game Night'},
    ]
    let previewHTML = `<p class="mb-0">${escapeHtml(titleTemplate)}</p><p class="mb-0">&nbsp;</p>`;
    timeFormats.slice(0,7).forEach(e=>{
        streamTemplate = streamTemplate.replaceAll(`<<${e.name}>>`, `<span class="discord-preview-date rounded">${e.example12hr}</span>` )
    })
    streamMapping.forEach(e =>{
        previewHTML += `<p class="mb-0">${streamTemplate.replaceAll('<<counter>>',  e.counter).replaceAll('<<category>>',  e.category)   }</p>`
    })
    document.querySelector('.discord-preview').innerHTML = previewHTML
}



function saveTemplate(){
    if(storageAvailable('localStorage')){
        console.log('storage supported')
        let titleTemplate = document.querySelector('#title-template').value;
        let streamTemplate = document.querySelector('#stream-template').value;
        let savedConfigs = {};
        if(titleTemplate) savedConfigs['titleTemplate'] = titleTemplate;
        if(streamTemplate) savedConfigs['streamTemplate'] = streamTemplate;
        console.log(JSON.stringify(savedConfigs))
        window.localStorage.setItem('userConfigs', JSON.stringify(savedConfigs) );

    }else{
        console.log('no storage access')
    }
}

function resetToDefaults(){
    document.querySelector('#title-template').value = null;
    document.querySelector('#stream-template').value = null;
    window.localStorage.removeItem('userConfigs')
    generatePreview()
}
