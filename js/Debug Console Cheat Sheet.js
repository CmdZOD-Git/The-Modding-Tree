Debug Console Cheat Sheet
addEvent(player.mission.actorList[0],{name : "burst", title :"bursting"})
addActor(actorLib.antswarm, {quantity : new Decimal(getRandomInt(100,100).toString())});
addActor(actorLib.antswarm);
addActor(actorLib.anthill);
addActor(actorLib.antswarm, {quantity : new Decimal(getRandomInt(1000000,1000000).toString())});
player = JSON.parse(JSON.stringify(player))
getThreatCap(player.mission.actorList[0])
addActor(actorLib.antregenerator);