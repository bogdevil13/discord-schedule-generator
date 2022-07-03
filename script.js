import { timeFormats, storageAvailable, escapeHtml, defaultConfig, getConfig } from "./constants.js";
const weekDaysList = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

function generateDayRow(weekDayName){
    return `<tr id=${weekDayName} class='week-row'>
                <th scope="row">${weekDayName}</th>
                <td scope="row">
                    <div class="form-check form-switch">
                        <input class="form-check-input day-checkbox" type="checkbox" disabled>
                    </div>
                </td>
                <td scope="row">
                    <input class="stream-start-time" type="time" >
                </td>
                <td scope="row">
                    <input class="stream-description max-width-input" type="text" >
                </td>
            </tr>
            `
}

function checkboxChangeHandler(event){
    const weekday = event.target.parentElement.parentElement.parentElement.id; 
    // console.log(event.target.checked, weekday ); 
    if(!event.target.checked){
        event.target.disabled = true;
        document.querySelector(`#${weekday} .stream-start-time`)
        .value = '';
        document.querySelector(`#${weekday} .stream-description`)
        .value = '';
        // console.log(document.querySelector(`#${weekday} .stream-description`))
    }
    else { //checked
        let populatedRows = [...document.querySelectorAll('.week-row')].filter(wr=> wr.querySelector('.day-checkbox').checked ) // https://www.w3.org/TR/selectors-api/#queryselectorall -> already sorted in the order of appearance 
        let currentRowIndex =  populatedRows.findIndex(rw=> rw.id == weekday)
        let copyElementIndex = currentRowIndex ? currentRowIndex - 1 : 1;
        populatedRows[currentRowIndex].querySelector('.stream-start-time').value =  populatedRows[copyElementIndex].querySelector('.stream-start-time').value
        populatedRows[currentRowIndex].querySelector('.stream-description').value =  populatedRows[copyElementIndex].querySelector('.stream-description').value

    }
    updateCheckboxDisabledState()

}

function timeChangeHandler(event){
    const weekday = event.target.parentElement.parentElement.id; 
    if(event.type == 'change' && event.target.value){
        document.querySelector(`#${weekday} .day-checkbox`).checked = true;
        updateCheckboxDisabledState() 
    }else if(event.type == 'blur' &&  !event.target.value){
        event.target.value = event.target.value // used to reset the value on frontend if say only half of the field is cleared and focused out
        document.querySelector(`#${weekday} .day-checkbox`)
        .checked = false;
        document.querySelector(`#${weekday} .stream-description`)
        .value = '';
        updateCheckboxDisabledState() 
    }
}

function weekSelectorHandler(event){
    const generateButton = document.getElementById('generate-botton');
    if(event.target.value){
        generateButton.disabled = false;
        event.target.value = getInputFormattedDate(setToLastMonday(stringDateToDate(event.target.value))) // to ensure we always start from week start, which is hardcoded as Monday as of now!

    }else{
        event.target.value = getInputFormattedDate( addDaysToDate( setToLastMonday(new Date()), 7 ) )
    }
}

function generateScheduleHandler(){
    const weekSelector = document.getElementById("week-selector")
    const mondayDate = stringDateToDate(weekSelector.value)
    let count = 1;
    let discordMessage = `${getConfig('titleTemplate')}\n\n`
    let streamTemplate = getConfig('streamTemplate')
    for(let row of document.getElementsByClassName('week-row') ){
        const timeElement = row.getElementsByClassName('stream-start-time')[0]
        const category = row.getElementsByClassName('stream-description')[0]
        // console.log(row.id, timeElement.value);
        if(timeElement.value){
            let selectedWeeksDate = new Date(mondayDate.getTime());
            selectedWeeksDate = addDaysToDate(selectedWeeksDate, weekDaysList.indexOf(row.id));
            selectedWeeksDate.setHours( timeElement.value.split(':')[0],
                                        timeElement.value.split(':')[1],
                                        0)
            discordMessage += generateDiscordScheduleLine({ time: selectedWeeksDate, category: category.value, counter : count }, streamTemplate )
            count += 1
        }
    }
    // console.log(discordMessage)
    const outputArea = document.getElementById("output-copy");
    outputArea.value = discordMessage;
    outputArea.style.visibility = 'visible';

    try {
        const type = "text/plain";
        const blob = new Blob([discordMessage], { type });
        const data = [new ClipboardItem({ [type]: blob })];
    
        navigator.clipboard.write(data)
        .then(()=>{
            document.getElementById("copy-hint").style.visibility = 'visible';
            console.log('copied to clipboard')
        })
        .catch(()=>{
            let hint = document.getElementById("copy-hint")
            hint.innerHTML = 'Please Copy-Paste the below Text into your Discord';
            hint.style.visibility = 'visible';
            console.log('fail')
        })
    } catch (err) {
        console.error(err.name, err.message);
        console.log(err)
    }
    saveSchedule()

}

// Helper Functions 

function setToLastMonday( date ) {
    let day = date.getDay() || 7;  
    if( day !== 1 ) 
        date.setHours(-24 * (day - 1)); 
    return date;
    
}

function addDaysToDate( date, days){
    date.setDate(date.getDate() + days);
    return date
}

function getInputFormattedDate(date){
    const offset = date.getTimezoneOffset()
    date = new Date(date.getTime() - (offset*60*1000))
    return date.toISOString().split('T')[0]
}

function stringDateToDate(dateString){
    const dateSplit = dateString.split('-')
    return new Date(dateSplit[0], dateSplit[1]-1, dateSplit[2])
}

function generateDiscordScheduleLine(info, template){
    let epoch = info.time.getTime()/ 1000;
    timeFormats.forEach(rec=>{
        template = template.replaceAll(`<<${rec.name}>>`, rec.formatCharacter ? rec.formatCharacter.replace('epoch',epoch) : info[rec.name] )
    })
    return template + '\n'
}

/**
 * To Update the disabled state of the checkboxes in the table. 
 * The purpose of checkbox is such that when you click them, they copy the info from the rows above them ( cycled to the bottom ) 
 * Because of this, if there are no rows with any data, the checkboxes need to be disabled
 */
function updateCheckboxDisabledState(){
    const checkboxes = [...document.querySelectorAll('.day-checkbox')]
    const disableCheckboxes = !checkboxes.reduce((p,c)=> c.checked || p, false) // checks if at least 1 checkbox is ticked, used to determine if others can be enabled too for copying of rows purpose 
    checkboxes.forEach(e=>e.disabled= disableCheckboxes)
}
// Helper Functions End

document.addEventListener('DOMContentLoaded', (event) => {

    const weekSelector = document.getElementById("week-selector")
    weekSelector.addEventListener('change', weekSelectorHandler)
    weekSelector.value = getInputFormattedDate( addDaysToDate( setToLastMonday(new Date()), 7 ) )

    document.getElementById("table-rows").innerHTML = weekDaysList.reduce((prev, current)=>prev + generateDayRow(current),'')

    for(let checkbox of document.getElementsByClassName('day-checkbox') ){
        checkbox.addEventListener('change', checkboxChangeHandler );
    }

    for(let timepicker of document.getElementsByClassName('stream-start-time') ){
        timepicker.addEventListener('change', timeChangeHandler );
        timepicker.addEventListener('blur', timeChangeHandler );
        timepicker.addEventListener('focus', (event)=>{event.target.showPicker() }) 
    }

    document.getElementById("generate-botton").addEventListener('click', generateScheduleHandler)
    setSavedSchedule()
    


});


function saveSchedule() {
    let scheduleData = [];
    [...document.getElementsByClassName('week-row')].forEach(
        day => {
            let dayData = {
                'name' : day.id,
                'time' : day.querySelector('.stream-start-time').value,
                'category' : day.querySelector('.stream-description').value,
            };
            scheduleData.push(dayData)
    })
    if(storageAvailable('localStorage') ){
        window.localStorage.setItem('schedule', JSON.stringify(scheduleData))
    }
}

function setSavedSchedule() {
    if(storageAvailable('localStorage') && window.localStorage.getItem('schedule')){
        let schedule = JSON.parse(window.localStorage.getItem('schedule'))
        schedule.forEach(day=>{
            document.querySelector(`#${day.name} .stream-start-time`).value = day.time;
            document.querySelector(`#${day.name} .day-checkbox`).checked = Boolean(day.time);
            document.querySelector(`#${day.name} .stream-description`).value = day.category;
        })
        updateCheckboxDisabledState()
    }
}