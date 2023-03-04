class MultiPlayer{
    constructor(playground){
        this.playground = playground;

        this.ws = new WebSocket("wss://app4634.acapp.acwing.com.cn/wss/multiplayer/");

        this.start();
    }

    start(){
        this.handle_receive();
    }

    handle_receive(){
        let outer = this;
        this.ws.onmessage = function(s) {
            let data = JSON.parse(s.data);
            let event = data.event;
            let uid = data.uid;
            if(uid === outer.uid) return false;
            if (event === "create_player"){
                outer.receive_create_player(uid, data.username, data.photo);
            } else if (event === "move"){
                outer.receive_move(uid, data.tx, data.ty);
            }
        }
    }

    get_player(uid){
        let players = this.playground.players;
        for (let i = 0; i < players.length; i++){
            let player = players[i];
            if(player.uid === uid) return player;
        }
        return null;
    }

    send_create_player(username, photo){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "create_player",
            'uid': outer.uid,
            'username': username,
            'photo': photo,
        }));
    }

    receive_create_player(uid, username, photo){
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo
        );

        player.uid = uid;
        this.playground.players.push(player);
    }

    send_move(tx, ty){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event': "move",
            'uid': outer.uid,
            'tx':tx,
            'ty': ty,
        }));
    }

    receive_move(uid, tx, ty){
        let outer = this;
        let player = this.get_player(uid);
        if(player){
            player.move(tx, ty);
        }
    }
}
