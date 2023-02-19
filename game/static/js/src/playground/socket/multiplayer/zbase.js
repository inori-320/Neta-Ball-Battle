class MultiPlayer{
    constructor(playground){
        this.playground = playground;

        this.ws = new WebSocket("wss://8.130.15.181:8000/wss/multiplayer/");

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
            }
        }
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

}
