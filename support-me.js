import { testerList } from "./constants.js";
let streamersData = []
document.addEventListener('DOMContentLoaded', (event) => {
    if(streamersData.length){
        rerenderStreamerList()
    }
})
fetchTwitchProfiles();

function fetchTwitchProfiles(){
    let fetchOptions =  {
        method : 'GET',
        headers: new Headers({
            "User-Agent" : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36"
        })
    }
    testerList.forEach(userName =>{
        fetch(`twitch/${userName}`,{mode: 'no-cors'})
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