kaboom({
  global: true,
  fullscreen: true,
  scale: 2,
  debug: true,
  clearColor: [0, 0, 0, 1],
})

const MOVE_SPEED = 120
const JUMP_FORCE = 360
const BIG_JUMP_FORCE = 550
let CURRENT_JUMP_FORCE = JUMP_FORCE
let isJumping = true
const FALL_DEATH = 400


loadSprite('flag-Finish', 'https://img.icons8.com/office/2x/empty-flag.png')

loadRoot('https://i.imgur.com/')
loadSprite('coin', 'wbKxhcd.png')
loadSprite('evil-shroom', 'KPO3fR9.png')
loadSprite('brick', 'pogC9x5.png')
loadSprite('block', 'M6rwarW.png')
loadSprite('mario', 'Wb1qfhK.png')
loadSprite('mushroom', '0wMd92p.png')
loadSprite('surprise', 'gesQ1KP.png')
loadSprite('unboxed', 'bdrLpi6.png')
loadSprite('pipe-top-left', 'ReTPiWY.png')
loadSprite('pipe-top-right', 'hj2GK4n.png')
loadSprite('pipe-bottom-left', 'c1cYSbt.png')
loadSprite('pipe-bottom-right', 'nqQ79eI.png')
loadSprite('blue-block', 'fVscIbn.png')
loadSprite('blue-brick', '3e5YRQd.png')
loadSprite('blue-steel', 'gqVoI2b.png')
loadSprite('blue-evil-shroom', 'SvV4ueD.png')
loadSprite('blue-surprise', 'RMqCc1G.png')


var pipeSound = new Audio('./sound/WarpPipe.mp3');
var looseSound = new Audio("./sound/GameOver.mp3");
var lvlFinishSound = new Audio("./sound/LevelComplete.mp3");
var coinSound = new Audio('./sound/Coin.mp3');
var killSound = new Audio("./sound/Kill.mp3");
var breakSound = new Audio("./sound/Bump.wav");
var powerUp = new Audio("./sound/Powerup.wav");

var backgroundSon = new Audio("./sound/MarioWorld.mp3");


scene("game", ({ level, score }) => {
  looseSound.pause();
  lvlFinishSound.pause();
  backgroundSon.play();
  layers(['bg', 'obj', 'ui'], 'obj')

  const maps = [
    [
      '                     %%%              ',
      '                  =         ==        ',
      '               =========          %%% ',
      '                                      ',
      '          %                     ==    ',
      '                                    = ',
      '                             =        ',
      '           =                      =   ',
      '                                      ',
      '     ?   =*=%=                 =      ',
      '                  =                   ',
      '                            -+    =   ',
      '                    ^   ^   ()        ',
      '==============================   =====',
    ],
    [
      '£       ££££££££££££££££££££££££££££££££££££££',
      '£                                            £',
      '£                                            £',
      '£                                            £',
      '£                                           t£',
      '£                                          xx£',
      '£                                         xxx£',
      '£        @@@@@@                 x   xxxxxxxxx£',
      '£                            x  x   xxxxxxxxx£',
      '£     ?                   x  x  xx  xxxxxxxxx£',
      '£               z   z  x  x  x  x   xxxxxxxxx£',
      '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
    ]
  ]

  const levelCfg = {
    width: 20,
    height: 20,
    '=': [sprite('block'), solid()],
    '$': [sprite('coin'), 'coin'],
    '%': [sprite('surprise'), solid(), 'coin-surprise'],
    '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
    '}': [sprite('unboxed'), solid()],
    '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
    ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
    '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
    '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
    '^': [sprite('evil-shroom'), solid(), 'dangerous'],
    '#': [sprite('mushroom'), solid(), 'mushroom', body()],
    '!': [sprite('blue-block'), solid(), scale(0.5)],
    '£': [sprite('blue-brick'), solid(), scale(0.5)],
    'z': [sprite('blue-evil-shroom'), solid(), scale(0.5), 'dangerous'],
    '@': [sprite('blue-surprise'), solid(), scale(0.5), 'coin-surprise'],
    'x': [sprite('blue-steel'), solid(), scale(0.5)],
    't': [sprite('flag-Finish'), solid(), scale(0.15), 'finish'],
    '?': [sprite('surprise'), solid(), 'sound'],
  }

  
  const gameLevel = addLevel(maps[level], levelCfg)

  const scoreLabel = add([
    text(score),
    pos(30, 6),
    layer('ui'),
    {
      value: score,
    }
  ])

  add([text('level ' + parseInt(level + 1) ), pos(40, 6)])
  
  function big() {
    let timer = 0
    let isBig = false
    return {
      update() {
        if (isBig) {
          CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
          timer -= dt()
          if (timer <= 0) {
            this.smallify()
          }
        }
      },
      isBig() {
        return isBig
      },
      smallify() {
        this.scale = vec2(1)
        CURRENT_JUMP_FORCE = JUMP_FORCE
        timer = 0
        isBig = false
      },
      biggify(time) {
        this.scale = vec2(2)
        timer = time
        isBig = true     
      }
    }
  }

  const player = add([
    sprite('mario'), solid(),
    pos(30, 0),
    body(),
    big(),
    origin('bot')
  ])

  action('mushroom', (m) => {
    m.move(20, 0)
  })

  player.on("headbump", (obj) => {
    if (obj.is('coin-surprise')) {
      breakSound.play()
      gameLevel.spawn('$', obj.gridPos.sub(0, 1))
      destroy(obj)
      gameLevel.spawn('}', obj.gridPos.sub(0,0))
    }
    if (obj.is('mushroom-surprise')) {
      breakSound.play()
      gameLevel.spawn('#', obj.gridPos.sub(0, 1))
      destroy(obj)
      gameLevel.spawn('}', obj.gridPos.sub(0,0))
    }
    if (obj.is('sound')) {
      backgroundSon.play();
    }
  })

  player.collides('mushroom', (m) => {
    powerUp.play()
    destroy(m)
    player.biggify(6)
  })

  player.collides('coin', (c) => {
    coinSound.play()
    destroy(c)
    scoreLabel.value++
    scoreLabel.text = scoreLabel.value
  })

  const ENEMY_SPEED = 20

  action('dangerous', (d) => {
    d.move(-ENEMY_SPEED, 0)
  })

  player.collides('dangerous', (d) => {
    if (isJumping) {
      killSound.play()
      destroy(d)
    } else {
      backgroundSon.pause()
      looseSound.play()
      go('lose', { score: scoreLabel.value})
    }
  })

  player.action(() => {
    camPos(player.pos)
    if (player.pos.y >= FALL_DEATH) {
      backgroundSon.pause()
      looseSound.play()
      go('lose', { score: scoreLabel.value})
    }
  })

  player.collides('pipe', () => {
    keyPress('down', () => {
      backgroundSon.pause()
      pipeSound.play()
      go('game', {
        level: (level + 1) % maps.length,
        score: scoreLabel.value
      })
    })
  })

  player.collides('finish', () => {
    backgroundSon.pause()
    lvlFinishSound.play()
    go('finish', {
      score: scoreLabel.value
    })
  })
  

  keyDown('left', () => {
    player.move(-MOVE_SPEED, 0)
  })

  keyDown('right', () => {
    player.move(MOVE_SPEED, 0)
  })

  player.action(() => {
    if(player.grounded()) {
      isJumping = false
    }
  })

  keyPress('space', () => {
    if (player.grounded()) {
      isJumping = true
      player.jump(CURRENT_JUMP_FORCE)
    }
  })
})

scene('lose', ({ score }) => {
  add([text("You Lose avec " + score, 32), origin('center'), pos(width()/2, height()/ 2)])
  add([
		rect(160, 20),
		origin('center'), pos(width()/2, height()/ 2+75),
		"button",
		{
			clickAction: () => go('game', { level: 0, score: 0}),
		},
	]);

	add([
		text("Play Again"),
		origin('center'), pos(width()/2, height()/ 2+75),
		color(0, 0, 0)
	]);

  action("button", b => {

		if (b.isHovered()) {
			b.use(color(0.7, 0.7, 0.7));
		} else {
			b.use(color(1, 1, 1));
		}

		if (b.isClicked()) {
			b.clickAction();
		}

	});
  
})

scene('finish', ({ score }) => {
  $.get( "score.php", { name: "Nathan", score: score+"" } )
  $.ajax({
    type: "GET",
    url: "score.txt",
    error:function(msg){
             // message en cas d'erreur :
             alert( "Error !: " + msg );
             },
    success:function(data){
             // affiche le contenu du fichier dans le conteneur dédié :
              var array = data.split(';');
              var str = "HALL OF FAME !!! \nPlayer   Coin \n";
              var tmp;
              for (let i = 0; i < array.length-1; i++) {
                tmp = array[i].split("-");
                str = str + tmp[0] + "  "+ tmp[1] + "\n";
              }
              add([text("You Win avec "+ score+ '\n \n'+str, 32), origin('center'), pos(width()/2, height()/ 2)])
              add([
                rect(160, 20),
                origin('center'), pos(width()/2, height()/ 2+150),
                "button",
                {
                  clickAction: () => go('game', { level: 0, score: 0}),
                },
              ]);
            
              add([
                text("Play Again"),
                origin('center'), pos(width()/2, height()/ 2+150),
                color(0, 0, 0)
              ]);
            
              action("button", b => {
            
                if (b.isHovered()) {
                  b.use(color(0.7, 0.7, 0.7));
                } else {
                  b.use(color(1, 1, 1));
                }
            
                if (b.isClicked()) {
                  b.clickAction();
                }
            
              });
             }
    });
  
})


scene("menu", () => {

	add([
		text("Mario game"),
    origin('center'), pos(width()/2, height()/ 2-30),
		scale(3),
	]);

	add([
		rect(160, 20),
		origin('center'), pos(width()/2, height()/ 2+30),
		"button",
		{
			clickAction: () => go('game', { level: 0, score: 0}),
		},
	]);

	add([
		text("Play game"),
		origin('center'), pos(width()/2, height()/ 2+30),
		color(0, 0, 0)
	]);

	add([
		rect(160, 20),
		origin('center'), pos(width()/2, height()/ 2+60),
		"button",
		{
			clickAction: () => window.open('https://kaboomjs.com/', '_blank'),
		},
	]);

	add([
		text("Learn Kaboom.js"),
		origin('center'), pos(width()/2, height()/ 2+60),
		color(0, 0, 0)
	]);

	action("button", b => {

		if (b.isHovered()) {
			b.use(color(0.7, 0.7, 0.7));
		} else {
			b.use(color(1, 1, 1));
		}

		if (b.isClicked()) {
			b.clickAction();
		}

	});

});

// start("game", { level: 0, score: 0})
start("menu")