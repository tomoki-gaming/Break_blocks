//magic
phina.globalize();
//screen size
let SCREEN_X = 640;
let SCREEN_Y = 480;
//video img
const player = document.getElementById('player');
navigator.mediaDevices.getUserMedia({video: true, audio: false})
.then(function(stream){
  player.srcObject = stream;
  player.play();
});
//face detection
Promise.all([faceapi.nets.tinyFaceDetector.load("./models"),]);
const options = new faceapi.TinyFaceDetectorOptions({inputSize:320,scoreThreshold:0.1});
async function detectFace(bar){
    const result = await faceapi.detectSingleFace(player,options);
    if(!result) return;
    bar.x = SCREEN_X-(result._box._x + result._box._width/2);
}
//img asset
var ASSETS = {
    image: {
      'ball': './Image/ball.png',
      'bar' :'./Image/bar.png',
    },
  };
//Display class
phina.define("MainScene", {
    superClass: 'DisplayScene',
    init: function(option) {
        this.superInit(option);
        this.backgroundColor = 'gray';
        //video img
        this.elem  = PlainElement({width: SCREEN_X,height: SCREEN_Y}).addChildTo(this)
        this.elem.setPosition(SCREEN_X/2, SCREEN_Y/2);
        this.elem.canvas.translate( 640, 0 ).scale( -1, 1 );
        //blocks
        var block_group = DisplayElement().addChildTo(this);
        let span = [100,50];
        let interval =[110,35];
        for (let j = 0; j < 4; j++) {
            for (let i = 0;i < 5; i++) {
                var block = Block('bar',100,20).addChildTo(block_group);
                block.setPosition(i*interval[0]+span[0],j*interval[1]+span[1]);
                block.setSize(block.x_size,block.y_size); 
            }
        }
        this.block_group = block_group;
        //ball
        var ball = Ball('ball',32).addChildTo(this).setPosition(320,200);
        ball.setSize(ball.size , ball.size);
        this.ball = ball;
        //bar(player)
        var bar = Bar('bar',100,20).addChildTo(this).setPosition(320,400);
        bar.setSize(bar.x_size,bar.y_size);
        this.bar = bar;
    },
    update: function(app){
        var bar = this.bar
        var ball = this.ball
        // bar.x = app.pointer.x;
        ball.collision(bar);
        this.block_collision(ball);
        this.elem.canvas.context.drawImage(player, 0, 0, SCREEN_X ,SCREEN_Y);
        detectFace(bar);
    },
    block_collision:function(ball){
        this.block_group.children.each(function(block){
            if (ball.hitTestElement(block)){
                ball.spd[1] *= -1;
                block.remove();
            }
        });
    }
});
//bar(player) class
phina.define('Bar', {
    superClass: 'Sprite',
    init: function(image ,x_size,y_size) {
        this.superInit(image);
        this.x_size = x_size;
        this.y_size = y_size;
    },
});
//ball class
phina.define('Ball', {
    superClass: 'Sprite',
    init: function(image, size) {
        this.superInit(image);
        this.spd = [5,5];
        this.size = size;
    },
    collision:function(shape){
        if (this.hitTestElement(shape)){
            this.spd[1]*=-1;
        }
    },
    update: function() {
        this.x += this.spd[0];
        this.y += this.spd[1];
        if (this.x >= SCREEN_X -this.size/2 || this.x <= 0){
            this.spd[0] *= -1;
        }
        if(this.y >= SCREEN_Y -this.size/2 || this.y <= 0){
            this.spd[1] *= -1;
        }
    } 
});
//block class
phina.define('Block', {
    superClass: 'Sprite',
    init: function(image ,x_size,y_size) {
        this.superInit(image);
        this.x_size = x_size;
        this.y_size = y_size;
    },
});
//main function
phina.main(function() {
    var app = GameApp({startLabel: 'main', width: SCREEN_X, height: SCREEN_Y, assets: ASSETS});
    app.run();
});