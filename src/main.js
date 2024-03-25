//start phina
phina.globalize();
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
        for (let j = 0; j < BLOCK_y_num; j++) {
            for (let i = 0;i < BLOCK_x_num; i++) {
                pos = [i*VAL[0]+SPAN[0],j*VAL[1]+SPAN[1]]
                var block = Block('bar',BLOCK_size, pos).addChildTo(this.block_group);
                var block_shade = Sprite('bar2').addChildTo(block).setPosition(5,5).setSize(BLOCK_size[0],BLOCK_size[1]);
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
    update: function(app){
        this.ball.collision(this.bar);
        lest_num = this.block_collision(this.ball);
        this.elem.canvas.context.drawImage(player, 0, 0, SCREEN_X ,SCREEN_Y);
        detectFace(this.bar);
        this.success_or_failure(lest_num);
    },
    block_collision:function(ball){
        this.block_group.children.each((block) => {
            if (ball.hitTestElement(block)){
                ball.spd[1] *= -1;
                block.remove();
            }
        });
        return this.block_group.children.length;
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
//main function
phina.main(function() {
    var app = GameApp({startLabel: 'main', width: SCREEN_X, height: SCREEN_Y, assets: ASSETS});
    app.run();
});