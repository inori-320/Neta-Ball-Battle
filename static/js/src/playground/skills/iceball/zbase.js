class IceBall extends GameObject {
    constructor(playground, player, x, y, r, vx, vy, color, speed, move_length, damage){
        super();
        this.playground = playground;
        this.player = player;
        this.x = x;
        this.y = y;
        this.r = r;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.ctx = this.playground.game_map.ctx;
        this.damage = damage;
        this.eps = 0.01;
        this.skill = "iceball";
    }

    start(){
    }

    update(){
        if (this.move_length < this.eps){
            this.destroy();
            return false;
        }
        this.update_move();

        if(this.player.character !== "enemy"){
            this.update_attack();
        }
        this.update_attack();

        this.render();
    }

    update_move(){
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.move_length -= moved;
    }

    update_attack(){
        for(let i = 0; i < this.playground.players.length; i++){
             let player = this.playground.players[i];
             if(this.player !== player && this.is_collision(player)){
                 this.attack(player);
                 break;
             }
         }
    }

    get_dist(x1, x2, y1, y2){
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    is_collision(player){
        let distance = this.get_dist(this.x, player.x, this.y, player.y);
        if (distance < this.r + player.r){
            return true;
        }
        return false;
    }

    attack(player){
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.attacked(angle, this.damage, this.skill);

        if (this.playground.mode === "multi mode"){
            this.playground.mps.send_attack(player.uid, player.x, player.y, angle, this.damage, this.uid, this.skill);
        }

        this.destroy();
    }

    render(){
        let scale = this.playground.scale;
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.r * scale, 0, Math.PI*2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy(){
        let iceballs = this.player.iceballs;
        for(let i = 0; i < iceballs.length; i++){
            if(iceballs[i] === this){
                iceballs.splice(i, 1);
                break;
            }
        }
    }
}

