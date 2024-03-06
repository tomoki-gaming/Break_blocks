//magic
phina.globalize();
//screen size
let SCREEN_X = 640;
let SCREEN_Y = 480;
//start delay
let DIREY = 120;
//Block num
let BLOCK_x_num = 5;
let BLOCK_y_num = 4;

let block_remove_num = 0;

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
        this.block_group = DisplayElement().addChildTo(this);
        let span = [100,50];
        let interval =[110,35];
        for (let j = 0; j < BLOCK_y_num; j++) {
            for (let i = 0;i < BLOCK_x_num; i++) {
                var block = Block('bar',100,20).addChildTo(this.block_group);
                block.setPosition(i*interval[0]+span[0],j*interval[1]+span[1]);
                block.setSize(block.x_size,block.y_size); 
            }
        }
        //ball
        this.ball = Ball('ball',32).addChildTo(this).setPosition(320,200);
        this.ball.setSize(this.ball.size, this.ball.size);
        //bar(player)
        this.bar = Bar('bar',100,20).addChildTo(this).setPosition(320,400);
        this.bar.setSize(this.bar.x_size, this.bar.y_size);
        //success
        this.label = Label({text:'',fill:"red"}).addChildTo(this);
        this.label.setPosition(SCREEN_X/2, SCREEN_Y/2);
    },
    update: function(){
        this.ball.collision(this.bar);
        this.block_collision(this.ball);
        this.elem.canvas.context.drawImage(player, 0, 0, SCREEN_X ,SCREEN_Y);
        detectFace(this.bar);
        this.success_or_failure();
    },
    block_collision:function(ball){
        this.block_group.children.each(function(block){
            if (ball.hitTestElement(block)){
                ball.spd[1] *= -1;
                block.remove();
                block_remove_num += 1;//
            }
        });
    },
    success_or_failure:function(){
        if (block_remove_num >= BLOCK_x_num*BLOCK_y_num){
            this.label.text = 'SUCCESS';
        }
        else if(this.ball.y > SCREEN_Y-this.ball.size){
            this.label.text = 'FAILURE';
        }
    }
});
//bar(player) class
phina.define('Bar', {
    superClass: 'Sprite',
    init: function(image ,x_size,y_size) {
        this.superInit(image);
        this.x_size = x_size;
        this.y_size = y_size;
        this.col_flag = 0;
    },
});
//ball class
phina.define('Ball', {
    superClass: 'Sprite',
    init: function(image, size) {
        this.superInit(image);
        this.spd = [5,5];
        this.size = size;
        this.time_flag = 0;
    },
    collision:function(shape){
        if (this.hitTestElement(shape) && shape.col_flag==0){
            this.spd[1]*=-1;
            shape.col_flag = 30;
        }
        else if(shape.col_flag > 0){
            shape.col_flag-=1;
        }
    },
    update: function() {
        //delay to start
        if(this.time_flag > DIREY){
            this.x += this.spd[0];
            this.y += this.spd[1];
        }
        else{
            this.time_flag+=1;
        }

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