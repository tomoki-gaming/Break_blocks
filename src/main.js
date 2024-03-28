phina.globalize();
//画像アセット
var ASSETS = {
    image: {
      'ball': '../Image/ball.png',
      'ball2': '../Image/ball2.png',
      'bar' : '../Image/bar.png',
      'bar2': '../Image/bar2.png',
    },
  };
//シーン管理
var myScenes = [
    {
      label: 'Main',
      className: 'MainScene',
      nextLabel: '',
    },
];
//画面サイズ
let SCREEN_X = 640;
let SCREEN_Y = 480;
//遅延定数
let DIREY = 120;
//ブロック定数
let BLOCK_x_num = 7;
let BLOCK_y_num = 6;
let BLOCK_size = [75,15];
let SPAN = [(640-(BLOCK_x_num-1)*(BLOCK_size[0]+10))/2,25];
let VAL =[BLOCK_size[0]+10,BLOCK_size[1]+10];

//ビデオキャプチャ
const player = document.getElementById('player');
navigator.mediaDevices.getUserMedia({video: true, audio: false})
.then(function(stream){
  player.srcObject = stream;
  player.play();
});
//顔認識
Promise.all([faceapi.nets.tinyFaceDetector.load("../models"),]);
const options = new faceapi.TinyFaceDetectorOptions({inputSize:320,scoreThreshold:0.1});
async function detectFace(bar){
    const result = await faceapi.detectSingleFace(player,options);
    if(!result) return;
    bar.x = SCREEN_X-(result._box._x + result._box._width/2);
    bar.y = result._box._y + result._box._height/4;
}
//メインシーン
phina.define("MainScene", {
    superClass: 'DisplayScene',
    init: function(option) {
        this.superInit(option);
        this.backgroundColor = 'gray';
        //ビデオ
        this.elem  = PlainElement({width: SCREEN_X,height: SCREEN_Y}).addChildTo(this)
        this.elem.setPosition(SCREEN_X/2, SCREEN_Y/2);
        this.elem.canvas.translate( 640, 0 ).scale( -1, 1 );
        //ブロック
        this.block_group = DisplayElement().addChildTo(this);
        for (let j = 0; j < BLOCK_y_num; j++) {
            for (let i = 0;i < BLOCK_x_num; i++) {
                pos = [i*VAL[0]+SPAN[0],j*VAL[1]+SPAN[1]]
                var block = Block('bar',BLOCK_size, pos).addChildTo(this.block_group);
                var block_shade = Sprite('bar2').addChildTo(block).setPosition(5,5).setSize(BLOCK_size[0],BLOCK_size[1]);
            }
        }
        //ボールとバー
        this.ball = Ball('ball',32).addChildTo(this);
        this.bar = Bar('bar',100).addChildTo(this);
        //文字(成功or失敗)
        this.label = Label({text:'',fill:"red"}).addChildTo(this);
        this.label.setPosition(SCREEN_X/2, SCREEN_Y/2);
        //成功(1)or失敗(~-1)orプレイ中(0)
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
        //ブロックとの衝突判定
        this.block_group.children.each((block) => {
            if (ball.hitTestElement(block)){
                ball.spd[1] *= -1;
                block.remove();
            }
        });
        return this.block_group.children.length;
    },
    success_or_failure:function(lest_num){
        //成功or失敗判定後，シーン遷移
        if(this.success_count < 0){
            this.success_count -= 1;
            if(this.success_count <= -DIREY){
                this.exit({nextLabel: 'main'});
            }
        }
        //ボールが残っていなかったら成功
        else if (lest_num == 0 ){
            this.label.text = 'SUCCESS';
            this.success_count = -1;
        }
        //ボールが下枠に触れたら失敗
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

//バー(プレイヤー)クラス
phina.define('Bar', {
    superClass: 'Sprite',
    init: function(image ,size) {
        this.superInit(image);
        this.col_flag = 0;
        this.setPosition(320,400);
        this.setSize(size, size/5);
    },
});
//ブロッククラス
phina.define('Block', {
    superClass: 'Sprite',
    init: function(image ,size ,pos) {
        this.superInit(image);
        this.size = size;
        this.pos = pos;
        this.setSize(this.size[0] ,this.size[1]);
        this.setPosition(this.pos[0] ,this.pos[1]);
    },
});
//ボールクラス
phina.define('Ball', {
    superClass: 'Sprite',
    init: function(image, size) {
        this.superInit(image);
        this.spd = [5,5];
        this.size = size;
        this.time_flag = 0;
        this.setPosition(320,200)
        this.setSize(this.size, this.size);
    },
    collision:function(shape){
        //ブロックとの衝突判定
        if (this.hitTestElement(shape) && shape.col_flag==0){
            this.spd[1]*=-1;
            shape.col_flag = 30;
        }
        else if(shape.col_flag > 0){
            shape.col_flag-=1;
        }
    },
    update: function() {
        //遅延してゲームスタート
        if(this.time_flag > DIREY){
            this.x += this.spd[0];
            this.y += this.spd[1];
        }
        else{
            this.time_flag+=1;
        }
        //壁反射
        if (this.x >= SCREEN_X -this.size/2 || this.x <= 0){
            this.spd[0] *= -1;
        }
        if(this.y >= SCREEN_Y -this.size/2 || this.y <= 0){
            this.spd[1] *= -1;
        }
    } 
});