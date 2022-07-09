import { testerList } from "./constants.js";
let streamersData = []
document.addEventListener('DOMContentLoaded', (event) => {
    if(streamersData.length){
        rerenderStreamerList()
    }
})
fetchTwitchProfiles();

function fetchTwitchProfiles(){
    testerList.forEach(userName =>{
        fetch(`twitch/${userName}`)
        .then(res=>{
            return res.text()
        })
        .then(res=>{
            let imageUrl = new DOMParser().parseFromString(res, "text/html").querySelector('meta[name="twitter:image"]').content;

            streamersData.push( generateStreamerTemplate(imageUrl, userName) )
            if (document.readyState !== "loading"){
                rerenderStreamerList()
            }
        })
    })
}

function rerenderStreamerList(){
    document.querySelector('#tester-list').innerHTML = streamersData.join('\n')
}

function generateStreamerTemplate(imageURL, userName){
    return `<div>
        <img class="rounded-circle" style="width: 10rem;" src="${imageURL}" alt="Twitch Profile Pic">
        <a href="https://www.twitch.tv/${userName}" target="_blank">${userName}</a>
    </div>`
}