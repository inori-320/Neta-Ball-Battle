class GameSettings{
    constructor(root){
        this.root = root;
        this.$settings = $(`
<div class = "game_settings">
设置界面，开发中！！
</div>
        `);

        this.root.$lty.append(this.$settings);
        this.start();
    }

    start(){
    }

    show(){
        this.$setting.show();
    }

    hide(){
        this.$setting.hide();
    }
}

