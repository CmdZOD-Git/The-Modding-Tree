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
        cols: 3,
        11: {
            title: "MOD", //**optional**. Displayed at the top in a larger font. It can also be a function that returns updating text. Can use basic HTML.
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
            
            // effect(): **optional**. A function that calculates and returns the current values of any bonuses from the upgrade. Can return a value or an object containing multiple values.
            // effectDisplay(): **optional**. A function that returns a display of the current effects of the upgrade with formatting. Default displays nothing. Can use basic HTML.            
            // fullDisplay(): **OVERRIDE**. Overrides the other displays and descriptions, and lets you set the full text for the upgrade. Can use basic HTML.
            // onPurchase(): **optional**. This function will be called when the upgrade is purchased. Good for upgrades like "makes this layer act like it was unlocked first".
            // style: **optional**. Applies CSS to this upgrade, in the form of an object where the keys are CSS attributes, and the values are the values for those attributes (both as strings).
            /*
            By default, upgrades use the main prestige currency for the layer. You can include these to change them (but it needs to be a Decimal):
            - currencyDisplayName: **optional**. The name to display for the currency for the upgrade.
            - currencyInternalName: **optional**. The internal name for that currency.
            - currencyLayer: **optional**. The internal name of the layer that currency is stored in. If it's not in a layer (like Points), omit. If it's not stored directly in a layer, instead use the next feature.
            - currencyLocation: **optional**. If your currency is stored in something inside a layer (e.g. a buyable's amount), you can access it this way. This is a function returning the object in "player" that contains the value (like `player[this.layer].buyables`)

            If you want to do something more complicated like upgrades that cost two currencies, you can override the purchase system with these (and you need to use fullDisplay as well)
            - canAfford(): **OVERRIDE**, a function determining if you are able to buy the upgrade
            - pay(): **OVERRIDE**, a function that reduces your currencies when you buy the upgrade
            */
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
        */

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
                tags : ["noenemyleft"]
            }],
        },

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
                eventChance : 10, // flat int percent chance to fire
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
                name : "armor",
                title : "Armor up",
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