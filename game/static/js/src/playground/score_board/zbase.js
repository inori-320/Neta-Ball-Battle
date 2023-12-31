class ScoreBoard extends GameObject{
    constructor(playground){
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.state = null; // 两种状态：win or lose

        this.win_img = new Image();
        this.lose_img = new Image();

        this.win_img.src = "https://app4634.acapp.acwing.com.cn/static/image/playground/win.png";
        this.lose_img.src = "https://app4634.acapp.acwing.com.cn/static/image/playground/lose.png";
    }

    start(){
    }

    listening_events(){
        let outer = this;
        let $canvas = this.playground.game_map.$canvas;

        $canvas.on('click', function(){
            outer.playground.hide();
            outer.playground.root.menu.show();
        });
    }

    win(){
        this.state = "win";
        let outer = this;
        setTimeout(function(){
            outer.listening_events();
        }, 1000);
    }

    lose(){
        this.state = "lose";
        let outer = this;
        setTimeout(function(){
            outer.listening_events();
        }, 1000);
    }

    render(){
        let len = this.playground.height / 2;
        if(this.state === "win"){
            this.ctx.drawImage(this.win_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        } else if(this.state === "lose"){
            this.ctx.drawImage(this.lose_img, this.playground.width / 2 - len / 2, this.playground.height / 2 - len / 2, len, len);
        }
    }

    late_update(){
        this.render();
    }
}
