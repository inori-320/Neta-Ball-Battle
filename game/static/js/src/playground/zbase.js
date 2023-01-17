class GamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`
<div class = "game_palyground">
    游戏界面，开发中！
</div>
        `);
        this.root.$lty.append(this.$playground);
        this.start();
    }

    start(){

    }

    show(){
        this.$playground.show();
    }

    hide(){
        this.$playground.hide();
    }
}
