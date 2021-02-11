let modInfo = {
	name: "The EDF Tree",
	id: "EDF Tree",
	author: "CmdZOD",
	pointsName: "Rec. points",
	discordName: "",
	discordLink: "",
	initialStartPoints: new Decimal (10), // Used for hard resets and new players
	
	offlineLimit: 12,  // In hours
}

// Set your version in num and name
let VERSION = {
	num: "0.5",
	name: "Public release",
}

let changelog = `<h1>Changelog:</h1><br>
	<h3>v0.5</h3><br>
		- first public release
	<h3>v0.4</h3><br>
		- threat is now static instead of per second

	<h3>v0.3</h3><br>
		- heavy prototyping to add all the features needed by the mission layer

	<h3>v0.1</h3><br>
		- HQ, Hero and mission layer

`

let winText = `Congratulations! You have reached the end and beaten this game, but for now...`

// If you add new functions anywhere inside of a layer, and those functions have an effect when called, add them here.
// (The ones here are examples, all official functions are already taken care of)
var doNotCallTheseFunctionsEveryTick = [
										"pickFromIndexList",
										"getActorIndexListBySubArray",
										"getActorIndexListByFilter",
										"chancePercent",
										"otherSide",
										"getRandomInt",
										"debugActorList",
										"canProgressPointGen",
										"getProgressPointGen",
										"endMission",
										"stepNext",
										"canGenThreat",
										"getThreatPointGen",
										"setThreatCap",
										"populateActor",
										"addActor",
										"addEvent",
										"altPopulateEventWatchList",
										"eventManager",
										"eventCheck",
										"eventEffect",
										]

function getStartPoints(){
    return new Decimal(modInfo.initialStartPoints)
}

// Determines if it should show points/sec
function canGenPoints(){
	return false
}

// Calculate points/sec!
function getPointGen() {
	if(!canGenPoints())
		return new Decimal(0)

	let gain = new Decimal(1)
	return gain
}

// You can add non-layer related variables that should to into "player" and be saved here, along with default values
function addedPlayerData() { return {
	extraTime : 0,
	extraSpeed : 1,

// Global variables
	globalEventManagerLastCallTime : 0, // need to be global to be checked by shoutbox
	globalShoutbox : [], // expected use, add object w/ "name, createTime, extra info " ie, {name : "dead", createTime : TIME, amount : new Decimal(56)}
}}


// Display extra things at the top of the page
var displayThings = [
	()=>{return `Extra time stored : ${player.extraTime.toFixed(0)} second(s)`},
	()=>{return `Current Speed : x${player.extraSpeed.toFixed(0)}` },
]

// Determines when the game "ends"
function isEndgame() {
	return asD(player.points).gte(new Decimal("e280000000"))
}



// Less important things beyond this point!

// You can change this if you have things that can be messed up by long tick lengths
function maxTickLength() {
	return(3600) // Default is 1 hour which is just arbitrarily large
}

// Use this if you need to undo inflation from an older version. If the version is older than the version that fixed the issue,
// you can cap their current resources with this.
function fixOldSave(oldVersion){
}