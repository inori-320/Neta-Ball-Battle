let GAME_OBJECT = [];

class GameObject{
    constructor(){
        GAME_OBJECT.push(this);

        this.called_start = false;
        this.timedelta = 0;
    }

    start(){
    }

    update(){
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
    last_timestamp = timestamp;

    requestAnimationFrame(Game_Animation);
}

requestAnimationFrame(Game_Animation);
