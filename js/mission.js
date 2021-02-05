function getThreatRatio() {
    let tRatio = asD(player["mission"].threat).div(player["mission"].threatCap)
    tRatio = (tRatio.lt(1) == 1) ? new Decimal(1) : tRatio
    return tRatio
}

function colorPerSide(actorSide) {
    let tColor = "";
    (actorSide == "good") ? tColor = "Blue" : tColor = "Red";
    return tColor
}

addLayer("mission", {
    name: "Mission", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "M", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 10, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked : false,
        points: new Decimal(0),
        
        inMission: false,
        missionComplete: false,
        
        missionParameters: {
            missionRank : new Decimal(0),
            missionStepTarget : new Decimal(0)
        },

        missionEventLoadout : [],

        missionStepCurrent: new Decimal(0),

        activeObjective: "test",

        progress: new Decimal(0),
        progressTarget: new Decimal(100),

        threat : new Decimal(0),
        threatCap: new Decimal(0),

        eventWatchList : [],
        eventQueue : [],

        eventTimeAccumulator: new Decimal(0),

        // array of Actor object w/
        // name(str), quantity(decimal), level(decimal), tags [array]
        // threatBase(decimal), threatType (string : "default" only for now)
        // nextStepBehaviour(string : "default", one step only - "keep", carry through mission)
        actorList : []

    }},

    tabFormat: {
        "Mission": {
            content:
                [
                "ressource-display",
                ["infobox", "missionUpperInfobox"],
                ["blank","10px"],
                ["display-text","main text here"],
                ["infobox", "actorInfobox"],
                ["blank","10px"],
                ["bar","progressBar"],
                ["blank","10px"],
                ["bar","threatBar"],
                ["blank","10px"],
                "milestones", "upgrades",
                ],
        },
    },

    color: "Red",
    resource: "Objective Points", // Name of prestige currency
    type: "none", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    resetNothing : true,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "m", description: "M: Reset for prestige points", onPress(){showTab("mission")}},
    ],
    layerShown(){return (asD(player.hero.points).gte(1))},

    infoboxes: {
        missionUpperInfobox: {
            title: "Mission description",
            body() { return "mission text here" },
        },

        actorInfobox: {
            title: "Actor List",
            body() { 
                let tList = "";
                
                for (actor of player["mission"].actorList) {
                    // tList = tList + actor.name.toString() + "<br />";
                    tList = tList + `<h3 style="color:${colorPerSide(actor.side)}">${actor.name}</h3> Lv ${actor.level} [${actor.tags.toString().toUpperCase()}]<br />
                    Qt : ${actor.quantity} HP : ${actor.life.remain} (${formatWhole(asD(actor.life.remain).times(new Decimal(100)).div(actor.life.value))}%)<br />
                    Threat : ${actor.threatBase} per unit, total ${formatWhole(getThreatPointGen(new Decimal(1), actor))} /sec<br /><br />
                    `
                }
                return tList
            },
        },
    },

    bars: {
        progressBar: {
            direction: RIGHT,
            width: 500,
            height: 50,

            baseStyle: {'background-color' : ' Black'},
            fillStyle: {'background-color' : 'Blue'},
            borderStyle: {'border-color' : 'Blue'},
            textStyle: {'color' : 'White'},
            // **Optional**, Apply CSS to the unfilled portion, filled portion, border, and display text on the bar, in the form of an object where the keys are CSS attributes, and the values are the values for those attributes (both as strings).
            display() {
                if (player["mission"].inMission == true) {
                    return `${formatWhole(player["mission"].progress)} progress (${formatWhole(getProgressPointGen(new Decimal(1)).div(getThreatRatio()))}/sec) out of ${formatWhole(player["mission"].progressTarget)}`
                }
            },

            progress() {
                if (player["mission"].inMission == true) {
                    return asD(player["mission"].progress).div(player["mission"].progressTarget)
                }
            },
        },

        threatBar :{
            direction: RIGHT,
            width: 400,
            height: 30,

            baseStyle: {'background-color' : 'Black'},
            fillStyle: {'background-color' : 'Red'},
            borderStyle: {'border-color' : 'Red'},
            textStyle: {'color' : 'white'},
                        
            display() {
                if (player["mission"].inMission == true) {
                    if(asD(player["mission"].threat).gt(player["mission"].threatCap)==1){
                        return `Overt Threat Cap by ${formatWhole(getThreatRatio().times(new Decimal(100)))} %`
                    } else {
                        return `${formatWhole(player["mission"].threat)} threat (${formatWhole(getThreatPointGen(new Decimal(1)))}/s), cap at ${formatWhole(player["mission"].threatCap)}`}
                    }
            },

            progress() {
                if (player["mission"].inMission == true) {
                    return asD(player["mission"].threat).div(player["mission"].threatCap)}
            },
        },
    },
    
    update(diff){
        //Forcing Lock / Unlock & Tooltip
        if (player["mission"].inMission) {
            player["mission"].unlocked = true;
            tmp["mission"].tooltip = "In mission";
        } else {
            player["mission"].unlocked = false;
            tmp["mission"].tooltipLocked = "Not in mission";
        }
        
        // Starting step
        if(
            (asD(player["mission"].missionStepCurrent).lte(0))
            && player["mission"].inMission == true) {
                stepNext();
        // Regular loop
        } else if (player["mission"].inMission == true){
            player["mission"].progress = asD(player["mission"].progress).add(getProgressPointGen(diff).div(getThreatRatio()));            
            player["mission"].threat =  asD(player["mission"].threat).add(getThreatPointGen(diff));
            
            player["mission"].eventTimeAccumulator = asD(player["mission"].eventTimeAccumulator).add(diff)
            
            // console.log(asD(player["mission"].eventTimeAccumulator).toString()+ " " + diff)

            if(player["mission"].eventTimeAccumulator.gte(new Decimal(1)) == 1) {
            //      console.log("eventManager Called");
                  eventManager();
                  
                    player["mission"].threatCap = getThreatCap();
                    player["mission"].actorList.forEach(e => {
                        let tLife = asD(e.life.value);
                        let tDiff = new Decimal(0)
                        e.life.value = getLife(e);
                        if (tLife.cmp(e.life.value)!=0) {
                            tDiff = e.life.value.sub(tLife);
                            e.life.remain = asD(e.life.remain).add(tDiff);
                        }

                        if (asD(e.life.remain).lte(new Decimal (0)) == 1) {
                            e.quantity = asD(e.quantity).sub(new Decimal(1));
                            e.life.remain = new Decimal(e.life.value);
                        }

                        if (asD(e.quantity).lte(new Decimal (0) == 1)) {
                            e.quantity = new Decimal(0);
                            addEvent(e,{name : "selfdestruct", title : "Dead"})
                        }
                    })
                    

player["mission"].eventTimeAccumulator = asD(player["mission"].eventTimeAccumulator).sub(new Decimal(1));
            } ;

            if(asD(player["mission"].threat).lt(0)) player["mission"].threat = new Decimal(0);
            
            // Next step call
            if(asD(player["mission"].progress).gte(player["mission"].progressTarget)) stepNext();
            
            if (player["mission"].missionComplete == true) endMission();
        }
    },

})