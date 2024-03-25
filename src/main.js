//magic
phina.globalize();
//screen size
let SCREEN_X = 640;
let SCREEN_Y = 480;
//start delay
let DIREY = 120;
//Block num
let BLOCK_x_num = 7;
let BLOCK_y_num = 6;

//video img
const player = document.getElementById('player');
navigator.mediaDevices.getUserMedia({video: true, audio: false})
.then(function(stream){
  player.srcObject = stream;
  player.play();
});
//face detection
Promise.all([faceapi.nets.tinyFaceDetector.load("../models"),]);
const options = new faceapi.TinyFaceDetectorOptions({inputSize:320,scoreThreshold:0.1});
async function detectFace(bar){
    const result = await faceapi.detectSingleFace(player,options);
    if(!result) return;
    bar.x = SCREEN_X-(result._box._x + result._box._width/2);
    bar.y = result._box._y + result._box._height/4;
}
//img asset
var ASSETS = {
    image: {
      'ball': '../Image/ball.png',
      'ball2': '../Image/ball2.png',
      'bar' : '../Image/bar.png',
      'bar2': '../Image/bar2.png',
    },
  };
//some scene
var myScenes = [
    {
      label: 'Main',
      className: 'MainScene',
      nextLabel: '',
    },
];
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
        let size = [75,15];
        let span = [(640-(BLOCK_x_num-1)*(size[0]+10))/2,25];
        let interval =[size[0]+10,size[1]+10];
        for (let j = 0; j < BLOCK_y_num; j++) {
            for (let i = 0;i < BLOCK_x_num; i++) {
                pos = [i*interval[0]+span[0],j*interval[1]+span[1]]
                var block_shade = Block('bar2',size ,[pos[0]+5,pos[1]+5]).addChildTo(this.block_group);
                var block = Block('bar',size, pos).addChildTo(this.block_group);
            }
        }
        //ball and bar
        this.ball = Ball('ball',32).addChildTo(this);
        this.bar = Bar('bar',100).addChildTo(this);
        //success
        this.label = Label({text:'',fill:"red"}).addChildTo(this);
        this.label.setPosition(SCREEN_X/2, SCREEN_Y/2);
        //success(1) or failure(~-1) or playing(0)
        this.success_count = 0;
    },
    update: function(){
        this.ball.collision(this.bar);
        lest_num = this.block_collision(this.ball);
        this.elem.canvas.context.drawImage(player, 0, 0, SCREEN_X ,SCREEN_Y);
        detectFace(this.bar);
        this.success_or_failure(lest_num);
    },
    block_collision:function(ball){
        for(let i=0 ;i<this.block_group.children.length;i+=2){
            if (ball.hitTestElement(this.block_group.children[i+1])){
                ball.spd[1] *= -1;
                this.block_group.children[i].remove();
                this.block_group.children[i].remove();
            }
        }
        return this.block_group.children.length/2;
    },
    success_or_failure:function(lest_num){
        if(this.success_count < 0){
            this.success_count -= 1;
            if(this.success_count <= -DIREY){
                this.exit({nextLabel: 'main'});
            }
        }
        else if (lest_num == 0 ){
            this.label.text = 'SUCCESS';
            this.success_count = -1;
        }
        else if(this.ball.y > SCREEN_Y-this.ball.size){
            this.label.text = 'FAILURE';
            this.success_count = -1;
        }
    }
});
//bar class
phina.define('Bar', {
    superClass: 'Sprite',
    init: function(image ,size) {
        this.superInit(image);
        this.col_flag = 0;
        this.setPosition(320,400);
        this.setSize(size, size/5);
    },
});
//ball class
phina.define('Ball', {
    superClass: 'Sprite',
    init: function(image, size) {
        this.superInit(image);
        this.spd = [5,5];
        this.time_flag = 0;
        this.setPosition(320,200)
        this.setSize(size, size);
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
    init: function(image ,size ,pos) {
        this.superInit(image);
        this.setSize(size[0] ,size[1]);
        this.setPosition(pos[0] ,pos[1]);
    },
});
//main function
phina.main(function() {
    var app = GameApp({startLabel: 'main', width: SCREEN_X, height: SCREEN_Y, assets: ASSETS});
    app.run();
});