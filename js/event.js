addLayer("events", {
    name: "Events", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "E", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        points:new Decimal(0),
        unlocked: true,
    }},
    
    color: "yellow",
    resource: "Events",
    /* NOTE Events have :
    id : to be iterable
    eventName : Name of the Object, the eventWatcher will call events by name to fire eventCheck

    eventTitle : event displayed name

    eventLevel : help to calculate power, fixed in mission
    eventSide : string Good, Bad, Neutral
    
    eventCheck : return 1 if firing
    eventEffect : proper function of the event if fired
    
    */
    
    row: "side", // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "e", description: "E : move to Tags side layer", onPress(){showTab("events")}},
    ],
})
