class GameSettings{
    constructor(root){
        this.root = root;

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

