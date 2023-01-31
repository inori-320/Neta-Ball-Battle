class Player extends GameObject {
    constructor(playground, x, y, r, speed, color, is_me){
        super();
        this.x = x;
        this.y = y;
        this.playground = playground;
        this.r = r;
        this.speed = speed;
        this.color = color;
        this.is_me = is_me;
        this.ctx = this.playground.game_map.ctx;
        this.eps = 0.1;
        this.vx = 0;
        this.vy = 0;
        this.damvx = 0;
        this.damvy = 0;
        this.damspeed = 0;
        this.move_length = 0;
        this.cur_skill = null;
        this.cold_time = 0;
        this.friction = 0.7;
    }

    start(){
        if(this.is_me){
            this.listen_events();
        }
        else{
            let tx = Math.random() * this.playground.width;
            let ty = Math.random() * this.playground.height;
            this.move(tx, ty);
        }
    }

    listen_events(){
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function() {
            return false;
        })
        this.playground.game_map.$canvas.mousedown(function(tmp) {
            if (tmp.which === 3) {
                outer.move(tmp.clientX, tmp.clientY);
            } else if (tmp.which === 1){
                if(outer.cur_skill === "fireball"){
                    outer.shoot_ball(outer.cur_skill, tmp.clientX, tmp.clientY);
                }

                outer.cur_skill = null;
            }
        })

        $(window).keydown(function(tmp) {
                if (tmp.which === 81){           //表示Q键，详见keycode对照表
                    outer.cur_skill = "fireball";
                    return false;
                }
            })
    }

    shoot_ball(cur, tx, ty){
        let x = this.x;
        let y = this.y;
        let r = this.playground.height * 0.02;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle);
        let vy = Math.sin(angle);
        if(cur === "fireball"){
            let color = "orange";
            let speed = this.playground.height * 0.5;
            let move_length = this.playground.height * 0.8;
            new FireBall(this.playground, this, x, y, r, vx, vy, color, speed, move_length, this.playground.height * 0.01);
        }
    }

    get_dist(x1, x2, y1, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dy * dy + dx * dx);
    }

    move(tx, ty){
        this.move_length = this.get_dist(this.x, tx, this.y, ty);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    attacked(angle, damage){
        for (let i = 0; i < 10 + Math.random() * 8; i++){
            let x = this.x;
            let y = this.y;
            let r = this.r * Math.random() * 0.2;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle);
            let vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.r * Math.random() * 7;
            new Particle(this.playground, x, y, r, vx, vy, speed, color, move_length);
        }
        this.r -= damage;
        if (this.r < 10){
            this.del();
            return false;
        } else {
            this.damvx = Math.cos(angle);
            this.damvy = Math.sin(angle);
            this.damspeed = damage * 70;
        }
    }

    update(){
        this.render();
        this.cold_time += this.timedelta / 1000;
        if(!this.is_me && this.cold_time > 3 && Math.random() < 1 / 250.0){
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            let tx = player.x + player.speed * this.vx * this.timedelta / 1000 * 0.3;
            let ty = player.y + player.speed * this.vy * this.timedelta / 1000 * 0.3;
            this.shoot_ball("fireball", tx, ty);
        }
        if(this.damspeed > 9) {
            this.vx = this.vy = this.move_length = 0;
            this.x += this.damvx * this.damspeed * this.timedelta / 1000;
            this.y += this.damvy * this.damspeed * this.timedelta / 1000;
            this.damspeed *= this.friction;
        } else {
            if(this.move_length < this.eps){
                this.move_length = this.vx = this.vy = 0;
                if(!this.is_me){
                    let tx = Math.random() * this.playground.width;
                    let ty = Math.random() * this.playground.height;
                    this.move(tx, ty);
                }
            } else {
                let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
    }

    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.r, 0, Math.PI*2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_del(){
        for(let i = 0; i < this.playground.players.length; i++){
            if(this.playground.players[i] === this){
                this.playground.players.splice(i, 1);
            }
        }
    }
}
