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