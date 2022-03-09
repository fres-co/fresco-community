const agendaItemName = document.getElementById('agenda-item-name');

const prevButton = document.getElementById('prev-button');
let agendaItems = [];

prevButton.addEventListener('click', () => {
    fresco.setState({ agendaItemIndex: Math.max(-1, fresco.element.state.agendaItemIndex - 1) });
});

const nextButton = document.getElementById('next-button');
nextButton.addEventListener('click', () => {
    fresco.setState({ agendaItemIndex: Math.min(agendaItems.length, fresco.element.state.agendaItemIndex + 1) });
});


fresco.onReady(function () {

    fresco.onStateChanged(function () {
        const state = fresco.element.state;
        agendaItems = state.agendaItems ? state.agendaItems.split('\n') : [];
        fresco.element.state.agendaItemIndex = fresco.element.state.agendaItemIndex ?? 0;
        if (state.agendaItemIndex === -1) {
            agendaItemName.innerText = 'Waiting for the event to start';
        } else if (state.agendaItemIndex === agendaItems.length) {
            agendaItemName.innerText = 'The event has ended';
        } else {
            agendaItemName.innerText = agendaItems[state.agendaItemIndex];
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


