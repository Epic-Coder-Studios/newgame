//canvas stuff
const canvas = document.querySelector("canvas")
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

const scoreEl = document.querySelector('#scoreEl')
const startBtn = document.querySelector('#startButton')
const modal = document.querySelector('#menu')
const bigScore = document.querySelector('#big-score')
const speed = 5



class Sound {
    constructor (src,vol){
        this.sound = document.createElement('audio')
        this.sound.src = src;
        this.sound.setAttribute("preload", "auto");
        this.sound.setAttribute("controls", "none");
        this.sound.style.display = "none";
        this.sound.volume = vol || 1.0
        document.body.appendChild(this.sound);
    }
    play (){
        this.sound.play();
        
    }
    stop (){
        this.sound.pause();
    }
}

class Player {
    constructor (x,y,radius,color){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw(){
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,Math.PI * 2,false)
        c.fillStyle = this.color
        c.fill()
    }
}

class Projectile {
    constructor(x,y,radius,color,velocity,speed){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        
    }
    draw(){
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,Math.PI * 2,false)
        c.fillStyle = this.color
        c.fill()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy {
    constructor(x,y,radius,color,velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw(){
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,Math.PI * 2,false)
        c.fillStyle = this.color
        c.fill()
    }
    update() {
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}
const friction = 0.97
class Particle {
    constructor(x,y,radius,color,velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }
    draw(){
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x,this.y,this.radius,0,Math.PI * 2,false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }
    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
        
    }
}

const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 10, 'white')
let projectiles = []
let enemies = []
let particles = []

function init (){
    particles = []
    player = new Player(x, y, 10, 'white')
    projectiles = []
    enemies = []
    score = 0
    scoreEl.innerHTML = score
    bigScore.innerHTML = score
    bleep = new Sound('bleep.mp3')
    shoot = new Sound('shhot.mp3')
    track = new Sound('track.mp3',0.2)
    
    track.play()
}


function spawnEnemies(){
     setInterval(() =>{
        const radius = Math.random() * (30 - 10) + 10

        let x
        let y 

        if (Math.random < 0.5){
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }

        const color = `hsl(${Math.random() * 360},50%,50%)`

        const angle = Math.atan2(
            canvas.height / 2 - y,
            canvas.width / 2 - x 
        )
        const velocity = {
            x:Math.cos(angle),
            y:Math.sin(angle)
        }
        enemies.push(new Enemy(x,y,radius,color,velocity))
    },1000)
}

const projectile = new Projectile(
    canvas.width / 2,
    canvas.height / 2,
    5,
    'white',
    {
        x:1,
        y:1
    }
    
)
let anmationId
let score = 0
function animate (){
    
    animationId = requestAnimationFrame(animate)
    //color background lol
    c.fillStyle = 'rgba(0,0,0,0.1)'
    c.fillRect(0, 0, canvas.width,canvas.height)
    player.draw()
    particles.forEach((particle, index) =>{
        if(particle.alpha <= 0){
            particles.splice(index, 1)
        }else{
           particle.update() 
        }
        
    })
    projectiles.forEach((projectile, index) =>{
        projectile.update()
        
        //remove from edge of screen
        if(projectile.x + projectile.radius < 0 ||
           projectile.x - projectile.radius > canvas.width ||
           projectile.y + projectile.radius < 0 ||
           projectile.y - projectile.radius > canvas.height){
            setTimeout(() =>{
                projectiles.splice(index, 1)
            }, 0)
        }
    })
    enemies.forEach((enemy,index) => {
        //run enemies for each one
        enemy.update()
        const dist = Math.hypot(
            player.x - enemy.x,
            player.y - enemy.y
            )

        if (dist - enemy.radius - player.radius< 1){
            console.log("rip bozo")
            explode = new Sound('explode.mp3')
            explode.play()
            cancelAnimationFrame(animationId)
            modal.style.display = 'flex'
            bigScore.innerHTML = score
            track.stop()
        }        
            
        projectiles.forEach((projectile,projectileIndex) =>{
            //calculate distance
            const dist = Math.hypot(
                projectile.x - enemy.x,
                projectile.y - enemy.y
                )
            //if collide    
            if (dist - enemy.radius - projectile.radius< 1){
                explode = new Sound('explode.mp3')
                explode.play()
                //create explosion
                for (let i = 0; i < enemy.radius * 2; i++){
                    particles.push(new Particle(
                        projectile.x,
                        projectile.y,
                        Math.random() * 2,
                        enemy.color,{
                        x: (Math.random() - 0.5) * (Math.random() * 8),
                        y: (Math.random() - 0.5) * (Math.random() * 8)
                    }))
                    
                }
                if (enemy.radius - 10 > 10){
                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    projectiles.splice(projectileIndex, 1)
                }else{
                    score += 100
                    scoreEl.innerHTML = score
                    console.log(score)
                    setTimeout(() =>{
                        
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                }
            }
        })
    })
}

addEventListener('click', (event) => {
    // console.log(projectiles)
    const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2
        )
    const velocity = {
        x:Math.cos(angle) * speed,
        y:Math.sin(angle) * speed
    }
    // console.log(angle)
    projectiles.push(new Projectile(
        canvas.width / 2,
        canvas.height / 2,
        5,
        'white',
        velocity
        
    ))
    shoot.play()

})
startBtn.addEventListener('click',() => {
    
    init()
    animate()
    spawnEnemies()
    modal.style.display = 'none'
    bleep.play()
    
})
