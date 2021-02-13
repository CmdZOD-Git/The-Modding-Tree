function equipIsBuyable(cost) {
    tResult = true;
    tPath = player["hero"]

    for (currency in cost) {
        if(asD(player["hero"][currency]).lt(cost[currency])) tResult = false
    }
    return tResult
}

function equipPay(cost) {
    tPath = player["hero"]

    for (currency in cost) {
        tPath[currency] = tPath[currency].sub(cost[currency])
    }
}

function equipRefund(cost) {
    tPath = player["hero"]

    for (currency in cost) {
        tPath[currency] = tPath[currency].add(cost[currency])
    }
}

function totalEquipCost(currency) {
    let tResultArray= []
    tResultArray.length = 0;

    for (e in tmp["hero"].clickables) {
        if(!isNaN(e)){ // select only pseudo array object
            for (f in tmp["hero"].clickables[e].cost) {
                if (player["hero"].clickables[e] == "equiped") {
                    if (tResultArray[0].includes(f)) {
                        let arrIndex = tResultArray[0].indexOf(f)
                        tResultArray[1][arrIndex] = tResultArray[1][arrIndex].add(tmp["hero"].clickables[e].cost[f])
                    } else {
                        tResultArray[0].push(f)
                        tResultArray[1].push(tmp["hero"].clickables[e].cost[f])
                    }
                }
            }
        }
    }
    return tResultArray
}

function getEventLoadout(){

    let tResultArray = [];

    for (e in tmp["hero"].clickables) {
        if(!isNaN(e)){ // select only pseudo array object
            if (player["hero"].clickables[e] == "equiped" && (tmp["hero"].clickables[e].event)) {
                for (f of tmp["hero"].clickables[e].event) {
                    if (player["hero"].clickables[e] == "equiped") {
                        tResultArray.push(_.cloneDeep(f))                    
                    }
                }
            }
        }
    }

    let tPath = player["hero"].upgrades
    
    for (e of tPath) {
        if (tmp["hero"].upgrades[e].modToAdd != null && tmp["hero"].upgrades[e].modToAdd != undefined) {
            for (f of tmp["hero"].upgrades[e].modToAdd) {
                for (g of tResultArray) {
                    if (g.tags != null || g.tags != undefined) {
                        if(g.tags.includes(...f.addToTags) || f.addToTags.includes("all")) {
                            g.modStorage.push(_.cloneDeep(f))
                        }
                    }
                }
            }
        }
    }

    for (e of tPath) {
        if (tmp["hero"].upgrades[e].event != null && tmp["hero"].upgrades[e].event != undefined) {
            for (f of tmp["hero"].upgrades[e].event) {
                tResultArray.push(_.cloneDeep(f))
            }
        }
    }


    return tResultArray;
}

function getEquippedEventTitle(loadoutArray){
    let tString = ""
    loadoutArray.forEach(e => {tString = `${tString}[${e.title.toString()}]`})    
return tString
}

addLayer("hero", {
    name: "Hero", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "H", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		
        points: new Decimal(1),
		xp : new Decimal(0),
        
        equipMax: new Decimal(10),
        equipPoints: new Decimal(9),

        weaponSlot: new Decimal(0),
        weaponSlotMax : new Decimal(1),
        
        clickables : {[11] : "equiped"},

        equipedEvent : [], // array of effect to Add to Hero Actor eventStorage
        /*
        { need Name, optional Title
            name : "burst",
            title : "hero event test",
        },
        */
    }},
	
    tabFormat: {
        "Hero": {
            content:
                [
                "main-display",
                "resource-display",
                ["prestige-button","text to prestige here "],
                "buyables",
                "clickables",
                "upgrades",
                "milestones",
                ],
        },

        "Class": {
            content:
                [
                ["display-text","Class stuff goes here"],
                "buyables",
                "clickables",
                "upgrades",
                "milestones",
                ],
        },
        
        "Weapon": {
            content:
                [
                //["display-text","Weapon stuff goes here"],
                ["display-text",() => {return "You have " + formatWhole(player["hero"].equipPoints) + " of " + formatWhole(player["hero"].equipMax) + " Equip Points"}],
                ["display-text",() => {return "You have " + formatWhole(player["hero"].weaponSlot) + " of " + formatWhole(player["hero"].weaponSlotMax) + " Weapon Slots"}],
                ["display-text",() => {return `${getEquippedEventTitle(getEventLoadout())}`}],
                ["blank","10px"],
                "buyables",
                "clickables",
                "upgrades",
                "milestones",
                ],
        },

        "Gear": {
            content:
                [
                ["display-text",() => {return "You have " + formatWhole(player["hero"].equipPoints) + " of " + formatWhole(player["hero"].equipMax) + " Equip Points"}],
                ["blank","10px"],
                "buyables",
                "clickables",
                "upgrades",
                "milestones",
                ],
        },

    },

	branches:["hq"],
    color: "#4BDC13",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Levels", // Name of prestige currency
    baseResource: "XP", // Name of resource prestige is based on
    baseAmount() {return player.hero.xp}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 0.5, // Prestige currency exponent
	base:new Decimal(10),
    resetNothing : true,
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 15, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "h", description: "H: Reset for prestige points", onPress(){showTab("hero")}},
    ],
    layerShown : true,

    upgrades : {
        rows: 5,
        cols: 5,
        11: {
            title: "Rifle Crit", //**optional**. Displayed at the top in a larger font. It can also be a function that returns updating text. Can use basic HTML.
            description: "Crit Mod Test", //A description of the upgrade's effect. *You will also have to implement the effect where it is applied.* It can also be a function that returns updating text. Can use basic HTML.

            equipTab : "Class", //Capitalized to match tabs name
            unlocked(){if(player.subtabs["hero"].mainTabs == this.equipTab) return true}, // unlocked(): **optional**. A function returning a bool to determine if the upgrade is visible or not. Default is unlocked.

            cost: new Decimal(1), // A Decimal for the cost of the upgrade. By default, upgrades cost the main prestige currency for the layer.
            currencyDisplayName: "RP",
            currencyInternalName: "points",

            modToAdd : [{
                    name : "damageModifier",
                    title : "Crit UP !",
                    addToTags : ["rifle"],
                    eventChance : 50,
                    shotDamage : {mult : new Decimal(3)},                    
            }],            
        },

        12: {
            title: "Fast Advance", //**optional**. Displayed at the top in a larger font. It can also be a function that returns updating text. Can use basic HTML.
            description: "progress fast with no enemy", //A description of the upgrade's effect. *You will also have to implement the effect where it is applied.* It can also be a function that returns updating text. Can use basic HTML.

            equipTab : "Class", //Capitalized to match tabs name
            unlocked(){if(player.subtabs["hero"].mainTabs == this.equipTab) return true}, // unlocked(): **optional**. A function returning a bool to determine if the upgrade is visible or not. Default is unlocked.

            cost: new Decimal(1), // A Decimal for the cost of the upgrade. By default, upgrades cost the main prestige currency for the layer.
            currencyDisplayName: "RP",
            currencyInternalName: "points",

            event : [{
                name : "progressUp",
                title : "Fast Advance",

                tags : ["nothreat"],

                cooldown : new Decimal(1000), // in millisecond

                power : new Decimal (50),
            },],
        },

        13: {
            title: "Small Fry Stomper", //**optional**. Displayed at the top in a larger font. It can also be a function that returns updating text. Can use basic HTML.
            description: "Enemy quantity increases threat cap", //A description of the upgrade's effect. *You will also have to implement the effect where it is applied.* It can also be a function that returns updating text. Can use basic HTML.

            equipTab : "Class", //Capitalized to match tabs name
            unlocked(){if(player.subtabs["hero"].mainTabs == this.equipTab) return true}, // unlocked(): **optional**. A function returning a bool to determine if the upgrade is visible or not. Default is unlocked.

            cost: new Decimal(1), // A Decimal for the cost of the upgrade. By default, upgrades cost the main prestige currency for the layer.
            currencyDisplayName: "RP",
            currencyInternalName: "points",

            event : [{
                name : "threatCapUp",
                title : "CAP per Qt",

                tags : ["perenemyquantity"],

                cooldown : new Decimal(1000), // in millisecond

                power : new Decimal (1),
            },],
        },

        14: {
            title: "Building Success", //**optional**. Displayed at the top in a larger font. It can also be a function that returns updating text. Can use basic HTML.
            description: "Better progress and threat cap per step", //A description of the upgrade's effect. *You will also have to implement the effect where it is applied.* It can also be a function that returns updating text. Can use basic HTML.

            equipTab : "Class", //Capitalized to match tabs name
            unlocked(){if(player.subtabs["hero"].mainTabs == this.equipTab) return true}, // unlocked(): **optional**. A function returning a bool to determine if the upgrade is visible or not. Default is unlocked.

            cost: new Decimal(1), // A Decimal for the cost of the upgrade. By default, upgrades cost the main prestige currency for the layer.
            currencyDisplayName: "RP",
            currencyInternalName: "points",

            event : [{
                name : "threatCapUp",
                title : "Per Step",

                tags : ["perstep"],

                cooldown : new Decimal(1000), // in millisecond

                power : new Decimal (10),
            },

            {
                name : "progressUp",
                title : "Per Step",

                tags : ["perstep"],

                cooldown : new Decimal(1000), // in millisecond

                power : new Decimal (1),
            },],
        },
    },

    clickables: {
        masterButtonPress(){return console.log("Master button clicked !")},
        masterButtonText: "Reset equipments",
        showMasterButton(){
            let showInArray = ["Weapon","Gear"] // Defaults to true if absent, put subtabs in array you want master button in
            return [showInArray].some(a => a == player.subtabs["hero"].mainTabs) ? true : false}, 
        rows: 9,
        cols: 9,

        11: {
            title:"M-X16",
            equipTab : "Weapon", //Capitalized to match tabs name

            cost:{
                equipPoints: new Decimal(1),
                weaponSlot: new Decimal(1)
            },

            display() {return `${player[this.layer].clickables[this.id]}`}, // returning state of the clickable
            unlocked(){if(player.subtabs["hero"].mainTabs == this.equipTab) return true},
            canClick(){
                if(player[this.layer].clickables[this.id] == "equiped" ||
                equipIsBuyable(this.cost))
                return true
            },
            onClick(){
                if (player[this.layer].clickables[this.id] != "equiped") {
                    player[this.layer].clickables[this.id]  = "equiped";
                    equipPay(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                } else {
                    player[this.layer].clickables[this.id] = "unequiped";
                    equipRefund(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                }
            },

            event : [{name : "weapon",
                title : "Rifle",

                tags : ["rifle", "burst"],

                cooldown : new Decimal(1000), // in millisecond
                shotCount : new Decimal(3),
                shotDamage : new Decimal(10),

                modStorage : [{
                    name : "damageModifier",
                    shotDamage : {flat : new Decimal(10)},
                },],
            }],
        },

        12: {
            title:"Shotgun Ben2",
            equipTab : "Weapon", //Capitalized to match tabs name
            cost:{
                equipPoints: new Decimal(1),
                weaponSlot: new Decimal(1)
            },
            display() {return `${player[this.layer].clickables[this.id]}`}, // returning state of the clickable
            unlocked(){if(player.subtabs["hero"].mainTabs == this.equipTab) return true},
            
            canClick(){
                if(player[this.layer].clickables[this.id] == "equiped" ||
                equipIsBuyable(this.cost))
                return true
            },
            onClick(){
                if (player[this.layer].clickables[this.id] != "equiped") {
                    player[this.layer].clickables[this.id]  = "equiped";
                    equipPay(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                } else {
                    player[this.layer].clickables[this.id] = "unequiped";
                    equipRefund(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                }
            },

            event : [{
                name : "weapon",
                title : "Shotgun",
                cooldown : new Decimal(1000), // in millisecond
                shotCount : new Decimal(6),
                shotDamage : new Decimal(5),
            }],
        },

        13: {
            title:"Rocket Launcher",
            equipTab : "Weapon", //Capitalized to match tabs name
            cost:{
                equipPoints: new Decimal(5),
                weaponSlot: new Decimal(1)
            },
            display() {return `${player[this.layer].clickables[this.id]}`}, // returning state of the clickable
            unlocked(){if(player.subtabs["hero"].mainTabs == this.equipTab) return true},
            
            canClick(){
                if(player[this.layer].clickables[this.id] == "equiped" ||
                equipIsBuyable(this.cost))
                return true
            },
            onClick(){
                if (player[this.layer].clickables[this.id] != "equiped") {
                    player[this.layer].clickables[this.id]  = "equiped";
                    equipPay(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                } else {
                    player[this.layer].clickables[this.id] = "unequiped";
                    equipRefund(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                }
            },

            event : [{
                name : "weapon",
                title : "Rocket",

                favoredtargetTags : ["structure"],

                cooldown : new Decimal(1000), // in millisecond
                shotCount : new Decimal(1),
                shotDamage : new Decimal(100),
            }],
        },

        /* Obsoloete with new Threat rules
        61: {
            title:"Medikit",
            equipTab : "Gear", //Capitalized to match tabs name
            cost:{
                equipPoints: new Decimal(1),
            },
            display() {return `${player[this.layer].clickables[this.id]}`}, // returning state of the clickable
            unlocked(){if(player.subtabs["hero"].mainTabs == this.equipTab) return true},
            
            canClick(){
                if(player[this.layer].clickables[this.id] == "equiped" ||
                equipIsBuyable(this.cost))
                return true
            },
            onClick(){
                if (player[this.layer].clickables[this.id] != "equiped") {
                    player[this.layer].clickables[this.id]  = "equiped";
                    equipPay(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                } else {
                    player[this.layer].clickables[this.id] = "unequiped";
                    equipRefund(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                }
            },

            event : [{
                name : "recover",
                title : "Over threat recover",
                cooldown : new Decimal(1000), // in millisecond
                recoverAmount : new Decimal(10),
                recoverRatioThreshold : new Decimal(1),
                tags : ["thresholdbased"],
            }],
        },
        

        62: {
            title:"Recover kit",
            equipTab : "Gear", //Capitalized to match tabs name
            cost:{
                equipPoints: new Decimal(1),
            },
            display() {return `${player[this.layer].clickables[this.id]}`}, // returning state of the clickable
            unlocked(){if(player.subtabs["hero"].mainTabs == this.equipTab) return true},
            
            canClick(){
                if(player[this.layer].clickables[this.id] == "equiped" ||
                equipIsBuyable(this.cost))
                return true
            },
            onClick(){
                if (player[this.layer].clickables[this.id] != "equiped") {
                    player[this.layer].clickables[this.id]  = "equiped";
                    equipPay(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                } else {
                    player[this.layer].clickables[this.id] = "unequiped";
                    equipRefund(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                }
            },

            event : [{
                name : "recover",
                title : "No enemy fast recovery",
                cooldown : new Decimal(1000), // in millisecond
                recoverAmount : new Decimal(20),
                //recoverRatioThreshold : new Decimal(0),
                tags : ["noenemyleft"],
            }],
        },
        */

        63: {
            title:"Grenade",
            equipTab : "Gear", //Capitalized to match tabs name
            cost:{
                equipPoints: new Decimal(1),
            },
            display() {return `${player[this.layer].clickables[this.id]}`}, // returning state of the clickable
            unlocked(){if(player.subtabs["hero"].mainTabs == this.equipTab) return true},
            canClick(){
                if(player[this.layer].clickables[this.id] == "equiped" ||
                equipIsBuyable(this.cost))
                return true
            },
            onClick(){
                if (player[this.layer].clickables[this.id] != "equiped") {
                    player[this.layer].clickables[this.id]  = "equiped";
                    equipPay(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                } else {
                    player[this.layer].clickables[this.id] = "unequiped";
                    equipRefund(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                }
            },

            event : [{
                name : "weapon",
                title : "Grenade",
                cooldown : new Decimal(1000), // in millisecond
                eventChance : 10, // flat in percent chance to fire
                shotCount : new Decimal(10),
                shotDamage : new Decimal(10),
            }],
        },

        64: {
            title:"Armor",
            equipTab : "Gear", //Capitalized to match tabs name
            cost:{
                equipPoints: new Decimal(1),
            },
            display() {return `${player[this.layer].clickables[this.id]}`}, // returning state of the clickable
            unlocked(){if(player.subtabs["hero"].mainTabs == this.equipTab) return true},
            canClick(){
                if(player[this.layer].clickables[this.id] == "equiped" ||
                equipIsBuyable(this.cost))
                return true
            },
            onClick(){
                if (player[this.layer].clickables[this.id] != "equiped") {
                    player[this.layer].clickables[this.id]  = "equiped";
                    equipPay(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                } else {
                    player[this.layer].clickables[this.id] = "unequiped";
                    equipRefund(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                }
            },

            event : [{
                name : "threatCapUp",
                title : "Armor up",
                tags : ["accumulate"],
                cooldown : new Decimal(1000), // in millisecond
            }],
        },

        65: {
            title:"Turret Layer",
            equipTab : "Gear", //Capitalized to match tabs name
            cost:{
                equipPoints: new Decimal(1),
            },
            display() {return `${player[this.layer].clickables[this.id]}`}, // returning state of the clickable
            unlocked(){if(player.subtabs["hero"].mainTabs == this.equipTab) return true},
            canClick(){
                if(player[this.layer].clickables[this.id] == "equiped" ||
                equipIsBuyable(this.cost))
                return true
            },
            onClick(){
                if (player[this.layer].clickables[this.id] != "equiped") {
                    player[this.layer].clickables[this.id]  = "equiped";
                    equipPay(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                } else {
                    player[this.layer].clickables[this.id] = "unequiped";
                    equipRefund(this.cost);
                    console.log(`${tmp[this.layer].clickables[this.id].title} ${player[this.layer].clickables[this.id]} !`)
                }
            },

            event : [{
                name : "summonactor",
                title : "Deploy Turret",
                tags : ["forcenewactor"], // make sure a new group is created instead of reinforcing existing turrent
                cooldown : new Decimal(1000), // in millisecond
                eventChance : 10,
                summonName : "hqturret",
                summonExtraParameters : {},
                summonExtraEvents : 
                    [{
                        name : "limitedaction",
                        title : "Limited battery",
                        counter : new Decimal(10),
                    }],
                power : new Decimal(1),
            }],
        },

    },

    update(diff){
    },
})