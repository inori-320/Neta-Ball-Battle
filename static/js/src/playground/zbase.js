class GamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`
<div class = "game_playground">
</div>
        `);
        this.hide();
        this.root.$lty.append(this.$playground);

        this.start();
    }

    create_uid(){
        let ans = "";
        for(let i = 0; i < 8; i++){
            let x = parseInt(Math.floor(Math.random() * 10));
            ans += x;
        }
        return ans;
    }

    start(){
        let outer = this;
        let uid = this.create_uid();
        $(window).on(`resize.${uid}`, function(){
            outer.resize();
        });

        if(this.root.AcWingOS) {
            this.root.AcWingOS.api.window.on_close(function() {
                $(window).off(`resize.${uid}`);
            });
        }
    }

    resize(){
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 20, this.height / 9.5);
        this.width = unit * 20;
        this.height = unit * 9.5;
        this.scale = this.height;

        if(this.game_map) this.game_map.resize();
    }

    random_color() {
        let colors = ["blue", "green", "red", "white", "grey", "purple"];
        return colors[Math.floor(Math.random() * 6)];
    }

    show(mode){
        let outer = this;
        this.$playground.show();
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.mode = mode;
        this.state = "waiting";
        this.notice_board = new NoticeBoard(this);
        this.score_board = new ScoreBoard(this);
        this.player_count = 0;
        this.resize();

        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5 , 0.05, 0.2, "pink", "me", this.root.settings.username, this.root.settings.photo));
        if(mode === "single mode"){
            for(let i = 0; i < 5; i++){
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, 0.2, this.random_color(), "robot"));
            }
        } else if(mode === "multi mode"){
            this.chat_field = new ChatField(this);
            this.mps = new MultiPlayer(this);
            this.mps.uid = this.players[0].uid;

            this.mps.ws.onopen = function(){
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            };
        }
    }

    hide(){     // 关闭playground界面
        while(this.players && this.players.length > 0){
            this.players[0].destroy();
        }

        if(this.game_map){
            this.game_map.destroy();
            this.game_map = null;
        }
        if(this.notice_board){
            this.notice_board.destroy();
            this.notice_board = null;
        }
        if(this.score_board){
            this.score_board.destroy();
            this.score_board = null;
        }
        this.$playground.empty();

        this.$playground.hide();
    }
}
