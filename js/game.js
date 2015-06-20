/*
 *    game.js
 *    All of the magic happens here
 */

YINS.Game = function(game) {
	this.music =  null;
	this.map = {};
	this.layer = {};
	this.player = {};
	this.controls = {};
	this.previousCoords = {};
	this.slime = {};
};

YINS.Game.prototype = {

	create: function() {

		/* TODO: transition smoothly from mainmenu music to this */
		this.music = YINS.game.add.audio('gameMusic');
		this.music.loopFull(0.5);

		YINS.game.stage.backgroundColor = YINS.color.green_light;
		
		/* Set up tilemap */
		this.map = YINS.game.add.tilemap('map');
		this.map.addTilesetImage('kenney platformer', 'spritesheet');

		// FIXME: 
		// Somehow all tiles won't collide anymore when
		// collision on 124 is set.
		this.map.setCollision([153, 333]);
		
		this.layer = this.map.createLayer('ground');
		this.layer.setScale(YINS.sprite_scale);
		this.layer.smoothed = false;
		this.layer.resizeWorld();

		/* Add sprites to the game world */
		this.player = YINS.game.add.sprite(YINS.game.world.centerX, YINS.game.world.centerY, 'spritesheet', 19);
		console.log('%cSpawning player at ' + YINS.game.world.centerX + ', ' + YINS.game.world.centerY, 'color: white; background: #b39ddb');
		this.slime = YINS.game.add.sprite(YINS.game.world.centerX + 300, YINS.game.world.centerY, 'spritesheet', 230);

		/* Declare animations */
		this.player.animations.add('idle', [19]);
		this.player.animations.add('walk', [19, 20, 21], 8);
		this.player.animations.add('down', [28]);
		this.player.animations.add('up', [29], 10);
		
		this.slime.animations.add('idle', [231, 230, 229], 6);

		/* Enable ARCADE physics engine 
		You can read more about this in the documentation: http://phaser.io/docs/2.3.0/Phaser.Physics.Arcade.html
		--> For documentation on the body property of physics enabled sprites,
		    see this article: http://phaser.io/docs/2.3.0/Phaser.Physics.Arcade.Body.html */
		YINS.game.physics.startSystem(Phaser.Physics.ARCADE);

		// Enable ARCADE physics on sprites
		YINS.game.physics.enable(this.player, Phaser.Physics.ARCADE);
		YINS.game.physics.enable(this.slime, Phaser.Physics.ARCADE);

		/* Set gravity of the whole game world 
		This can be manually changed on a per sprite basis by setting
		SPRITE.body.gravity.y = GRAVITY */
		YINS.game.physics.arcade.gravity.y = 1000;

		/* Change properties of the player sprite */
		this.player.scale.setTo(YINS.sprite_scale);
		this.player.smoothed = false;
		this.player.anchor.setTo(0.5, 0.5);
		this.player.body.collideWorldBounds = true;
		// Set initial previous coordinates to spawn
		this.previousCoords.x = this.player.body.x;
		this.previousCoords.y = this.player.body.y;
		
		/* Change properties of the slime sprite */
		this.slime.scale.setTo(YINS.sprite_scale);
		this.slime.smoothed = false;
		this.slime.anchor.setTo(0.5, 0.5);
		this.slime.body.collideWorldBounds = true;

		// Player's direction is kept track of because
		// it is needed for playing the right animations
		// 0 = left, 1 = right
		this.player.direction = 1;

		/* Set controls */
		this.controls = YINS.game.input.keyboard.createCursorKeys();
		this.controls.d = YINS.game.input.keyboard.addKey(Phaser.Keyboard.D);
		this.controls.a = YINS.game.input.keyboard.addKey(Phaser.Keyboard.A);
		this.controls.w = YINS.game.input.keyboard.addKey(Phaser.Keyboard.W);
		this.controls.shoot = YINS.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

		/* Camera settings */
		YINS.game.camera.follow(this.player);
		
	},

	update: function() {
		
		/* Set collisions between player and tilemap */
		YINS.game.physics.arcade.collide(this.player, this.layer);
		
		/* Set collisions between slime and tilemap */
		YINS.game.physics.arcade.collide(this.slime, this.layer);
		
		this.slime.play('idle');

		/* Player's velocity has to be set to 0 again,
		otherwise the player would run forever when it once pressed a button */
		this.player.body.velocity.x = 0;

		/*
		 *	Check for and handle player movement
		 */
		if (this.controls.right.isDown || this.controls.d.isDown) {
			// If the player is turned left
			// change direction to right
			if (this.player.direction === 0) {
				this.player.scale.x *= -1;
				this.player.direction = 1;
			}

			this.player.body.velocity.x = 350;
			this.player.play('walk');
		}
		else if (this.controls.left.isDown || this.controls.a.isDown) {
			// If the player is turned right
			// change direction to left
			if (this.player.direction == 1) {
				this.player.scale.x *= -1;
				this.player.direction = 0;
			}

			this.player.body.velocity.x = -350;
			this.player.play('walk');
		}
		else {
			// When there are absolutely no inputs from the user
			this.player.play('idle');
		}

		if ((this.controls.up.isDown || this.controls.w.isDown) && this.player.body.onFloor()) {
			this.player.body.velocity.y = -500;
		}
		
		// Play the up animation while the player is still going up
		else if (!this.player.body.onFloor() && this.player.body.y < this.previousCoords.y) {
			this.player.play('up');
		}
		
		// Play the down animation while the player is falling down
		else if (!this.player.body.onFloor() && this.player.body.y > this.previousCoords.y) {
			this.player.play('down');
		}

		/* Update player's previous coordinates */
		this.previousCoords.x = this.player.body.x;
		this.previousCoords.y = this.player.body.y;

		if (this.player.body.x < this.slime.body.x && this.slime.body.onFloor()) {
			this.slime.body.velocity.x = -150;
		}
		else if (this.player.body.x > this.slime.body.x && this.slime.body.onFloor()) {
			this.slime.body.velocity.x = 150;
		}

	}
};