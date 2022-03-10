const agendaItemName = document.getElementById('agenda-item-name');
const agendaItemDuration = document.getElementById('agenda-item-duration');

const prevButton = document.getElementById('prev-button');
let agendaItems = [];

prevButton.addEventListener('click', () => {
    fresco.setState({ agendaItemIndex: Math.max(-1, fresco.element.state.agendaItemIndex - 1) });
});

const nextButton = document.getElementById('next-button');
nextButton.addEventListener('click', () => {
    fresco.setState({ agendaItemIndex: Math.min(agendaItems.length, fresco.element.state.agendaItemIndex + 1) });
});

// https://stackoverflow.com/questions/10893613/how-can-i-convert-time-to-decimal-number-in-javascript
function timeStringToSeconds(time) {
    var minutesSeconds = time.split(/[.:]/);
    var minutes = parseInt(minutesSeconds[0], 10);
    var seconds = minutesSeconds[1] ? parseInt(minutesSeconds[1], 10) : 0;
    return minutes * 60 + seconds;
}

function secondsToTimeString(value) {
    var sec_num = parseInt(value, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }

    if (hours === '00') {
        return minutes + ':' + seconds;
    }
    return hours + ':' + minutes + ':' + seconds;
}

fresco.onReady(function () {

    fresco.onStateChanged(function () {
        const state = fresco.element.state;
        const rawAgendaItems = state.agendaItems ? state.agendaItems.split('\n') : [];
        agendaItems = rawAgendaItems.map(x => {
            const parts = x.split('|');
            if (parts.length === 1) {
                return {
                    name: parts[0],
                    duration: null
                }
            }
            return {
                name: parts[0],
                duration: timeStringToSeconds(parts[1])
            };
        });
        fresco.element.state.agendaItemIndex = fresco.element.state.agendaItemIndex ?? 0;
        if (state.agendaItemIndex === -1) {
            agendaItemName.innerText = 'Waiting for the event to start';
            agendaItemDuration.innerText = '';
        } else if (state.agendaItemIndex === agendaItems.length) {
            agendaItemName.innerText = 'The event has ended';
            agendaItemDuration.innerText = '';
        } else {
            agendaItemName.innerText = agendaItems[state.agendaItemIndex].name;
            agendaItemDuration.innerText = agendaItems[state.agendaItemIndex].duration ? secondsToTimeString(agendaItems[state.agendaItemIndex].duration) : null;
        }
    });

    fresco.initialize({}, {
        title: 'Agenda', autoAdjustHeight: true,
        toolbarButtons: [{
            title: 'Agenda items',
            ui: { type: 'string', multiLine: true },
            property: 'agendaItems'
        }]
    });
});


