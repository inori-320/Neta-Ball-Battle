export class Game{
    constructor(id, AcWingOS){
        this.id = id;
        this.$lty = $('#' + id);
        this.AcWingOS = AcWingOS;
        this.settings = new GameSettings(this);
        this.menu = new GameMenu(this);
        this.playground = new GamePlayground(this);

        this.start();
    }

    start(){
    }
}
