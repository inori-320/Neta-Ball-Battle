class MultiPlayer{
    constructor(playground){
        this.playground = playground;

        this.ws = new WebSocket("wss://8.130.15.181:8000/wss/multiplayer/");

        this.start();
    }

    start(){
    }

    send_create_player(){
        this.ws.send(JSON.stringify({
            'message': "hello server",
        }));
    }

    receive_create_player(){

    }

}
