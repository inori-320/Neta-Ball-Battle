let GAME_OBJECT = [];

class GameObject{
    constructor(){
        GAME_OBJECT.push(this);

        this.called_start = false;
        this.timedelta = 0;
        this.uid = this.create_uid();
    }

    create_uid(){
        let outer = this;
        let res = "";
        for(let i = 0; i < 8; i ++){
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }
        return res;
    }

    start(){    //只会在创建时执行一次
    }

    late_update(){      // 在每一帧的最后执行一次
    }

    update(){   //每一帧均会执行一次
    }

    on_del(){
    }

    del(){
        this.on_del();

        for (let i = 0; i < GAME_OBJECT.length; i++ ){
            if (GAME_OBJECT[i] === this){
                GAME_OBJECT.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;

let Game_Animation = function(timestamp) {
    for (let i = 0; i < GAME_OBJECT.length; i++) {
        let obj = GAME_OBJECT[i];
        if (!obj.called_start) {
            obj.start();
            obj.called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }

    for(let i = 0; i < GAME_OBJECT.length; i++){
        let obj = GAME_OBJECT[i];
        obj.late_update();
    }

    last_timestamp = timestamp;

    requestAnimationFrame(Game_Animation);
}

requestAnimationFrame(Game_Animation);
