
const weekDaysList = ['Monday','Tuesday','Wednesday','Thrusday','Friday','Saturday','Sunday'];

function generateDayRow(weekDayName){
    return `<tr id=${weekDayName} class='week-row'>
                <th scope="row">${weekDayName}</th>
                <td >
                    <div class="form-check form-switch">
                        <input class="form-check-input day-checkbox" type="checkbox" disabled>
                    </div>
                </td>
                <td>
                    <input class="stream-start-time" type="time" >
                </td>
                <td>
                    <input class="stream-description max-width-input" type="text" >
                </td>
            </tr>
            `
}

function checkboxChangeHandler(event){
    const weekday = event.target.parentElement.parentElement.parentElement.id; 
    console.log(event.target.checked, weekday ); // 
    if(!event.target.checked){
        event.target.disabled = true;
        document.querySelector(`#${weekday} .stream-start-time`)
        .value = '';
    }
}

function timeChangeHandler(event){
    const weekday = event.target.parentElement.parentElement.id; 
    const checkbox = document.querySelector(`#${weekday} .day-checkbox`)
    checkbox.checked = true;
    checkbox.disabled = false;
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
    let resultList = []
    let count = 1;
    let discordMessage = '**Schedule**\n'
    for(let row of document.getElementsByClassName('week-row') ){
        const timeElement = row.getElementsByClassName('stream-start-time')[0]
        const category = row.getElementsByClassName('stream-description')[0]
        console.log(row.id, timeElement.value);
        if(timeElement.value){
            let selectedWeeksDate = new Date(mondayDate.getTime());
            selectedWeeksDate = addDaysToDate(selectedWeeksDate, weekDaysList.indexOf(row.id));
            selectedWeeksDate.setHours( timeElement.value.split(':')[0],
                                        timeElement.value.split(':')[1],
                                        0)
            discordMessage += generateDiscordScheduleLine({ time: selectedWeeksDate, category: category.value },count )
            resultList.push({ time: selectedWeeksDate, category: category.value })
            count += 1
        }
    }
    console.log(resultList)
    console.log(discordMessage)
    const outputArea = document.getElementById("output-copy");
    outputArea.value = discordMessage;
    outputArea.style.visibility = 'visible';
    document.getElementById("copy-hint").style.visibility = 'visible';
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

function generateDiscordScheduleLine(info, count){
    return `#${count}. <t:${info.time.getTime()/ 1000}:f> (<t:${info.time.getTime()/ 1000}:R>) : ${info.category? info.category: ''}\n`
} 
// Helper Functions End

document.addEventListener('DOMContentLoaded', (event) => {

    const weekSelector = document.getElementById("week-selector")
    weekSelector.addEventListener('change', weekSelectorHandler)
    weekSelector.value = getInputFormattedDate( addDaysToDate( setToLastMonday(new Date()), 7 ) )

    document.getElementById("table-rows").innerHTML = weekDaysList.reduce((prev, current)=>prev + this.generateDayRow(current),'')

    for(let checkbox of document.getElementsByClassName('day-checkbox') ){
        checkbox.addEventListener('change', checkboxChangeHandler );
    }

    for(let checkbox of document.getElementsByClassName('stream-start-time') ){
        checkbox.addEventListener('change', timeChangeHandler );
    }

    document.getElementById("generate-botton").addEventListener('click', generateScheduleHandler)
    // if(!document.queryCommandSupported('copy')){
    //     document.getElementById("debug-string").innerHTML = 'Copy operation is not supported by your Browser. Please provide us with your device info for bug fixes.'
    // }
    


});
