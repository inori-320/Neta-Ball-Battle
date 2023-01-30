class GamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`
<div class = "game_playground">
</div>
        `);
        this.root.$lty.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.height * 0.2, "pink", true));

        for(let i = 0; i < 5; i++){
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.height * 0.2, this.random_color(), false));
        }

        this.start();
    }

    start(){
    }

    random_color() {
        let colors = ["blue", "green", "red", "pink", "grey", "purple"];
        return colors[Math.floor(Math.random() * 6)];
    }

    show(){
        this.$playground.show();
    }

    hide(){
        this.$playground.hide();
    }
}
