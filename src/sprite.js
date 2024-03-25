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
//block class
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
//ball class
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