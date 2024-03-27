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