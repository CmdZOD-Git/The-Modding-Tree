addLayer("hq", {
    name: "HQ", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "HQ", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 5, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(1),
        missionParameters: new Object(),
        plannedMission: false,
    }},

    tabFormat: {
        "HQ": {
            content:
                [
                "main-display",
                "ressource-display",
                ["prestige-button","text to prestige here "],
                "buyables",
                "milestones",
                ],
                
        },

        "Mission planner": {
            content:
                [
                ["display-text","Please select a mission."],
                ["display-text",function(){
                    let tPath = player["hq"].plannedMission;
                    if(tPath){return `${player["hq"].plannedMission.title}`}
                }],
                ["display-text",function(){
                    let tPath = player["hq"].plannedMission;
                    if(tPath){return `Mission Rank : ${tPath.missionParameters.missionRank} - Mission Steps : ${tPath.missionParameters.missionStepTarget}`}
                }],
                ["display-text",function(){
                    let tPath = player["hq"].plannedMission;
                    if(tPath){return `Description : ${tPath.missionParameters.missionShortDescription}`}
                }],
                ["blank","1rem"],
                "clickables",
                ],
        },
    },

    branches:["mission"],
    color: "Blue",

    nodeStyle : {
        'border-radius' : '1rem',

    },
    
    requires: new Decimal(1), // Can be a function that takes requirement increases into account
    resource: "Levels", // Name of prestige currency
    baseResource: "Objectives", // Name of resource prestige is based on
    baseAmount() {return player.mission.points}, // Get the current amount of baseResource
    resetDescription:"Level up ",
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
	base: new Decimal(10),
    resetNothing : true,

    clickables: {
        rows: 9,
        cols: 9,

        13: {
            style: {'color': 'white'},

            title() {return (player["mission"].inMission == false) ? "Mission Start" : "Cancel Mission"},
                            
            display : "mission control",
            effect(){},
            unlocked(){return true},
            
            canClick(){if (
                ((player["mission"].inMission == false) && (player["hq"].plannedMission))
                || (player["mission"].inMission == true)) {
                return true
                }
            },
            
            onClick(){
                if((player["mission"].inMission == false) && (player["hq"].plannedMission)){
                                                                    
                    player["mission"].missionParameters = player["hq"].plannedMission.missionParameters;
                    player["mission"].missionEventLoadout = getEventLoadout();
                    
                    // console.log(player["mission"].missionParameters);

                    player["mission"].inMission = true
                } else {
                    endMission();
                    console.log("mission canceled");      
                }

            },
        },
        
        21: {
            title:"Story 01",
            style: {'color': 'white'},
            
            missionParameters:{  //setup all mission parameters here, they will be passed on to hq mission planner and then to mission proper
                missionRank : new Decimal(1),
                missionStepTarget : new Decimal(3),
                missionShortDescription : `Earth is being invaded by strange giants ants.<br />Please fight back...<br />End of transmission`
            },

            display() {return `Rank ${this.missionParameters.missionRank}*\n${this.missionParameters.missionStepTarget} Steps`},
            effect(){},
            unlocked(){return true},
            
            canClick(){
                return true
                //    (player["mission"].inMission == false) ? true : false
            },
            
            onClick(){
                player["hq"].plannedMission = Object.assign(this)
                // plannedMission = tmp[this.layer].clickables[this.id]
                console.log(player["hq"].plannedMission)
            },
        },

        51: {
            title: "Mission - Easy",
            style: {'color': 'white'},
            
            missionParameters:{  //setup all mission parameters here, they will be passed on to hq mission planner and then to mission proper
                missionRank : new Decimal(1),
                missionStepTarget : new Decimal(3),
                missionShortDescription : "An easy mission to get your feet wet",
            },

            display() {return `Rank ${this.missionParameters.missionRank}*\n${this.missionParameters.missionStepTarget} Steps`},
            effect(){},
            unlocked(){return true},
            
            canClick(){
                return true
                //    (player["mission"].inMission == false) ? true : false
            },
            
            onClick(){
                player["hq"].plannedMission = Object.assign(this)
                // plannedMission = tmp[this.layer].clickables[this.id]
                console.log(player["hq"].plannedMission)
            },
        },

        52: {
            title: "Mission - Medium",
            style: {'color': 'white'},
            
            missionParameters:{  //setup all mission parameters here, they will be passed on to hq mission planner and then to mission proper
                missionRank : new Decimal(2),
                missionStepTarget : new Decimal(5),
                missionShortDescription : "An medium mission, the definition of average",
            },

            display() {return `Rank ${this.missionParameters.missionRank}*\n${this.missionParameters.missionStepTarget} Steps`},
            effect(){},
            unlocked(){return true},
            
            canClick(){
                return true
                //    (player["mission"].inMission == false) ? true : false
            },
            
            onClick(){
                player["hq"].plannedMission = Object.assign(this)
                // plannedMission = tmp[this.layer].clickables[this.id]
                // console.log(player["hq"].plannedMission)
            },
        },
    },

    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },

    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    
    row: 10, // Row the layer is in on the tree (0 is the first row)
    
    hotkeys: [
        {key: "q", description: "Q: Reset for prestige points", onPress(){showTab("hq")}},
    ],
    
    layerShown(){return true}
})